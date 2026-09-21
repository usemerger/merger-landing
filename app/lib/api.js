// Same-origin API client (Â§1).
//
// Every call here uses a RELATIVE /api/... path. next.config.js rewrites those to
// https://api.buildmerger.com/api/... server-side, so from the browser's point of view
// the API is first-party. That is what lets the backend's HttpOnly, Secure,
// SameSite=Lax `merger_session` cookie be sent and stored normally.
//
// Never point a browser fetch at api.buildmerger.com directly â€” a Lax cookie would not
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(path, {
      method,
      // credentials:'include' keeps the session cookie flowing on same-origin calls.
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new ApiError(res.status, res.ok ? 'invalid_response' : null, null);
    }
    const code = data?.error || (typeof data?.detail === 'string' ? data.detail : data?.detail?.error);
    if (!res.ok || code) throw new ApiError(res.status, code, data);
    if (res.status !== 204 && (!data || typeof data !== 'object')) {
      throw new ApiError(res.status, 'invalid_response', null);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, controller.signal.aborted ? 'request_timeout' : 'network_error', null);
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- auth ---------------- */

export const signup = (email, password, displayName, waitlist) =>
  request('/api/auth/signup', {
    method: 'POST',
    body: { email, password, ...(displayName ? { displayName } : {}), ...(waitlist ? { waitlist, termsVersion: '2026-09-21', privacyVersion: '2026-09-21' } : {}) },
  });

export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: { email, password } });

export const logout = () => request('/api/auth/logout', { method: 'POST' });

export const logoutAll = () => request('/api/auth/logout-all', { method: 'POST' });

/* Account admission is separate from billing. Only the server grants capabilities. */
export const accountAccess = () => request('/api/account/access');
export const accountWaitlist = (details = {}) => request('/api/account/waitlist', { method: 'POST', body: details });
export const acceptInvitation = (token) => request('/api/account/invitation/accept', {
  method: 'POST', body: token ? { token } : {},
});
export const adminWaitlist = () => request('/api/admin/waitlist');
export const adminInvite = (id) => request(`/api/admin/waitlist/${encodeURIComponent(id)}/invite`, { method: 'POST' });
export const adminRevoke = (id) => request(`/api/admin/waitlist/${encodeURIComponent(id)}/revoke`, { method: 'POST' });
export const updateProfile = (displayName) => request('/api/account/profile', { method: 'PATCH', body: { displayName } });

export const resendVerification = () => request('/api/auth/verify-email/send', { method: 'POST' });

/**
 * Request a reset email. The backend answers {ok:true} whether or not the address
 * is registered, so callers must show the same neutral confirmation either way and
 * never branch on the result â€” doing so would leak which emails have accounts.
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

/**
 * The only live billing read. Answers for an account with no entitlement, so
 * it is safe to call before anyone has subscribed.
 *
 * There is deliberately no `billingOffers` beside it: `/api/billing/offers`
 * returns 404 and is not a route. Plan copy is hardcoded in lib/billingOffer.
 */
export const billingStatus = () => request('/api/billing/status');

/**
 * Start alpha checkout. Resolves to the hosted Stripe Checkout URL, which the
 * caller redirects the browser to. No card data ever touches this app, and
 * there is no Stripe.js, session id or client secret in this flow â€” the
 * response carries one usable field, `url`.
 *
 * The body is exactly `{plan:'operator', alpha:true}`. `operator` is the only
 * plan the alpha accepts: any other plan with `alpha:true` is refused with
 * 400 alpha_is_operator_only, so sending one would be asking for an error we
 * already know the answer to.
 */
export const checkout = () =>
  request('/api/billing/checkout', {
    method: 'POST',
    body: { plan: 'operator', alpha: true },
  });

/** Returns the hosted Stripe Customer Portal URL. */
export const billingPortal = () => request('/api/billing/portal', { method: 'POST' });

/* ---------------- download ---------------- */

export const download = () => request('/api/download');

/* ---------------- presentation helpers ---------------- */

// PLANS used to live here with `alpha: { price: 50 }` in it. Nothing read it,
// and it carried a number the backend will never charge â€” the kind of dead
// constant that gets copied into live copy a year later. The plan the alpha
// bills is in lib/billingOffer, next to the words shown about it.
//
// Entitlement is whatever `/api/billing/status` says `entitled` is. TRIALING
// COUNTS AS ENTITLED and the backend already folds that in, so nothing here
// re-derives it from the status string.

