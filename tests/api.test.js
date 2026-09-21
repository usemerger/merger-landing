import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, accountAccess, acceptInvitation, accountWaitlist, signup, billingStatus, checkout, errorMessage, meOrNull } from '../app/lib/api';
import { ALPHA_OFFER } from '../app/lib/billingOffer';

afterEach(() => vi.unstubAllGlobals());

describe('account admission contract', () => {
  it('creates a waitlist account with consent versions and without payment data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);
    await signup('person@example.com', 'fixture-password', 'Morgan', { ref: 'source123' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'person@example.com', password: 'fixture-password', displayName: 'Morgan', waitlist: { ref: 'source123' }, termsVersion: '2026-09-21', privacyVersion: '2026-09-21' });
  });
  it('uses authenticated account endpoints and sends private tokens only in acceptance bodies', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);
    await accountAccess(); await accountWaitlist({ ref: 'public123' }); await acceptInvitation('private-token');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/account/access', '/api/account/waitlist', '/api/account/invitation/accept']);
    expect(fetchMock.mock.calls.every(([, options]) => options.credentials === 'include')).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ token: 'private-token' });
  });
});

describe('the alpha checkout contract', () => {
  it('posts exactly {plan:"operator",alpha:true} with same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/pay/cs_test' })));
    vi.stubGlobal('fetch', fetchMock);
    // Called with arguments on purpose: nothing a caller passes may reach the
    // body. The plan is not the caller's to choose.
    await checkout('desk', 500);
    expect(fetchMock).toHaveBeenCalledWith('/api/billing/checkout', expect.objectContaining({
      credentials: 'include', method: 'POST', body: '{"plan":"operator","alpha":true}',
    }));
  });

  it('returns the hosted checkout URL and nothing is read but that', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      url: 'https://checkout.stripe.com/c/pay/cs_live_abc', sessionId: 'cs_live_abc', clientSecret: 'secret',
    }))));
    await expect(checkout()).resolves.toMatchObject({ url: 'https://checkout.stripe.com/c/pay/cs_live_abc' });
  });

  it('surfaces each refusal the contract names by its own code', async () => {
    for (const [status, code] of [[403, 'alpha_closed'], [401, 'unauthorized'],
      [400, 'alpha_is_operator_only'], [503, 'alpha_not_configured'], [502, 'billing_provider_error']]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: code }), { status })));
      await expect(checkout()).rejects.toMatchObject({ status, code });
    }
  });

  it('quotes one offer, and it is the one the backend charges', () => {
    const copy = [ALPHA_OFFER.billingNotice, ALPHA_OFFER.rateNotice, ALPHA_OFFER.summary,
      ALPHA_OFFER.trialLabel, ALPHA_OFFER.priceLabel].join(' ');
    // The three retired framings. Any of them reappearing means two offers are
    // on screen at once, which is the failure this whole file exists to catch.
    expect(copy).not.toMatch(/invite|50% off|\$99\.99|\$49\.99|\$79|\$159/i);
    expect(copy).toContain('$50');
    expect(copy).toContain('$0');
    expect(copy).toMatch(/2 weeks free/);
    expect(copy).toMatch(/for life/);
    expect(ALPHA_OFFER.plan).toBe('operator');
  });
});
describe('recoverable API errors', () => {
  it('only treats 401 as signed out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"error":"unauthorized"}', { status: 401 })).mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 })));
    await expect(meOrNull()).resolves.toBeNull();
    await expect(meOrNull()).rejects.toMatchObject({ status: 502 });
  });
  it('rejects malformed successful data instead of claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>proxy error</html>')));
    await expect(billingStatus()).rejects.toMatchObject({ code: 'invalid_response' });
  });
  it('extracts structured backend errors without revealing internals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"detail":{"error":"email_not_verified"}}', { status: 403 })));
    await expect(billingStatus()).rejects.toMatchObject({ code: 'email_not_verified' });
    expect(errorMessage(new ApiError(400, 'private_database_connection_string'))).not.toContain('database');
  });
  it('aborts stalled requests with a retryable message', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('abort'))))));
    const result = billingStatus();
    const assertion = expect(result).rejects.toMatchObject({ code: 'request_timeout' });
    await vi.advanceTimersByTimeAsync(20000);
    await assertion;
    vi.useRealTimers();
  });
});
