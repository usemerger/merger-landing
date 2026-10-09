import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const nav = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), accountAccess: vi.fn() }));
vi.mock('../app/lib/adminAccounts', async (original) => ({ ...await original(), adminAccounts: vi.fn(), adminAccount: vi.fn(), adminAccountRole: vi.fn(), adminAccountGrant: vi.fn(), adminAccountRevoke: vi.fn() }));
import { accountAccess, ApiError } from '../app/lib/api';
import * as api from '../app/lib/adminAccounts';
import AdminUsersPage from '../app/admin/users/page';

const member = (id, extra = {}) => ({ id, email: `${id}@example.com`, displayName: `Member ${id}`, role: 'none', emailVerified: true, createdAt: '2026-01-02T12:00:00Z', revision: 7, canUseApp: false, accessSource: 'none', subscriptionStatus: 'none', complimentary: { status: 'none' }, ...extra });
const first = member('first');
const second = member('second');
const page = (users = [first, second], extra = {}) => ({ users, page: 0, pageSize: 50, filteredCount: users.length, totalCount: users.length, hasMore: false, ...extra });
const detail = (user) => ({ user, audit: [] });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
beforeEach(() => {
  vi.clearAllMocks();
  accountAccess.mockResolvedValue({ user: { id: 'owner' }, capabilities: { isAdmin: true } });
  api.adminAccounts.mockResolvedValue(page());
  api.adminAccount.mockImplementation(async (id) => detail(id === first.id ? first : second));
  api.adminAccountGrant.mockResolvedValue(detail({ ...first, revision: 8, canUseApp: true, accessSource: 'complimentary', complimentary: { status: 'active', grantedAt: '2026-10-09T12:00:00Z', expiresAt: null } }));
});
async function selectFirst() { fireEvent.click(await screen.findByRole('button', { name: /first@example.com/ })); return screen.findByRole('button', { name: 'Grant free access' }); }
async function grantReview(duration = '30') {
  fireEvent.click(await selectFirst());
  fireEvent.change(screen.getByLabelText('Access duration'), { target: { value: duration } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Partner pilot' } });
  fireEvent.click(screen.getByRole('button', { name: 'Review change' }));
}

describe('users and access permissions', () => {
  it.each([{ isAdmin: false }, { isAdmin: false, canViewWaitlist: true, canImportWaitlist: true }])('blocks non-admin capabilities %j before any user data is fetched', async (capabilities) => {
    accountAccess.mockResolvedValue({ capabilities }); render(<AdminUsersPage />);
    await screen.findByRole('heading', { name: 'Administrator access required' });
    expect(api.adminAccounts).not.toHaveBeenCalled(); expect(api.adminAccount).not.toHaveBeenCalled();
  });
  it('clears private rows and redirects if authorization expires', async () => {
    api.adminAccount.mockRejectedValue(new ApiError(401)); render(<AdminUsersPage />);
    fireEvent.click(await screen.findByRole('button', { name: /first@example.com/ }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/login?next=/admin/users'));
    expect(screen.queryByRole('button', { name: /Member first/ })).not.toBeInTheDocument();
  });
  it('protects environment administrators and the current administrator from role edits', async () => {
    const protectedUser = member('owner', { role: 'admin', protectedAdmin: true });
    api.adminAccounts.mockResolvedValue(page([protectedUser])); api.adminAccount.mockResolvedValue(detail(protectedUser)); render(<AdminUsersPage />);
    fireEvent.click(await screen.findByRole('button', { name: /owner@example.com/ }));
    await screen.findByText(/Protected administrator/);
    expect(screen.queryByRole('button', { name: 'Change role' })).not.toBeInTheDocument();
  });
  it('keeps free access unavailable for unverified users', async () => {
    api.adminAccount.mockResolvedValue(detail({ ...first, emailVerified: false })); render(<AdminUsersPage />);
    expect(await selectFirst()).toBeDisabled(); expect(api.adminAccountGrant).not.toHaveBeenCalled();
  });
});

describe('bounded account browsing', () => {
  it('restores results when a typed query is cleared before debounce completes', async () => {
    render(<AdminUsersPage />);
    await screen.findByRole('button', { name: /first@example.com/ });
    const search = screen.getByLabelText('Find a registered user');
    fireEvent.change(search, { target: { value: 'temporary' } });
    fireEvent.change(search, { target: { value: '' } });
    await screen.findByRole('button', { name: /first@example.com/ });
    expect(api.adminAccounts).toHaveBeenCalledTimes(2);
    expect(api.adminAccounts).toHaveBeenLastCalledWith(expect.objectContaining({ q: '', page: 0 }));
  });
  it.each([
    page(Array.from({ length: 51 }, (_, index) => member(`user${index}`))),
    page([first], { filteredCount: -1 }),
    page([first], { filteredCount: 10, totalCount: 1 }),
  ])('rejects an unbounded or invalid server list instead of rendering it', async (response) => {
    api.adminAccounts.mockResolvedValue(response); render(<AdminUsersPage />);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: /first@example.com|user0@example.com/ })).not.toBeInTheDocument();
  });
  it('loads only the requested page and performs server-side search', async () => {
    api.adminAccounts.mockResolvedValue(page([first], { filteredCount: 60000, totalCount: 60000, hasMore: true })); render(<AdminUsersPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(api.adminAccounts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, pageSize: 50, q: '' })));
    fireEvent.change(screen.getByLabelText('Find a registered user'), { target: { value: 'first@example.com' } });
    await waitFor(() => expect(api.adminAccounts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, q: 'first@example.com', pageSize: 50 })));
    expect(api.adminAccounts).toHaveBeenCalledTimes(3);
  });
  it('ignores a previous user’s detail response after selecting another account', async () => {
    const old = deferred(); api.adminAccount.mockImplementation((id) => id === 'first' ? old.promise : Promise.resolve(detail(second))); render(<AdminUsersPage />);
    fireEvent.click(await screen.findByRole('button', { name: /first@example.com/ }));
    fireEvent.click(screen.getByRole('button', { name: /second@example.com/ }));
    await screen.findByRole('heading', { name: 'Member second' });
    await act(async () => old.resolve(detail(first)));
    expect(within(screen.getByRole('complementary', { name: 'Account details' })).queryByText('first@example.com')).not.toBeInTheDocument();
  });
  it('does not display an old search response after the query changes', async () => {
    const old = deferred(); api.adminAccounts.mockReturnValueOnce(old.promise).mockResolvedValue(page([second])); render(<AdminUsersPage />);
    await waitFor(() => expect(api.adminAccounts).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText('Find a registered user'), { target: { value: 'second' } });
    await screen.findByRole('button', { name: /second@example.com/ });
    await act(async () => old.resolve(page([first])));
    expect(screen.queryByRole('button', { name: /Member first/ })).not.toBeInTheDocument();
  });
});

