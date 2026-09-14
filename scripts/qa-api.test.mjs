import test from 'node:test';
import assert from 'node:assert/strict';
import { createQaApi } from './qa-api.mjs';

async function fixture(t) {
  const server = createQaApi();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  return async (path, body) => {
    const response = await fetch(origin + path, { redirect: 'manual', method: body ? 'POST' : 'GET',
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    if (response.headers.has('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
    return { response, data };
  };
}

test('synthetic signup, handle reservation and logout use real HTTP cookies', async t => {
  const call = await fixture(t);
  assert.equal((await call('/api/auth/me')).response.status, 401);
  const signup = await call('/api/auth/signup', { email: 'qa@example.test', password: 'synthetic-password', displayName: 'QA Person' });
  assert.equal(signup.response.status, 200); assert.equal(signup.data.handle, null);
  assert.equal((await call('/api/auth/me')).data.email, 'qa@example.test');
  assert.equal((await call('/api/handles/taken/available')).data.available, false);
  assert.equal((await call('/api/me/handle', { handle: 'qa_desk' })).data.handle, 'qa_desk');
  assert.equal((await call('/api/auth/me')).data.handle, 'qa_desk');
  const logout = await call('/api/auth/logout', {});
  assert.match(logout.response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(logout.response.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await call('/api/auth/me')).response.status, 401);
});

test('scenario controls expose distinct entitlement states without offering fake downloads or Stripe URLs', async t => {
  const call = await fixture(t);
  for (const [scenario, expected, entitled] of [['none', 'none', false], ['active', 'active', true], ['pastdue', 'past_due', false], ['canceled', 'canceled', false], ['complimentary', 'none', true], ['checkoutpending', 'incomplete', false]]) {
    const control = await call('/qa/scenario', { scenario });
    assert.equal(control.response.status, 303);
    assert.ok(control.response.headers.get('location').startsWith('http://127.0.0.1:3012/'));
    const status = (await call('/api/billing/status')).data;
    assert.equal(status.entitlementStatus, expected); assert.equal(status.entitled, entitled);
    const download = await call('/api/download');
    assert.equal(download.response.status, entitled ? 200 : 403);
    if (entitled) assert.deepEqual(download.data.builds, {});
  }
  assert.equal((await call('/api/billing/checkout', { offer: 'alpha' })).data.error, 'alpha_offer_unavailable');
  const portal = await call('/api/billing/portal', {});
  assert.equal(portal.data.error, 'billing_portal_unavailable'); assert.equal(portal.data.url, undefined);
});

test('verification and one-use reset cases stay synthetic and recoverable', async t => {
  const call = await fixture(t);
  await call('/qa/scenario', { scenario: 'unverified' });
  assert.equal((await call('/api/me/handle', { handle: 'qa_desk' })).data.error, 'email_not_verified');
  assert.deepEqual((await call('/api/auth/verify-email/send', {})).data, { ok: true });
  await call('/qa/verify', {});
  assert.equal((await call('/api/me/handle', { handle: 'qa_desk' })).data.handle, 'qa_desk');
  assert.equal((await call('/api/auth/password/reset', { token: 'qa-expired-reset', password: 'synthetic-password' })).data.error, 'invalid_token');
  assert.deepEqual((await call('/api/auth/password/reset', { token: 'qa-valid-reset', password: 'synthetic-password' })).data, { ok: true });
  assert.equal((await call('/api/auth/password/reset', { token: 'qa-valid-reset', password: 'synthetic-password' })).data.error, 'invalid_token');
});

test('error and unavailable-offer modes can be reset through the local control page', async t => {
  const call = await fixture(t);
  await call('/qa/scenario', { scenario: 'errors' });
  assert.equal((await call('/api/auth/me')).response.status, 503);
  const page = await call('/qa');
  assert.match(page.data, /Local synthetic test environment/);
  await call('/qa/scenario', { scenario: 'offerunavailable' });
  assert.equal((await call('/api/billing/offers')).data.offers[0].available, false);
  await call('/qa/scenario', { scenario: 'none' });
  assert.equal((await call('/api/billing/offers')).data.offers[0].available, true);
  assert.equal((await call('/api/auth/me')).response.status, 200);
});
