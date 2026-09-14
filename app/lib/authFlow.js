export const MIN_PASSWORD_LENGTH = 8;
export const normalizeEmail = (value) => String(value || '').trim();
export const normalizeHandle = (value) => String(value || '').trim().toLowerCase();
export const validHandle = (value) => /^[a-z0-9_]{3,30}$/.test(normalizeHandle(value));
export const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export function safeReturnPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u0020\u007f]/.test(decoded) || decoded.startsWith('//')) return fallback;
    const url = new URL(value, 'https://merger.invalid');
    if (url.origin !== 'https://merger.invalid') return fallback;
    if (/^\/(?:login|signup|forgot-password|reset-password)(?:\/|$)/i.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

export function stripeRedirectURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        ['checkout.stripe.com', 'billing.stripe.com'].includes(url.hostname)) return url.href;
  } catch { /* An invalid provider response is recoverable on the current page. */ }
  throw new Error('The secure billing link was invalid. Please try again.');
}

function installerURL(value) {
  try {
    const url = new URL(typeof value === 'object' ? value?.url : value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function normalizeInstallers(payload) {
  const src = payload?.builds || payload?.downloads || payload?.installers || payload?.urls || payload || {};
  const pick = (...keys) => keys.map((key) => installerURL(src[key])).find(Boolean) || null;
  return { macos: pick('macos', 'mac', 'macOS', 'darwin', 'osx'), windows: pick('windows', 'win', 'win32', 'windows64') };
}

// Keep checkout reconciliation sequential: setInterval can overlap slow requests.
export async function pollEntitlement({ read, onStatus, signal, attempts = 8, delay = 1500, wait = abortableDelay }) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!await wait(delay, signal) || signal?.aborted) return { canceled: true };
    try {
      const status = await read();
      if (signal?.aborted) return { canceled: true };
      onStatus(status);
      if (status?.entitled === true) return { entitled: true };
    } catch (error) {
      if (signal?.aborted) return { canceled: true };
      if (error?.status === 401) throw error;
      if (attempt === attempts - 1) return { error };
    }
  }
  return { entitled: false };
}

function abortableDelay(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(false);
    const finish = (value) => { clearTimeout(timer); signal?.removeEventListener('abort', cancel); resolve(value); };
    const cancel = () => finish(false);
    const timer = setTimeout(() => finish(true), ms);
    signal?.addEventListener('abort', cancel, { once: true });
  });
}
