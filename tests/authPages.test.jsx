import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ router: { replace: vi.fn(), refresh: vi.fn() }, query: '', pathname: '/dashboard' }));
vi.mock('next/navigation', () => ({ useRouter: () => nav.router, useSearchParams: () => new URLSearchParams(nav.query), usePathname: () => nav.pathname }));
vi.mock('next/link', () => ({ default: ({ children, replace, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/components/PlanStep', () => ({ default: () => <div data-testid="checkout">Review paid alpha</div>, useStartCheckout: () => ({ start: vi.fn(), busy: false }) }));
vi.mock('../app/lib/api', async (original) => {
  const actual = await original();
  return { ...actual, accountAccess: vi.fn(), accountWaitlist: vi.fn(), acceptInvitation: vi.fn(), meOrNull: vi.fn(), signup: vi.fn(), login: vi.fn(), claimHandle: vi.fn(), handleAvailable: vi.fn(), resendVerification: vi.fn(), billingStatus: vi.fn(), billingPortal: vi.fn(), download: vi.fn(), resetPassword: vi.fn(), forgotPassword: vi.fn() };
});

import * as api from '../app/lib/api';
import SignupPage from '../app/signup/page';
import LoginPage from '../app/login/page';
import ResetPasswordPage from '../app/reset-password/page';
import ForgotPasswordPage from '../app/forgot-password/page';
import AccountDashboard from '../app/components/AccountDashboard';
import DownloadPage from '../app/download/page';

const account = { userId: 'fixture-account', email: 'person@example.com', handle: 'person' };
const noSubscription = { entitlementStatus: 'none', entitled: false, configured: true };
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  nav.query = ''; nav.pathname = '/dashboard';
  api.meOrNull.mockResolvedValue(null);
  api.handleAvailable.mockResolvedValue({ available: true });
  api.billingStatus.mockResolvedValue(noSubscription);
  api.accountAccess.mockImplementation(async () => ({ user: { id: account.userId, email: account.email, emailVerified: true }, admission: { status: 'accepted' }, waitlist: null, capabilities: { canCheckout: true, canDownload: false, canUseApp: false }, billing: noSubscription }));
  api.signup.mockResolvedValue({ ok: true });
  api.claimHandle.mockImplementation(async (handle) => ({ ok: true, handle }));
});
afterEach(() => vi.useRealTimers());

describe('signup and sign-in recovery', () => {
  it('returns an already signed-in visitor to their intended page', async () => {
    api.meOrNull.mockResolvedValue(account);
    nav.query = 'next=/download';
    render(<LoginPage />);
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/download'));
  });
  it('creates a waitlist account without reserving a handle or offering checkout', async () => {
    render(<SignupPage />);
    await screen.findByRole('button', { name: 'Create account' });
    fill('Name', 'Morgan Ellis'); fill('Email', 'person@example.com'); fill('Password', 'fixture-password');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/verify-email?next=%2Fdashboard'));
    expect(api.signup).toHaveBeenCalledWith('person@example.com', 'fixture-password', 'Morgan Ellis', {});
    expect(api.claimHandle).not.toHaveBeenCalled();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
  });
  it('keeps a session outage distinct from being signed out and supports retry', async () => {
    api.meOrNull.mockRejectedValueOnce(new api.ApiError(502));
    render(<SignupPage />);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('button', { name: 'Create account' });
  });
  it('recovers a signup response loss without creating a second account', async () => {
    api.signup.mockRejectedValueOnce(new api.ApiError(502));
    render(<SignupPage />);
    await screen.findByRole('button', { name: 'Create account' });
    api.meOrNull.mockResolvedValue(account);
    fill('Name', 'Morgan'); fill('Email', 'person@example.com'); fill('Password', 'fixture-password');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/verify-email?next=%2Fdashboard'));
    expect(api.signup).toHaveBeenCalledTimes(1);
  });
  it('blocks malformed email and replaces an unsafe return URL on login', async () => {
    nav.query = 'next=/%5Cevil.test';
    api.login.mockResolvedValue({ ok: true });
    render(<LoginPage />);
    fill('Email', 'bad'); fill('Password', 'fixture-password');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(api.login).not.toHaveBeenCalled();
    fill('Email', 'person@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/dashboard'));
  });
});

describe('account and checkout', () => {
  it('shows the trial end, the later charge, and downloads for a confirmed trial', async () => {
    api.meOrNull.mockResolvedValue(account);
    api.billingStatus.mockResolvedValue({ ...noSubscription, entitlementStatus: 'trialing', entitled: true, offer: 'alpha', trialEndsAt: '2026-09-28T12:00:00Z', alphaPriceLocked: true, pricing: { amount: 5000, currency: 'usd', interval: 'month', intervalCount: 1, quantity: 1 } });
    render(<AccountDashboard />);
    const trial = await screen.findByRole('status', { name: 'Trial status' });
    expect(trial).toHaveTextContent('Your free trial ends on September 28, 2026');
    expect(trial).toHaveTextContent('After that, $50.00 / month is billed automatically.');
    expect(screen.getByRole('link', { name: 'Go to downloads' })).toBeInTheDocument();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
  });
  it('explains that canceling during the trial prevents any charge', async () => {
    api.meOrNull.mockResolvedValue(account);
    api.billingStatus.mockResolvedValue({ ...noSubscription, entitlementStatus: 'trialing', entitled: true, offer: 'alpha', cancelAtPeriodEnd: true, trialEndsAt: '2026-09-28T12:00:00Z' });
    render(<AccountDashboard />);
    expect(await screen.findByRole('status', { name: 'Trial status' })).toHaveTextContent('Your membership is set to end. You can use Merger until the trial ends, with nothing to pay.');
    expect(screen.queryByText(/is billed automatically/)).not.toBeInTheDocument();
  });
  it('labels a discounted multi-seat subscription as its total price', async () => {
    api.meOrNull.mockResolvedValue(account);
    api.billingStatus.mockResolvedValue({ ...noSubscription, entitlementStatus: 'active', entitled: true, plan: 'desk', seats: 2, pricing: { amount: 15900, currency: 'usd', interval: 'month', intervalCount: 1, quantity: 2, discounted: true } });
    render(<AccountDashboard />);
    await screen.findByText('$159.00 / month total');
    expect(screen.queryByText(/per seat/)).not.toBeInTheDocument();
  });
  it('lets an existing account reserve its missing handle before checkout', async () => {
    api.meOrNull.mockResolvedValue({ ...account, handle: undefined });
    render(<AccountDashboard />);
    await screen.findByRole('button', { name: 'Reserve handle' });
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
    fill('Your handle', 'desk_person');
    fireEvent.click(screen.getByRole('button', { name: 'Reserve handle' }));
    await screen.findByTestId('checkout');
    expect(api.signup).not.toHaveBeenCalled();
  });
  it('does not grant download access for an expired trial status', async () => {
    api.meOrNull.mockResolvedValue(account);
    api.billingStatus.mockResolvedValue({ ...noSubscription, entitlementStatus: 'trialing' });
    render(<AccountDashboard />);
    await screen.findByRole('heading', { name: 'Your Merger account.' });
    expect(screen.queryByRole('link', { name: 'Go to downloads' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
  });
  it('preserves checkout success when a session expires', async () => {
    nav.pathname = '/billing'; nav.query = 'checkout=success';
    render(<AccountDashboard />);
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith('/login?next=%2Fbilling%3Fcheckout%3Dsuccess'));
  });
  it('keeps polling after the first update, then unlocks after the webhook', async () => {
    vi.useFakeTimers(); nav.query = 'checkout=success';
    api.meOrNull.mockResolvedValue(account);
    api.billingStatus.mockResolvedValueOnce(noSubscription).mockResolvedValueOnce(noSubscription).mockResolvedValueOnce({ entitled: true, entitlementStatus: 'active' });
    render(<AccountDashboard />);
    await act(async () => {});
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(api.billingStatus).toHaveBeenCalledTimes(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(api.billingStatus).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('link', { name: 'Go to downloads' })).toBeInTheDocument();
  });
  it('shows canceled checkout as resumable without claiming payment succeeded', async () => {
    nav.query = 'checkout=cancelled'; api.meOrNull.mockResolvedValue(account);
    render(<AccountDashboard />);
    await screen.findByText(/Checkout was not completed/);
    expect(screen.getByTestId('checkout')).toBeInTheDocument();
  });
});

describe('recovery and downloads', () => {
  it('keeps password reset on an explicit success screen and resets state for a new token', async () => {
    nav.query = 'token=fixture-one'; api.resetPassword.mockResolvedValue({ ok: true });
    const view = render(<ResetPasswordPage />);
    fill('New password', 'fixture-password'); fill('Confirm new password', 'fixture-password');
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));
    await screen.findByRole('heading', { name: 'Your password is set.' });
    expect(nav.router.replace).not.toHaveBeenCalled();
    nav.query = 'token=fixture-two'; view.rerender(<ResetPasswordPage />);
    expect(screen.getByLabelText('New password')).toHaveValue('');
  });
  it('validates reset email and displays a neutral account-existence message', async () => {
    api.forgotPassword.mockResolvedValue({ ok: true });
    render(<ForgotPasswordPage />);
    fill('Email', 'invalid'); fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(api.forgotPassword).not.toHaveBeenCalled();
    fill('Email', 'person@example.com'); fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    await screen.findByText(/If an account exists for/);
  });
  it('keeps a non-subscription 403 as an error, and retries into the current installer list', async () => {
    api.meOrNull.mockResolvedValue(account);
    api.download.mockRejectedValueOnce(new api.ApiError(403, 'forbidden')).mockResolvedValueOnce({ builds: { windows: 'https://releases.buildmerger.com/fixture.exe' }, version: 'test' });
    render(<DownloadPage />);
    await screen.findByRole('alert');
    expect(screen.queryByTestId('checkout')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    const installer = await screen.findByRole('link', { name: 'Download for Windows (vtest)' });
    expect(installer).toHaveAttribute('href', 'https://releases.buildmerger.com/fixture.exe');
  });
});
