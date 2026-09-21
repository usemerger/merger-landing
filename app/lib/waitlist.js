// The alpha waitlist: two calls, one stored code, one stored referral.
//
// SEPARATE FROM lib/api ON PURPOSE. This module is imported by the landing
// page's hero, which means it lands in that page's own JavaScript chunk — the
// one that already evaluates a ~620ms Three.js bundle for the gem and sits
// right at the edge of where the browser splits that evaluation into two tasks
// instead of one (see lib/useSession for the measurement that established it).
// lib/api carries a ~120-line error table for auth, handles, Stripe and
// DocuSign, none of which a waitlist form can produce. Importing it here would
// put all of that on the critical path to buy four error strings.
//
// So this is deliberately small and self-contained: the same relative /api/…
// paths, the same credentials and timeout behaviour, and only the vocabulary
// the waitlist routes actually speak.
//
// THE CONTRACT, verified against the deployed backend rather than read off a
// document (api.buildmerger.com, 2026-09-20):
//
//   POST /api/waitlist/join  {email, role?, firm?, ref?}
//     200 {ok:true, referralCode, position, referralCount, status:"waiting"}
//     400 {error:"invalid_email"} · 429 {error:"rate_limited"}
//     Idempotent: the same address always returns the same referralCode and
//     never takes a second position. Re-posting is safe.
//
//   GET /api/waitlist/status?code=CODE
//     200 {referralCode, position, referralCount, status}
//     404 {error:"not_found"} for a code the backend does not know.
//     There is no lookup by email — the code is the only key.
//
//   A `ref` that names a real code increments THAT row's referralCount. An
//   unknown or absent ref is accepted and ignored, which is why nothing here
//   validates one before sending it.

/**
 * Where a referral link points, always — not `location.origin`.
 *
 * A link copied off a Vercel preview has to send people to the real site, and
 * the backend echoes this host in its own emails. Deriving it from the current
 * origin would hand someone testing a preview a link that only works for them.
 */
export const SITE_ORIGIN = 'https://usemerger.com';

/** localStorage keys. `merger_ref` is the inbound referral; the other is ours. */
const REF_KEY = 'merger_ref';
const CODE_KEY = 'merger_waitlist';
/** How long an inbound referral stays attributable. */
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Thrown for any non-2xx. `code` is the backend's machine-readable `error`. */
export class WaitlistError extends Error {
  constructor(status, code) {
    super(code || `request_failed_${status}`);
    this.name = 'WaitlistError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(path, {
      method,
      // Same-origin via the /api rewrite in next.config.js, so this is a
      // first-party call and the session cookie (if any) travels normally.
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
    let data = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    const code = data?.error || (typeof data?.detail === 'string' ? data.detail : data?.detail?.error);
    if (!res.ok || code) throw new WaitlistError(res.status, code);
    if (!data || typeof data !== 'object') throw new WaitlistError(res.status, 'invalid_response');
    return data;
  } catch (err) {
    if (err instanceof WaitlistError) throw err;
    throw new WaitlistError(0, controller.signal.aborted ? 'request_timeout' : 'network_error');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Join. `role` is required by this form but optional in the schema, so it is
 * sent only when present rather than as an empty string the backend would then
 * store. Same for `firm` and `ref`.
 */
export function joinWaitlist({ email, role, firm, ref }) {
  return request('/api/waitlist/join', {
    method: 'POST',
    body: {
      email,
      ...(role ? { role } : {}),
      ...(firm ? { firm } : {}),
      ...(ref ? { ref } : {}),
    },
  });
}

/** Look a row up by its referral code. 404 means the code is no longer valid. */
export function waitlistStatus(code) {
  return request(`/api/waitlist/status?code=${encodeURIComponent(code)}`);
}

/* ─────────────────────────── stored state ─────────────────────────────── */

/**
 * Every one of these can throw: Safari in private mode, a browser with site
 * data blocked, an embedded webview. None of it is load-bearing — a lost
 * referral is one uncredited signup, and a lost code just shows the form again
 * — so all of it fails quietly rather than taking the page down.
 */
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* blocked */ }
}

/**
 * A referral code the backend would accept. The codes it mints are 8
 * alphanumerics; this is a little wider so a future format change does not
 * silently start dropping real referrals, and narrow enough that a URL full of
 * junk never reaches the API.
 */
const CODE_SHAPE = /^[A-Za-z0-9_-]{4,64}$/;

export const validCode = (code) => typeof code === 'string' && CODE_SHAPE.test(code);

/**
 * Capture `?ref=` from the current URL and remember it for 30 days.
 *
 * Called on load, before anything is submitted, because the person who follows
 * a referral link is rarely the person who fills in the form in the same
 * minute — they read the page, leave, and come back. Returns the ref that is
 * now in force, whether it arrived just now or a fortnight ago.
 *
 * FIRST REFERRER WINS. A stored ref is not overwritten by a later link: the
 * one who actually introduced Merger is the one who sent the first link, and
 * letting the most recent link win would make the credit trivially stealable
 * by anyone who gets a second click.
 */
