// First-touch attribution: how this browser first arrived at Merger.
//
// Recorded once, on the first page view that carries any signal (UTM tags or
// an outside referrer), and sent with the waitlist join and sign-up so the
// Growth dashboard can say which channel and campaign a member came from.
// Only the referrer's address and the landing page path are kept here; the
// server stores the referrer host alone.

const KEY = 'merger_first_touch';
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const UTM = ['source', 'medium', 'campaign', 'content', 'term'];
const OWN = /(^|\.)(usemerger\.com|buildmerger\.com|localhost|vercel\.app)$/i;

export function touchFrom(search, referrer, path, now = Date.now()) {
  const params = new URLSearchParams(search || '');
  const touch = {};
  for (const key of UTM) {
    const value = (params.get(`utm_${key}`) || '').trim().slice(0, 200);
    if (value) touch[key] = value;
  }
  if (!touch.source && params.get('ref')) { touch.source = 'referral'; touch.medium = touch.medium || 'referral'; }
  let host = '';
  try { host = referrer ? new URL(referrer).hostname : ''; } catch { host = ''; }
  if (host && !OWN.test(host)) touch.referrer = `https://${host}/`;
  if (!Object.keys(touch).length) return null;
  touch.landingPath = (path || '/').split('?')[0].slice(0, 200);
  touch.firstSeenAt = new Date(now).toISOString();
  return touch;
}

export function captureFirstTouch(win = typeof window === 'undefined' ? null : window) {
  if (!win) return null;
  try {
    const existing = readFirstTouch();
    if (existing) return existing;
    const touch = touchFrom(win.location.search, win.document.referrer, win.location.pathname);
    if (touch) win.localStorage.setItem(KEY, JSON.stringify({ ...touch, at: Date.now() }));
    return touch;
  } catch { return null; }
}

export function readFirstTouch(now = Date.now()) {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!value || !(now - value.at < MAX_AGE)) return null;
    const { at, ...touch } = value;
    return touch;
  } catch { return null; }
}
