import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminAccount, adminAccountGrant, adminAccountRevoke, adminAccountRole, adminAccounts, canManageUsers } from '../app/lib/adminAccounts';

beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ users: [] }) })));
afterEach(() => vi.unstubAllGlobals());
describe('registered-user administration API', () => {
  it('keeps paginated search same-origin and includes the authenticated cookie', async () => {
    await adminAccounts({ q: 'name+tag@example.com', page: 2, pageSize: 50 });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/admin/accounts?page=2&pageSize=50&q=name%2Btag%40example.com');
    expect(options).toMatchObject({ method: 'GET', credentials: 'include', cache: 'no-store' });
  });
  it('encodes target IDs and forwards the exact reviewed revision and duration', async () => {
    await adminAccountGrant('a/b', { durationDays: null, reason: 'Partner pilot', expectedRevision: 7 });
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/admin/accounts/a%2Fb/complimentary', expect.objectContaining({ method: 'POST', body: JSON.stringify({ durationDays: null, reason: 'Partner pilot', expectedRevision: 7 }) }));
  });
  it('uses dedicated role and revocation endpoints', async () => {
    const body = { role: 'waitlist_viewer', reason: 'Team access', expectedRevision: 2 };
    await adminAccountRole('a', body); await adminAccountRevoke('a', { reason: 'Pilot ended', expectedRevision: 3 });
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/api/admin/accounts/a/role', '/api/admin/accounts/a/complimentary/revoke']);
  });
  it('surfaces conflicts without automatically retrying a mutation', async () => {
    fetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'revision_conflict' }) });
    await expect(adminAccountGrant('a', { durationDays: 30, reason: 'Pilot', expectedRevision: 1 })).rejects.toMatchObject({ status: 409, code: 'revision_conflict' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('keeps canceled reads distinguishable from connection failures', async () => {
    const controller = new AbortController(); controller.abort();
    fetch.mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    await expect(adminAccount('a', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('never treats waitlist-only privileges as user administration', () => {
    expect(canManageUsers({ isAdmin: false, canViewWaitlist: true, canImportWaitlist: true, canManageUsers: true })).toBe(false);
    expect(canManageUsers({ isAdmin: true })).toBe(true);
  });
});
