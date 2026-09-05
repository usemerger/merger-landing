// Same-origin API client (§1).
//
// Every call here uses a RELATIVE /api/... path. next.config.js rewrites those to
// https://api.buildmerger.com/api/... server-side, so from the browser's point of view
// the API is first-party. That is what lets the backend's HttpOnly, Secure,
// SameSite=Lax `merger_session` cookie be sent and stored normally.
//
// Never point a browser fetch at api.buildmerger.com directly — a Lax cookie would not
// travel on a cross-site XHR and every authenticated call would 401.

/**
 * Thrown for any non-2xx API response. `code` is the backend's machine-readable
 * `error` string (e.g. 'email_taken', 'handle_taken', 'invalid_credentials').
 */
export class ApiError extends Error {
  constructor(status, code, body) {
    super(code || `request_failed_${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      // credentials:'include' keeps the session cookie flowing on same-origin calls.
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'network_error', null);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, data && data.error, data);
  }
  // Some endpoints answer 200 with an {error: ...} envelope rather than a 4xx.
  if (data && data.error) {
    throw new ApiError(res.status, data.error, data);
  }
  return data;
}

/* ---------------- auth ---------------- */

export const signup = (email, password, displayName) =>
  request('/api/auth/signup', {
    method: 'POST',
    body: { email, password, ...(displayName ? { displayName } : {}) },
  });

export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: { email, password } });

export const logout = () => request('/api/auth/logout', { method: 'POST' });

/**
 * Request a reset email. The backend answers {ok:true} whether or not the address
 * is registered, so callers must show the same neutral confirmation either way and
 * never branch on the result — doing so would leak which emails have accounts.
 */
export const forgotPassword = (email) =>
  request('/api/auth/password/forgot', { method: 'POST', body: { email } });

/** Complete a reset with the single-use token from the emailed link. */
export const resetPassword = (token, password) =>
  request('/api/auth/password/reset', { method: 'POST', body: { token, password } });

export const me = () => request('/api/auth/me');

/** Resolves to the current user, or null when there is no valid session. */
export async function meOrNull() {
  try {
    return await me();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/* ---------------- handles ---------------- */

export const handleAvailable = (handle) =>
  request(`/api/handles/${encodeURIComponent(handle)}/available`);

export const claimHandle = (handle) =>
  request('/api/me/handle', { method: 'POST', body: { handle } });

/* ---------------- billing ---------------- */

export const billingStatus = () => request('/api/billing/status');

/** Returns the hosted Stripe Checkout URL. No card data ever touches this app. */
export const checkout = (plan, seats) =>
  request('/api/billing/checkout', {
    method: 'POST',
    body: { plan, ...(seats ? { seats } : {}) },
  });

/** Returns the hosted Stripe Customer Portal URL. */
export const billingPortal = () => request('/api/billing/portal', { method: 'POST' });

/* ---------------- download ---------------- */

export const download = () => request('/api/download');

/* ---------------- presentation helpers ---------------- */

export const PLANS = {
  operator: { id: 'operator', name: 'Operator', price: 79, perSeat: false },
  desk: { id: 'desk', name: 'Desk', price: 159, perSeat: true },
};

/** Entitlement states that unlock the product. */
export const ENTITLED_STATUSES = ['trialing', 'active'];

export function statusLabel(status) {
  switch (status) {
    case 'trialing':
      return 'Trialing';
    case 'active':
      return 'Active';
    case 'past_due':
      return 'Past due';
    case 'canceled':
      return 'Canceled';
    case 'none':
      return 'No subscription';
    default:
      return status || 'Unknown';
  }
}

export function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Human-readable message for a backend error code. */
export function errorMessage(err) {
  const code = err && err.code;
  switch (code) {
    case 'email_taken':
      return 'An account already exists for that email. Try signing in instead.';
    case 'invalid_credentials':
      return 'That email and password combination is not right.';
    case 'handle_taken':
      return 'That handle is already taken. Pick another.';
    case 'unknown_plan':
      return 'That plan is not available. Choose Operator or Desk.';
    case 'invalid_token':
      // Reset links are single-use and short-lived, so a rejected token is far
      // more often expired or already spent than genuinely malformed.
      return 'This link has expired or has already been used.';
    case 'weak_password':
      return 'That password is too short. Use at least 8 characters.';
    case 'rate_limited':
      return 'Too many attempts. Wait a minute and try again.';
    case 'network_error':
      return 'Could not reach the server. Check your connection and try again.';
    default: {
      // A backend blip (a 502 from the gateway, say) has no `error` code, and the
      // synthesised message is a bare "request_failed_502" — never show that to a
      // person. Anything unrecognised gets plain language instead.
      const status = err && err.status;
      if (status >= 500) {
        return 'Something went wrong on our end. Please try again in a moment.';
      }
      const code = err && err.message;
      if (!code || /^request_failed_\d+$/.test(code)) {
        return 'Something went wrong. Please try again.';
      }
      return code;
    }
  }
}
