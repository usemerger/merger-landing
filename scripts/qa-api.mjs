// Local UI fixture only. No production data, email, payment or installer actions.
// node scripts/qa-api.mjs — then open http://127.0.0.1:5191/qa.
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COOKIE = 'merger_qa_session';
const scenarios = {
  signedout: 'Signed out', none: 'Account without subscription', active: 'Active alpha subscription',
  pastdue: 'Past due, access locked', canceled: 'Canceled subscription', complimentary: 'Complimentary account',
  checkoutpending: 'Checkout confirmation pending', errors: 'Recoverable API errors',
  nohandle: 'Account without handle', unverified: 'Email verification required',
  alphaunavailable: 'Alpha not configured (503)', billingerror: 'Stripe provider error (502)',
  canceling: 'Active, cancellation scheduled', downloadready: 'Synthetic download link (do not download)',
  trialing: 'Alpha access active (free)', trialcanceling: 'Alpha cancellation scheduled',
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const validEmail = value => /^[^\s@]+@(?:[^\s@]+\.test|example\.(?:com|org))$/i.test(value || '');
const validHandle = value => /^[a-z0-9_]{3,30}$/.test(value || '');
const reservedHandles = new Set(['taken', 'reserved', 'admin', 'support', 'merger']);

export function createQaApi({ webOrigin = 'http://127.0.0.1:3012' } = {}) {
  const web = new URL(webOrigin);
  if (web.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(web.hostname)) throw new Error('QA web origin must be loopback HTTP.');
  const sessions = new Map();
  let sequence = 0;
  const makeUser = ({ handle = 'morgandesk', emailVerified = true, email = 'morgan@example.test', displayName = 'Morgan Ellis' } = {}) =>
    ({ userId: 'qa-user-001', email, displayName, handle, emailVerified, createdAt: '2026-09-14T12:00:00Z' });
  function newState(scenario = 'signedout') {
    return { scenario, user: scenario === 'signedout' ? null : makeUser({ handle: ['nohandle', 'unverified'].includes(scenario) ? null : 'morgandesk', emailVerified: scenario !== 'unverified' }),
      resetUsed: false, counters: { signup: 0, login: 0, logout: 0, checkout: 0, portal: 0, verification: 0, passwordReset: 0 } };
  }
  function json(response, code, data) {
    response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Merger-QA': 'synthetic-only' });
    response.end(JSON.stringify(data));
  }
  function stateFor(request, response) {
    const cookies = String(request.headers.cookie || '').split(';').map(v => v.trim());
    const id = cookies.find(c => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    if (id && sessions.has(id)) return { id, state: sessions.get(id) };
    const next = `qa-session-${++sequence}`;
    const state = newState(); sessions.set(next, state);
    response.setHeader('Set-Cookie', `${COOKIE}=${next}; Path=/; HttpOnly; SameSite=Lax`);
    return { id: next, state };
  }
  async function body(request) {
    let raw = '';
    for await (const chunk of request) { raw += chunk; if (raw.length > 16384) throw new Error('body_too_large'); }
    return request.headers['content-type']?.includes('application/json') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw));
  }
  function billing(state) {
    const mode = state.scenario;
    const complimentary = mode === 'complimentary';
    const active = ['active', 'canceling', 'downloadready'].includes(mode);
    const trialing = ['trialing', 'trialcanceling'].includes(mode);
    const entitlementStatus = mode === 'pastdue' ? 'past_due' : mode === 'canceled' ? 'canceled' : mode === 'checkoutpending' ? 'incomplete' : trialing ? 'trialing' : active ? 'active' : 'none';
    const hasHistory = active || trialing || ['pastdue', 'canceled', 'checkoutpending'].includes(mode);
    return { configured: mode !== 'alphaunavailable', entitled: active || trialing || complimentary, grandfathered: complimentary,
      entitlementStatus, offer: hasHistory ? 'alpha' : null, plan: hasHistory ? 'operator' : null, seats: 1,
      // The member rate, in cents — what is billed AFTER the alpha. $0 today is
      // not a price, it is the absence of one, so it is not modelled here.
      pricing: hasHistory ? { amount: 4999, currency: 'usd', interval: 'month', intervalCount: 1, quantity: 1 } : null,
      hasPaymentMethod: hasHistory && mode !== 'checkoutpending', alphaPriceLocked: active || trialing,
      cancelAtPeriodEnd: ['canceling', 'trialcanceling'].includes(mode), currentPeriodEnd: trialing ? '2026-09-28T12:00:00Z' : active ? '2026-10-14T12:00:00Z' : null,
      trialEndsAt: trialing ? '2026-09-28T12:00:00Z' : null, graceEndsAt: null, billingDetailsUnavailable: false };
  }
  function controlPage(state) {
    const cards = Object.entries(scenarios).map(([key, label]) => `<form method="post" action="/qa/scenario"><input type="hidden" name="scenario" value="${key}"><button${key === state.scenario ? ' class="active"' : ''}>${label}</button></form>`).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Merger — local synthetic QA</title><style>
      *{box-sizing:border-box}body{margin:0;background:#11151b;color:#f1eee7;font:16px/1.65 system-ui,sans-serif}main{max-width:1080px;margin:40px auto;padding:0 24px}h1{font-size:32px;line-height:1.2}h2{font-size:20px}p{color:#b7bfca}a{color:#e0c18c}code{background:#202832;padding:3px 5px;border-radius:4px}.banner{padding:18px 22px;border:1px solid #c3a16a;background:#292318;border-radius:9px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:25px 0}button{width:100%;height:100%;min-height:66px;text-align:left;border:1px solid #4b5564;background:#1d2530;color:#f1eee7;border-radius:7px;padding:16px;font:inherit;cursor:pointer}.active,button:hover{border-color:#c3a16a;background:#352d22}.links{display:flex;gap:20px;flex-wrap:wrap;margin:23px 0}.details{padding:22px;border:1px solid #414a55;border-radius:8px;margin:24px 0}form{margin:0}:focus-visible{outline:3px solid #e0c18c;outline-offset:4px}</style></head><body><main>
      <div class="banner"><strong>Local synthetic test environment</strong><br>No production accounts, emails, charges, Stripe sessions, or installers. Only loopback requests are served.</div>
      <h1>Merger UI scenarios</h1><p>Current: <strong>${escapeHTML(scenarios[state.scenario])}</strong>. ${state.user ? `Synthetic account: ${escapeHTML(state.user.email)} · ${escapeHTML(state.user.handle || 'no handle')}` : 'No signed-in account.'}</p>
      <div class="grid">${cards}</div><p>Choose a scenario to open the matching frontend screen. Cookies are local, HttpOnly, and shared between these loopback ports.</p>
      <nav class="links"><a href="${web.origin}/">Landing</a><a href="${web.origin}/signup?offer=alpha">Signup</a><a href="${web.origin}/login">Login</a><a href="${web.origin}/dashboard">Dashboard</a><a href="${web.origin}/billing">Billing</a><a href="${web.origin}/download">Downloads</a><a href="${web.origin}/forgot-password">Forgot password</a><a href="${web.origin}/reset-password?token=qa-valid-reset">Valid reset link</a><a href="${web.origin}/reset-password?token=qa-expired-reset">Expired reset link</a></nav>
      <div class="details"><h2>Deterministic test inputs</h2><p>Use <code>morgan@example.test</code> and any synthetic password with at least 8 characters. <code>wrong-password</code> returns invalid credentials. Signup with <code>taken@example.test</code> returns email taken. Only reserved example domains are accepted; passwords are never retained or logged.</p><p>Handles <code>taken</code>, <code>reserved</code>, <code>admin</code>, <code>support</code>, and <code>merger</code> are unavailable. Other valid handles can be claimed.</p><p>The reset token <code>qa-valid-reset</code> succeeds once per scenario. Verification resend returns success but sends nothing; use the control below to mark the synthetic account verified.</p><form method="post" action="/qa/verify"><button>Mark synthetic email verified</button></form></div>
      <div class="details"><h2>Billing and download limits</h2><p>Checkout and portal calls return controlled service errors. They never return a Stripe URL or make a payment request. Active and complimentary scenarios grant download access with an empty installer list, exercising the recoverable unavailable state without offering a fake binary.</p><p>Checkout pending stays pending until you choose Active. Errors makes account, handle, offer, and billing reads fail until you choose another scenario.</p><p>Observed calls: <code>${escapeHTML(JSON.stringify(state.counters))}</code></p></div>
    </main></body></html>`;
  }
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    const { id, state } = stateFor(request, response);
    try {
      if (request.method === 'GET' && (path === '/' || path === '/qa')) {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(controlPage(state)); return;
      }
      if (request.method === 'POST' && path === '/qa/scenario') {
        const data = await body(request);
        if (!Object.hasOwn(scenarios, data.scenario)) { json(response, 400, { error: 'unknown_scenario' }); return; }
        sessions.set(id, newState(data.scenario));
        const destination = data.scenario === 'signedout' ? '/login' : ['nohandle', 'unverified'].includes(data.scenario) ? '/signup?offer=alpha' : data.scenario === 'checkoutpending' ? '/dashboard?checkout=success' : '/dashboard';
        response.writeHead(303, { Location: `${web.origin}${destination}`, 'Cache-Control': 'no-store' }); response.end(); return;
      }
      if (request.method === 'POST' && path === '/qa/verify') {
        if (state.user) state.user.emailVerified = true;
        response.writeHead(303, { Location: '/qa' }); response.end(); return;
      }
      if (request.method === 'GET' && path === '/api/qa/status') { json(response, 200, { scenario: state.scenario, user: state.user, counters: state.counters, synthetic: true }); return; }
      if (!path.startsWith('/api/')) { json(response, 404, { error: 'fixture_route_not_found' }); return; }
      if (state.scenario === 'errors' && request.method === 'GET') { json(response, 503, { error: 'qa_temporarily_unavailable' }); return; }

      if (request.method === 'POST' && ['/api/auth/signup', '/api/auth/login'].includes(path)) {
        const data = await body(request), signingUp = path.endsWith('/signup');
        state.counters[signingUp ? 'signup' : 'login']++;
        if (!validEmail(data.email)) { json(response, 422, { error: 'qa_use_example_email' }); return; }
        if (String(data.password || '').length < 8) { json(response, 422, { error: 'weak_password' }); return; }
        if (data.password === 'wrong-password') { json(response, 401, { error: 'invalid_credentials' }); return; }
        if (signingUp && data.email.toLowerCase() === 'taken@example.test') { json(response, 409, { error: 'email_taken' }); return; }
        state.scenario = 'none';
        state.user = makeUser({ email: data.email, displayName: data.displayName || 'Morgan Ellis', handle: signingUp ? null : 'morgandesk' });
        json(response, 200, state.user); return;
      }
      if (request.method === 'POST' && path === '/api/auth/logout') {
        state.counters.logout++; sessions.delete(id);
        response.setHeader('Set-Cookie', `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
        json(response, 200, { ok: true }); return;
      }
      if (request.method === 'POST' && path === '/api/auth/password/forgot') {
        await body(request); json(response, 200, { ok: true }); return;
      }
      if (request.method === 'POST' && path === '/api/auth/password/reset') {
        const data = await body(request);
        if (data.token !== 'qa-valid-reset' || state.resetUsed) { json(response, 400, { error: 'invalid_token' }); return; }
        if (String(data.password || '').length < 8) { json(response, 422, { error: 'weak_password' }); return; }
        state.resetUsed = true; state.counters.passwordReset++; json(response, 200, { ok: true }); return;
      }
      if (request.method === 'GET' && /^\/api\/handles\/[^/]+\/available$/.test(path)) {
        const handle = decodeURIComponent(path.split('/')[3]);
        json(response, 200, { handle, available: validHandle(handle) && !reservedHandles.has(handle) }); return;
      }
      // NO /api/billing/offers HANDLER, DELIBERATELY. The live backend answers
      // 404 for it and always did; a fixture that serves it would let the funnel
      // be developed against a route that does not exist. It falls through to
      // the catch-all 404 below, which is exactly what production does.
      if (!state.user) { json(response, 401, { error: 'not_authenticated' }); return; }
      if (request.method === 'GET' && path === '/api/auth/me') { json(response, 200, state.user); return; }
      if (request.method === 'POST' && path === '/api/auth/verify-email/send') {
        state.counters.verification++; json(response, 200, { ok: true }); return;
      }
      if (request.method === 'POST' && path === '/api/me/handle') {
        const { handle } = await body(request);
        if (!state.user.emailVerified) { json(response, 403, { error: 'email_not_verified' }); return; }
        if (state.user.handle) { json(response, 409, { error: 'handle_already_set' }); return; }
        if (!validHandle(handle)) { json(response, 422, { error: 'invalid_handle' }); return; }
        if (reservedHandles.has(handle)) { json(response, 409, { error: 'handle_taken' }); return; }
        state.user.handle = handle; json(response, 200, { handle }); return;
      }
      if (request.method === 'GET' && path === '/api/billing/status') { json(response, 200, billing(state)); return; }
      if (request.method === 'POST' && path === '/api/billing/checkout') {
        state.counters.checkout++;
        const sent = await body(request);
        // The contract, enforced here so a wrong body fails locally rather than
        // in production: operator + alpha, nothing else.
        if (sent?.alpha === true && sent?.plan !== 'operator') { json(response, 400, { error: 'alpha_is_operator_only' }); return; }
        if (state.scenario === 'alphaunavailable') { json(response, 503, { error: 'alpha_not_configured', synthetic: true }); return; }
        if (state.scenario === 'billingerror') { json(response, 502, { error: 'billing_provider_error', synthetic: true }); return; }
        // THE DEFAULT IS 403, because that is what the live backend returns:
        // the allowlist is fail-closed and currently empty. This fixture never
        // emits a Stripe URL — the 200 path has to be proved against the real
        // backend with a real allowlisted account, not against a made-up link.
        json(response, 403, { error: 'not_on_alpha_list', synthetic: true }); return;
      }
      if (request.method === 'POST' && path === '/api/billing/portal') {
        state.counters.portal++; json(response, 503, { error: 'billing_portal_unavailable', synthetic: true }); return;
      }
      if (request.method === 'GET' && path === '/api/download') {
        const status = billing(state);
        if (!status.entitled) { json(response, 403, { error: 'subscription_required', entitlementStatus: status.entitlementStatus }); return; }
        json(response, 200, { version: '1.1.0-qa', builds: state.scenario === 'downloadready' ? { windows: 'https://example.test/Merger-QA.exe' } : {}, synthetic: true }); return;
      }
      json(response, 404, { error: 'fixture_route_not_found' });
    } catch (error) { json(response, error.message === 'body_too_large' ? 413 : 400, { error: 'invalid_fixture_request' }); }
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createQaApi();
  server.listen(5191, '127.0.0.1', () => console.log('Synthetic Merger QA API: http://127.0.0.1:5191/qa — no external services.'));
  server.on('error', error => { console.error('QA fixture could not start:', error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