describe('reviewed, revision-protected access changes', () => {
  it.each(['30', '90', 'none'])('requires review and sends an explicit %s duration without duplicate submissions', async (duration) => {
    const mutation = deferred(); api.adminAccountGrant.mockReturnValue(mutation.promise); render(<AdminUsersPage />);
    await grantReview(duration);
    expect(api.adminAccountGrant).not.toHaveBeenCalled();
    const confirm = screen.getByRole('button', { name: 'Confirm change' }); fireEvent.click(confirm); fireEvent.click(confirm);
    expect(api.adminAccountGrant).toHaveBeenCalledExactlyOnceWith('first', { durationDays: duration === 'none' ? null : Number(duration), reason: 'Partner pilot', expectedRevision: 7 });
    expect(screen.getByRole('button', { name: /Member second/ })).toBeDisabled();
    await act(async () => mutation.resolve(detail({ ...first, complimentary: { status: 'active' }, revision: 8 })));
    await screen.findByText('Complimentary access granted.');
  });
  it('requires a reason and duration before allowing a review', async () => {
    render(<AdminUsersPage />); fireEvent.click(await selectFirst());
    expect(screen.getByLabelText('Access duration')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Partner' } });
    expect(screen.getByRole('button', { name: 'Review change' })).toBeDisabled();
    expect(api.adminAccountGrant).not.toHaveBeenCalled();
  });
  it('does not describe founding access as a paid subscription', async () => {
    api.adminAccount.mockResolvedValue(detail({ ...first, accessSource: 'legacy', subscriptionStatus: 'active', canUseApp: true })); render(<AdminUsersPage />);
    await selectFirst();
    expect(screen.getByText('Paid subscription').nextSibling).toHaveTextContent('None');
    expect(screen.getByText('Founding access').nextSibling).toHaveTextContent('Active');
  });
  it('reviews administrator escalation explicitly and submits only the chosen role', async () => {
    api.adminAccountRole.mockResolvedValue(detail({ ...first, role: 'admin', revision: 8 })); render(<AdminUsersPage />); await selectFirst();
    fireEvent.click(screen.getByRole('button', { name: 'Change role' }));
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Operations owner' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review change' }));
    expect(screen.getByText(/This grants full control/)).toBeInTheDocument(); expect(api.adminAccountRole).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
    await screen.findByText('Role updated.');
    expect(api.adminAccountRole).toHaveBeenCalledExactlyOnceWith('first', { role: 'admin', reason: 'Operations owner', expectedRevision: 7 });
  });
  it('blocks retries after an uncertain write until the account is refreshed', async () => {
    api.adminAccountGrant.mockRejectedValue(new ApiError(0, 'request_timeout')); render(<AdminUsersPage />); await grantReview();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
    await screen.findByText(/result has not been confirmed/);
    expect(screen.getByRole('button', { name: 'Grant free access' })).toBeDisabled();
    expect(api.adminAccountGrant).toHaveBeenCalledTimes(1);
    api.adminAccount.mockResolvedValue(detail({ ...first, revision: 8, canUseApp: true, complimentary: { status: 'active' } }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh account details' }));
    await screen.findByRole('button', { name: 'Update free access' });
    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
    expect(api.adminAccountGrant).toHaveBeenCalledTimes(1);
  });
  it('refreshes revision conflicts before another reviewed change', async () => {
    api.adminAccountGrant.mockRejectedValue(new ApiError(409, 'revision_conflict')); render(<AdminUsersPage />); await grantReview();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
    await screen.findByText(/account changed while you were reviewing/);
    expect(screen.getByRole('button', { name: 'Grant free access' })).toBeDisabled();
  });
  it('revokes only free access while showing the remaining paid subscription', async () => {
    const paid = { ...first, canUseApp: true, subscriptionStatus: 'active', accessSource: 'complimentary', complimentary: { status: 'active' } };
    api.adminAccount.mockResolvedValue(detail(paid)); api.adminAccountRevoke.mockResolvedValue(detail({ ...paid, complimentary: { status: 'revoked' }, accessSource: 'subscription', revision: 8 })); render(<AdminUsersPage />);
    fireEvent.click(await screen.findByRole('button', { name: /first@example.com/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Revoke free access' }));
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Pilot complete' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review change' }));
    expect(screen.getByText(/Any subscription or founding access remains unchanged/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm change' }));
    await screen.findByText('Complimentary access revoked. Other access is unchanged.');
    expect(api.adminAccountRevoke).toHaveBeenCalledExactlyOnceWith('first', { reason: 'Pilot complete', expectedRevision: 7 });
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});
