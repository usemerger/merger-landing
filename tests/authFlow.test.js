import { describe, expect, it, vi } from 'vitest';
import { normalizeInstallers, pollEntitlement, safeReturnPath, stripeRedirectURL, validEmail, validHandle } from '../app/lib/authFlow';

describe('auth input and redirect boundaries', () => {
  it('validates email and handle without silently changing password rules', () => {
    expect(validEmail(' person+desk@example.com ')).toBe(true);
    expect(validEmail('person@')).toBe(false);
    expect(validHandle(' My_Desk ')).toBe(true);
    expect(validHandle('ab')).toBe(false);
    expect(validHandle('a'.repeat(31))).toBe(false);
  });
  it.each(['https://evil.test', '//evil.test', '/\\evil.test', '/%5cevil.test', '/%2fevil.test', '/%0a/evil.test', '/login?next=/login'])('rejects an unsafe or looping return path: %s', (path) => {
    expect(safeReturnPath(path)).toBe('/dashboard');
  });
  it('preserves the payment return context', () => {
    expect(safeReturnPath('/billing?checkout=success')).toBe('/billing?checkout=success');
    expect(safeReturnPath('/download')).toBe('/download');
  });
  it('accepts only exact HTTPS Stripe checkout and portal hosts', () => {
    expect(stripeRedirectURL('https://checkout.stripe.com/c/pay/test')).toContain('checkout.stripe.com');
    expect(stripeRedirectURL('https://billing.stripe.com/p/session/test')).toContain('billing.stripe.com');
    for (const url of ['http://checkout.stripe.com/x', 'https://checkout.stripe.com.evil.test/x', 'https://evil.test@checkout.stripe.com/x', 'javascript:alert(1)', '/checkout']) {
      expect(() => stripeRedirectURL(url)).toThrow('billing link');
    }
  });
  it('does not render executable or credential-bearing installer links', () => {
    expect(normalizeInstallers({ builds: { windows: 'javascript:alert(1)', macos: 'https://user:password@cdn.test/a.dmg' } })).toEqual({ windows: null, macos: null });
    expect(normalizeInstallers({ builds: { windows: 'https://releases.buildmerger.com/Merger.exe' } })).toEqual({ windows: 'https://releases.buildmerger.com/Merger.exe', macos: null });
  });
});

describe('payment reconciliation', () => {
  it('continues after non-entitled updates and a transient failure, stopping on explicit entitlement', async () => {
    const read = vi.fn().mockResolvedValueOnce({ entitlementStatus: 'active', entitled: false })
      .mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ entitled: true });
    const onStatus = vi.fn();
    expect(await pollEntitlement({ read, onStatus, wait: async () => true })).toEqual({ entitled: true });
    expect(read).toHaveBeenCalledTimes(3);
    expect(onStatus).toHaveBeenCalledTimes(2);
  });
  it('has a finite retry limit and does not infer access from a status name', async () => {
    const read = vi.fn(async () => ({ entitlementStatus: 'trialing', entitled: false }));
    expect(await pollEntitlement({ read, onStatus: vi.fn(), attempts: 3, wait: async () => true })).toEqual({ entitled: false });
    expect(read).toHaveBeenCalledTimes(3);
  });
  it('does not apply an in-flight result after cancellation', async () => {
    const controller = new AbortController();
    const onStatus = vi.fn();
    const result = await pollEntitlement({ signal: controller.signal, wait: async () => true,
      read: async () => { controller.abort(); return { entitled: true }; }, onStatus });
    expect(result).toEqual({ canceled: true });
    expect(onStatus).not.toHaveBeenCalled();
  });
  it('stops immediately when the session expires', async () => {
    const read = vi.fn().mockRejectedValue({ status: 401 });
    await expect(pollEntitlement({ read, onStatus: vi.fn(), wait: async () => true })).rejects.toEqual({ status: 401 });
    expect(read).toHaveBeenCalledTimes(1);
  });
});
