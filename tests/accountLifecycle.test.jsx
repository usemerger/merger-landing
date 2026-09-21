import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const nav = vi.hoisted(() => ({ router: { replace: vi.fn(), refresh: vi.fn() }, query: '', pathname: '/dashboard' }));
vi.mock('next/navigation', () => ({ useRouter: () => nav.router, useSearchParams: () => new URLSearchParams(nav.query), usePathname: () => nav.pathname }));
vi.mock('next/link', () => ({ default: ({ children, replace, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/components/PlanStep', () => ({ default: () => <div data-testid="checkout">Paid activation</div>, useStartCheckout: () => ({ start: vi.fn(), busy: false }) }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), accountAccess: vi.fn(), accountWaitlist: vi.fn(), acceptInvitation: vi.fn(), meOrNull: vi.fn(), billingStatus: vi.fn(), resendVerification: vi.fn(), adminWaitlist: vi.fn(), adminInvite: vi.fn(), adminRevoke: vi.fn(), updateProfile: vi.fn(), logoutAll: vi.fn(), forgotPassword: vi.fn() }));
import * as api from '../app/lib/api';
import AccountDashboard from '../app/components/AccountDashboard';
import InvitePage from '../app/invite/page';
import VerifyEmailPage from '../app/verify-email/page';
import AdminWaitlistPage from '../app/admin/waitlist/page';
import ProfilePage from '../app/profile/page';
const user = { id: 'account1', userId: 'account1', email: 'person@example.com', displayName: 'Morgan Ellis', emailVerified: true, handle: 'morgan' };
const billing = { entitlementStatus: 'none', entitled: false };
const waiting = { user, admission: { status: 'waiting' }, waitlist: { status: 'waiting', referralCode: 'public123', position: 12, referralCount: 2 }, capabilities: { canCheckout: false, canDownload: false, canUseApp: false, isAdmin: false }, billing };
beforeEach(() => {
  vi.clearAllMocks(); nav.query = ''; nav.pathname = '/dashboard';
  api.accountAccess.mockResolvedValue(waiting); api.meOrNull.mockResolvedValue(user); api.billingStatus.mockResolvedValue(billing);
  localStorage.clear(); sessionStorage.clear();
});

describe('server-authorized account states', () => {
  it('keeps waiting users out of checkout even with forged client invite state', async () => {
    sessionStorage.setItem('merger_invite', 'anything');
    nav.query = 'invite=anything';
    render(<AccountDashboard />);
    await screen.findByRole('heading', { name: 'You’re on the waitlist.' });
    expect(screen.getByDisplayValue('https://usemerger.com/?ref=public123')).toBeInTheDocument();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reserve handle' })).not.toBeInTheDocument();
  });
  it('keeps account and waitlist usable when billing fails', async () => {
    api.billingStatus.mockRejectedValue(new api.ApiError(502));
    render(<AccountDashboard />);
    await screen.findByRole('heading', { name: 'You’re on the waitlist.' });
    expect(await screen.findByText(/Billing details are temporarily unavailable/)).toBeInTheDocument();
    expect(screen.getByText('person@example.com')).toBeInTheDocument();
  });
  it('shows verification before any waitlist enrollment or activation', async () => {
    api.accountAccess.mockResolvedValue({ ...waiting, user: { ...user, emailVerified: false }, admission: { status: 'verify_email' }, waitlist: null });
    api.resendVerification.mockResolvedValue({ ok: true });
    render(<AccountDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: 'Resend verification email' }));
    await screen.findByText(/Verification email sent/);
    expect(api.accountWaitlist).not.toHaveBeenCalled();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
  });
  it('joins an existing verified account only on an explicit action', async () => {
    api.accountAccess.mockResolvedValue({ ...waiting, admission: { status: 'not_joined' }, waitlist: null });
    api.accountWaitlist.mockResolvedValue(waiting);
    render(<AccountDashboard />);
    const join = await screen.findByRole('button', { name: 'Join the waitlist' });
    expect(api.accountWaitlist).not.toHaveBeenCalled();
    fireEvent.click(join);
    await screen.findByRole('heading', { name: 'You’re on the waitlist.' });
    expect(api.accountWaitlist).toHaveBeenCalledTimes(1);
  });
  it('does not treat the verified query parameter as proof', async () => {
    nav.query = 'verified=1';
    api.accountAccess.mockResolvedValue({ ...waiting, user: { ...user, emailVerified: false } });
    render(<VerifyEmailPage />);
    await screen.findByRole('heading', { name: 'Verify your email.' });
    expect(nav.router.replace).not.toHaveBeenCalled();
  });
});

describe('invitation lifecycle', () => {
  it('preserves the private invitation through sign-in', async () => {
    nav.query = 'token=secret-token'; api.accountAccess.mockRejectedValue(new api.ApiError(401));
    render(<InvitePage />);
    expect(await screen.findByRole('link', { name: 'Sign in to continue' })).toHaveAttribute('href', '/login?next=%2Finvite%3Ftoken%3Dsecret-token');
    expect(api.acceptInvitation).not.toHaveBeenCalled();
  });
  it('ignores a public referral code as admission proof', async () => {
    nav.query = 'code=public123'; render(<InvitePage />);
    await screen.findByText(/older link cannot activate/);
    expect(screen.queryByRole('button', { name: 'Accept invitation' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
  });
  it('accepts only explicitly and updates from the server response', async () => {
    nav.query = 'token=private-token';
    api.acceptInvitation.mockResolvedValue({ ...waiting, admission: { status: 'accepted' }, capabilities: { ...waiting.capabilities, canCheckout: true } });
    render(<InvitePage />);
    const accept = await screen.findByRole('button', { name: 'Accept invitation' });
    expect(api.acceptInvitation).not.toHaveBeenCalled();
    fireEvent.click(accept); fireEvent.click(accept);
    await screen.findByRole('heading', { name: 'Your invitation is accepted.' });
    expect(api.acceptInvitation).toHaveBeenCalledExactlyOnceWith('private-token');
    expect(screen.getByRole('link', { name: 'Continue to activation' })).toHaveAttribute('href', '/dashboard');
  });
  it.each(['invite_wrong_account', 'invite_expired', 'invite_revoked'])('keeps %s recoverable without granting access', async (code) => {
    nav.query = 'token=private-token'; api.acceptInvitation.mockRejectedValue(new api.ApiError(410, code));
    render(<InvitePage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Accept invitation' }));
    await screen.findByRole('alert');
    expect(screen.queryByRole('link', { name: 'Continue to activation' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept invitation' })).toBeEnabled();
  });
});

describe('profile and staff rollout', () => {
  it('saves profile through the current-account endpoint', async () => {
    api.updateProfile.mockResolvedValue({ ...user, displayName: 'Morgan E' });
    render(<ProfilePage />);
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Morgan E' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
    await screen.findByText('Your profile has been saved.');
    expect(api.updateProfile).toHaveBeenCalledExactlyOnceWith('Morgan E');
  });
  it('never fetches the staff queue for an ordinary account', async () => {
    render(<AdminWaitlistPage />);
    await screen.findByRole('heading', { name: 'Staff access required' });
    expect(api.adminWaitlist).not.toHaveBeenCalled();
  });
  it('requires reviewing a batch before sending invitations', async () => {
    api.accountAccess.mockResolvedValue({ ...waiting, capabilities: { ...waiting.capabilities, isAdmin: true } });
    api.adminWaitlist.mockResolvedValue({ waitlist: [{ id: 3, email: 'test@example.com', accountLinked: true, emailVerified: true, admitted: false }] });
    api.adminInvite.mockResolvedValue({ ok: true, emailed: true });
    render(<AdminWaitlistPage />);
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select for invitation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Review invitations' }));
    expect(api.adminInvite).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Send 1 invitation' }));
    await waitFor(() => expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(3));
    await screen.findByText('1 invitation email sent.');
  });
});