export function statusLabel(status) {
  switch (status) {
    case 'trialing':
      return 'Trial';
    case 'active':
      return 'Active';
    case 'past_due':
      return 'Past due';
    case 'canceled':
      return 'Canceled';
    case 'none':
      return 'No subscription';
    case 'unpaid':
      return 'Payment needed';
    case 'incomplete':
      return 'Payment incomplete';
    case 'incomplete_expired':
      return 'Checkout expired';
    case 'paused':
      return 'Paused';
    default:
      return 'Status unavailable';
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
    case 'invitation_required':
    case 'invite_required':
      return 'An invitation is required to activate Merger. Check your account for your waitlist status.';
    case 'invite_wrong_account':
      return 'This invitation belongs to a different account. Sign out and use the email that received it.';
    case 'invite_expired':
      return 'This invitation has expired. Your account and waitlist history are saved. Contact support for a new invitation.';
    case 'invite_revoked':
      return 'This invitation is no longer active. Open your latest invitation or contact support.';
    case 'invite_not_found':
      return 'This invitation could not be found. Open the latest link from your invitation email.';
    case 'origin_not_allowed':
      return 'Account actions are not available on this preview yet. Please try again once the preview is connected.';
    case 'email_taken':
      return 'An account already exists for that email. Try signing in instead.';
    case 'invalid_credentials':
      return 'That email and password combination is not right.';
    case 'handle_taken':
    case 'handle_reserved':
      return 'That handle is already taken. Pick another.';
    case 'unknown_plan':
      return 'That plan is not available. Refresh this page and try again.';
    // Only reachable if this client ever posts a plan other than 'operator'
    // with alpha:true, which it does not. Said plainly rather than swallowed,
    // because if it ever appears it is a bug here, not something the user did.
    case 'alpha_is_operator_only':
      return 'The alpha covers one plan only. Refresh this page and try again.';
    case 'checkout_processing':
    case 'checkout_in_progress':
      return 'A checkout is already being processed for this account. Check your billing page before trying again.';
    case 'complimentary_access':
      return 'This account already has complimentary access. You do not need a paid subscription.';
    // 503. Billing is switched off or misconfigured at the backend â€” not the
    // user's problem and not fixable by retrying in ten seconds.
    case 'alpha_not_configured':
    case 'alpha_offer_unavailable':
    case 'alpha_unavailable':
    case 'billing_unavailable':
    case 'billing_not_configured':
      return 'Joining the alpha is not available right now. Your account is saved; please try again later.';
    case 'subscription_exists':
    case 'already_subscribed':
      return 'This account already has a subscription. Manage it from your account dashboard.';
    case 'billing_portal_unavailable':
    case 'billing_management_unavailable':
    case 'portal_not_configured':
      return 'Billing management is temporarily unavailable. Contact support@usemerger.com for help.';
    // 502. Transient, on Stripe's side â€” worth pressing again.
    case 'billing_provider_error':
      return 'Stripe could not complete the request. Please try again in a moment.';
    case 'no_subscription':
      return 'There is no billing account to manage yet. Review the current offer from your account.';
    case 'provisioning_failed':
      return 'Your messaging account could not be prepared. Please try again or contact support@usemerger.com.';
    case 'account_deleted':
      return 'This account has been deleted. Contact support@usemerger.com if you need help.';
    case 'email_not_verified':
      return 'Verify your email before continuing. Use the link in your inbox or request a new one.';
    case 'invalid_handle':
      return 'Use 3â€“30 lowercase letters, numbers, or underscores for your handle.';
    case 'handle_already_set':
      return 'Your account already has a handle. Refresh to continue.';
    case 'invalid_token':
      // Reset links are single-use and short-lived, so a rejected token is far
      // more often expired or already spent than genuinely malformed.
      return 'This link has expired or has already been used.';
    case 'alpha_closed':
    case 'alpha_ended':
    case 'alpha_full':
    case 'alpha_not_open':
      return 'The alpha is not taking new members right now.';
    case 'weak_password':
      return 'That password is too short. Use at least 8 characters.';
    case 'rate_limited':
      return 'Too many attempts. Wait a minute and try again.';
    case 'network_error':
      return 'Could not reach the server. Check your connection and try again.';
    case 'request_timeout':
      return 'This is taking longer than expected. Please try again.';
    case 'invalid_response':
      return 'The server returned an unexpected response. Please try again.';
    default: {
      // A backend blip (a 502 from the gateway, say) has no `error` code, and the
      // synthesised message is a bare "request_failed_502" â€” never show that to a
      // person. Anything unrecognised gets plain language instead.
      const status = err && err.status;
      if (status >= 500) {
        return 'Something went wrong on our end. Please try again in a moment.';
      }
      if (status === 401) return 'Your session has expired. Please sign in again.';
      if (status === 429) return 'Too many attempts. Wait a minute and try again.';
      if (status === 422) return 'Check the information you entered and try again.';
      return 'Something went wrong. Please try again.';
    }
  }
}