export function captureRef(search = typeof location !== 'undefined' ? location.search : '') {
  const stored = storedRef();
  if (stored) return stored;
  let incoming = null;
  try { incoming = new URLSearchParams(search).get('ref'); } catch { incoming = null; }
  if (!validCode(incoming)) return null;
  writeJSON(REF_KEY, { code: incoming, exp: Date.now() + REF_TTL_MS });
  return incoming;
}

/** The referral in force, or null once it has lapsed. */
export function storedRef() {
  const saved = readJSON(REF_KEY);
  if (!saved || !validCode(saved.code)) return null;
  if (typeof saved.exp === 'number' && saved.exp < Date.now()) {
    try { localStorage.removeItem(REF_KEY); } catch { /* blocked */ }
    return null;
  }
  return saved.code;
}

/** Our own code, so a returning visitor sees their position instead of a form. */
export function storedCode() {
  const saved = readJSON(CODE_KEY);
  return saved && validCode(saved.code) ? saved.code : null;
}

export function rememberCode(code) {
  if (validCode(code)) writeJSON(CODE_KEY, { code, at: Date.now() });
}

/** Called when the backend says a stored code no longer exists (404). */
export function forgetCode() {
  try { localStorage.removeItem(CODE_KEY); } catch { /* blocked */ }
}

export const referralLink = (code) => `${SITE_ORIGIN}/?ref=${code}`;

/** Account referrals stay in the backend's environment, including staging. */
export function accountReferralLink(row, fallbackOrigin = typeof location !== 'undefined' ? location.origin : SITE_ORIGIN) {
  if (!validCode(row?.referralCode)) return '';
  try {
    const url = new URL(row.referralUrl);
    if (url.protocol === 'https:' && !url.username && !url.password &&
        url.searchParams.get('ref') === row.referralCode) return url.href;
  } catch { /* Older backends may not include referralUrl. */ }
  try {
    const origin = new URL(fallbackOrigin);
    if (!['https:', 'http:'].includes(origin.protocol) || origin.username || origin.password) return '';
    return `${origin.origin}/?ref=${encodeURIComponent(row.referralCode)}`;
  } catch { return ''; }
}

/* ─────────────────────────── analytics ────────────────────────────────── */

/**
 * §6. No analytics vendor is installed in this app today, so this does not
 * pretend to call one. It publishes the event in the three shapes a vendor
 * added later can pick up without this file changing again:
 *
 *   · `window.dataLayer` — GTM and GA4 both read it
 *   · a `merger:waitlist-join` DOM event — for anything script-tag based
 *   · `plausible()` / `gtag()` when either is already on the page
 *
 * The utm_* parameters ride along here because the join endpoint has no field
 * for them: JoinBody is {email, role, firm, ref} and nothing else, so campaign
 * attribution is an analytics fact rather than a backend one.
 */
export function trackJoin({ position, referralCount, ref, search = '' }) {
  let utm = {};
  try {
    const params = new URLSearchParams(search);
    for (const [key, value] of params) {
      if (key.startsWith('utm_') && value) utm[key] = value.slice(0, 120);
    }
  } catch { utm = {}; }

  const payload = {
    event: 'waitlist_join',
    position,
    referralCount,
    // Who sent them, if anyone. 'direct' rather than null so the two cases are
    // distinguishable in a report without a null check in the query.
    referralSource: ref || 'direct',
    ...utm,
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch { /* nothing to push to */ }
  try { window.dispatchEvent(new CustomEvent('merger:waitlist-join', { detail: payload })); } catch { /* ignore */ }
  try { window.plausible?.('waitlist_join', { props: payload }); } catch { /* ignore */ }
  try { window.gtag?.('event', 'waitlist_join', payload); } catch { /* ignore */ }
}

/* ─────────────────────────── messages ─────────────────────────────────── */

/** Plain language for every reply this form can actually produce. */
export function waitlistError(err) {
  switch (err?.code) {
    case 'invalid_email':
      return 'That email address does not look right. Check it and try again.';
    case 'rate_limited':
      return 'Too many attempts from here. Wait a minute and try again.';
    case 'network_error':
      return 'Could not reach the server. Check your connection and try again.';
    case 'request_timeout':
      return 'That took longer than expected. Please try again.';
    // NOT REACHABLE IN PRODUCTION, and worded so nobody wastes an afternoon on
    // it when it appears anywhere else. The backend refuses state-changing
    // requests from an origin it does not know, and its allowlist holds
    // usemerger.com and www.usemerger.com — so a Vercel preview URL or
    // localhost gets this, and the live site never can. Confirmed by testing:
    // the same POST is 200 from usemerger.com and 403 origin_not_allowed from
    // a preview host. The fix is to add the origin to MERGER_ALLOWED_ORIGINS
    // on the backend, not to change anything here.
    case 'origin_not_allowed':
      return 'This preview is not on the backend’s allowed-origins list, so joining is blocked here. '
        + 'The live site is unaffected.';
    default:
      if (err?.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
      if (err?.status === 429) return 'Too many attempts from here. Wait a minute and try again.';
      return 'Something went wrong. Please try again.';
  }
}
