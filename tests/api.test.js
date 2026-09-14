import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, billingOffers, checkout, errorMessage, meOrNull } from '../app/lib/api';
import { isAvailableAlphaOffer } from '../app/lib/billingOffer';

afterEach(() => vi.unstubAllGlobals());
const alpha = { id: 'alpha', available: true, amount: 5000, currency: 'usd', interval: 'month', intervalCount: 1, perSeat: false, trialDays: 14, priceLockedWhileSubscribed: true };
describe('billing offer safety', () => {
  it('enables only the exact advertised $50 monthly offer', () => {
    expect(isAvailableAlphaOffer({ offers: [alpha] })).toBe(true);
    for (const change of [{ amount: 4999 }, { amount: 9999 }, { available: false }, { interval: 'year' }, { intervalCount: 12 }, { trialDays: 0 }, { trialDays: 7 }, { trialDays: 365 }, { perSeat: true }, { currency: 'cad' }, { priceLockedWhileSubscribed: false }]) {
      expect(isAvailableAlphaOffer({ offers: [{ ...alpha, ...change }] })).toBe(false);
    }
    expect(isAvailableAlphaOffer(null)).toBe(false);
  });
  it('sends only the public offer and same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: 'https://checkout.stripe.com/test' })));
    vi.stubGlobal('fetch', fetchMock);
    await checkout('desk', 500);
    expect(fetchMock).toHaveBeenCalledWith('/api/billing/checkout', expect.objectContaining({ credentials: 'include', body: '{"offer":"alpha"}', method: 'POST' }));
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
    await expect(billingOffers()).rejects.toMatchObject({ code: 'invalid_response' });
  });
  it('extracts structured backend errors without revealing internals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"detail":{"error":"email_not_verified"}}', { status: 403 })));
    await expect(billingOffers()).rejects.toMatchObject({ code: 'email_not_verified' });
    expect(errorMessage(new ApiError(400, 'private_database_connection_string'))).not.toContain('database');
  });
  it('aborts stalled requests with a retryable message', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('abort'))))));
    const result = billingOffers();
    const assertion = expect(result).rejects.toMatchObject({ code: 'request_timeout' });
    await vi.advanceTimersByTimeAsync(20000);
    await assertion;
    vi.useRealTimers();
  });
});
