import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/api', async (original) => ({
  ...await original(), accountAccess: vi.fn(), adminWaitlist: vi.fn(), adminInvite: vi.fn(), adminRevoke: vi.fn(),
}));

import * as api from '../app/lib/api';
import AdminWaitlistPage from '../app/admin/waitlist/page';

const staff = { capabilities: { isAdmin: true } };
const pending = { status: 'pending', deliveryStatus: 'sent', expiresAt: '2099-10-05T12:00:00Z', cohort: 'alpha' };
const signup = (id, email, overrides = {}) => ({
  id, email, accountLinked: true, emailVerified: true, admitted: false,
  role: 'Investor', firm: 'Oak Street Partners', referralCount: 0,
  createdAt: '2026-09-20T12:00:00Z', status: 'waiting', invitation: null,
  ...overrides,
});
const ready = signup('ready', 'ready@example.test');
const second = signup('second', 'second@example.test', { firm: 'Northline', role: 'Broker' });
const unverified = signup('unverified', 'unverified@example.test', { emailVerified: false });
const unlinked = signup('unlinked', 'unlinked@example.test', { accountLinked: false, emailVerified: false });
const invited = signup('invited', 'invited@example.test', { invitation: pending });
const admitted = signup('admitted', 'admitted@example.test', { admitted: true, invitation: { ...pending, status: 'accepted' } });

function row(email) { return screen.getByText(email).closest('tr'); }
function select(email) { fireEvent.click(within(row(email)).getByRole('checkbox')); }
function button(name) { return screen.getByRole('button', { name }); }
async function show(rows = [ready]) {
  api.adminWaitlist.mockResolvedValue({ waitlist: rows });
  render(<AdminWaitlistPage />);
  await screen.findByText(rows[0].email);
}

beforeEach(() => {
  vi.resetAllMocks();
  api.accountAccess.mockResolvedValue(staff);
  api.adminInvite.mockResolvedValue({ ok: true, emailed: true });
  api.adminRevoke.mockResolvedValue({ ok: true });
});

describe('waitlist administration', () => {
  it('starts with every signup, including accounts that still need verification or linking', async () => {
    await show([ready, unverified, unlinked, invited, admitted]);
    for (const person of [ready, unverified, unlinked, invited, admitted]) {
      expect(row(person.email)).toBeInTheDocument();
    }
    for (const person of [unverified, unlinked, admitted]) {
      const checkbox = within(row(person.email)).queryByRole('checkbox');
      if (checkbox) expect(checkbox).toBeDisabled();
    }
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('combines the ready-to-invite filter with case-insensitive email, firm, or role search', async () => {
    await show([ready, second, unverified, invited, admitted]);
    fireEvent.click(button(/Ready to invite/i));
    expect(row(ready.email)).toBeInTheDocument();
    expect(row(second.email)).toBeInTheDocument();
    for (const person of [unverified, invited, admitted]) expect(screen.queryByText(person.email)).not.toBeInTheDocument();
    const search = screen.getByRole('searchbox');
    for (const query of ['NORTHLINE', 'Broker', 'second@']) {
      fireEvent.change(search, { target: { value: query } });
      expect(row(second.email)).toBeInTheDocument();
      expect(screen.queryByText(ready.email)).not.toBeInTheDocument();
    }
  });

  it('shows only pending invitations or admitted accounts in their respective views', async () => {
    await show([ready, invited, admitted]);
    fireEvent.click(button(/^Invited/));
    expect(row(invited.email)).toBeInTheDocument();
    expect(screen.queryByText(admitted.email)).not.toBeInTheDocument();
    fireEvent.click(button(/^Admitted/));
    expect(row(admitted.email)).toBeInTheDocument();
    expect(screen.queryByText(invited.email)).not.toBeInTheDocument();
  });

  it('allows expired invitations to be reissued without classifying them as active invitations', async () => {
    const expired = signup('expired', 'expired@example.test', { invitation: { ...pending, expiresAt: '2020-01-01T00:00:00Z' } });
    await show([expired, invited]);
    fireEvent.click(button(/Ready to invite/i));
    expect(row(expired.email)).toBeInTheDocument();
    expect(within(row(expired.email)).getByRole('checkbox')).toBeEnabled();
    expect(screen.queryByText(invited.email)).not.toBeInTheDocument();
    fireEvent.click(button(/^Invited/));
    expect(screen.queryByText(expired.email)).not.toBeInTheDocument();
    expect(row(invited.email)).toBeInTheDocument();
  });

  it('requires an explicit recipient review before sending, and does not send twice on a double click', async () => {
    let finish;
    api.adminInvite.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    await show([ready, second]);
    select(ready.email);
    fireEvent.click(button('Review invitations'));
    expect(api.adminInvite).not.toHaveBeenCalled();
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).getByText(ready.email)).toBeInTheDocument();
    expect(within(review).queryByText(second.email)).not.toBeInTheDocument();
    const send = within(review).getByRole('button', { name: 'Send 1 invitation' });
    fireEvent.click(send); fireEvent.click(send);
    expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(ready.id);
    finish({ ok: true, emailed: true });
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument());
  });

  it('warns that reissuing a pending invitation invalidates its previous link', async () => {
    await show([invited]);
    select(invited.email);
    fireEvent.click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).getByText(/previous link/i)).toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('keeps failed deliveries selected for an explicit retry and removes successful recipients', async () => {
    api.adminInvite.mockImplementation(async (id) => ({ ok: true, emailed: id === ready.id }));
    await show([ready, second]);
    api.adminWaitlist.mockResolvedValue({ waitlist: [
      { ...ready, invitation: pending },
      { ...second, invitation: { ...pending, deliveryStatus: 'failed' } },
    ] });
    select(ready.email); select(second.email);
    fireEvent.click(button('Review invitations'));
    fireEvent.click(button('Send 2 invitations'));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument());
    expect(within(row(ready.email)).getByRole('checkbox')).not.toBeChecked();
    expect(within(row(second.email)).getByRole('checkbox')).toBeChecked();
    fireEvent.click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).queryByText(ready.email)).not.toBeInTheDocument();
    expect(within(review).getByText(second.email)).toBeInTheDocument();
    expect(api.adminInvite).toHaveBeenCalledTimes(2);
  });

  it('stops a batch when staff authorization is rejected instead of submitting the remaining recipients', async () => {
    api.adminInvite.mockRejectedValue(new api.ApiError(403));
    await show([ready, second]);
    select(ready.email); select(second.email);
    fireEvent.click(button('Review invitations'));
    fireEvent.click(button('Send 2 invitations'));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(ready.id);
  });

  it('drops selections that disappear or become admitted after a refresh', async () => {
    await show([ready, second]);
    select(ready.email); select(second.email);
    api.adminWaitlist.mockResolvedValue({ waitlist: [{ ...ready, admitted: true }] });
    fireEvent.click(button(/Refresh/i));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText(second.email)).not.toBeInTheDocument());
    const review = screen.queryByRole('button', { name: 'Review invitations' });
    if (review) expect(review).toBeDisabled();
    const checkbox = within(row(ready.email)).queryByRole('checkbox');
    if (checkbox) expect(checkbox).not.toBeChecked();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('prevents sending a stale selection when refreshing the queue fails', async () => {
    await show([ready]);
    select(ready.email);
    api.adminWaitlist.mockRejectedValue(new api.ApiError(503));
    fireEvent.click(button(/Refresh/i));
    await screen.findByRole('alert');
    for (const action of screen.queryAllByRole('button', { name: /Review invitations|Send \d+ invitation/ })) {
      expect(action).toBeDisabled();
    }
    expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
    api.adminWaitlist.mockResolvedValue({ waitlist: [ready] });
    fireEvent.click(button('Try again'));
    await waitFor(() => expect(button('Review invitations')).toBeEnabled());
    fireEvent.click(button('Review invitations'));
    fireEvent.click(button('Send 1 invitation'));
    await waitFor(() => expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(ready.id));
  });

  it('requires revocation confirmation and supports cancelling without changing the invitation', async () => {
    await show([invited]);
    fireEvent.click(button(`View details for ${invited.email}`));
    fireEvent.click(button('Revoke invitation'));
    expect(button('Confirm revoke')).toBeInTheDocument();
    expect(api.adminRevoke).not.toHaveBeenCalled();
    fireEvent.click(button('Keep invitation'));
    expect(screen.queryByRole('button', { name: 'Confirm revoke' })).not.toBeInTheDocument();
    expect(api.adminRevoke).not.toHaveBeenCalled();
    fireEvent.click(button('Revoke invitation'));
    fireEvent.click(button('Confirm revoke'));
    await waitFor(() => expect(api.adminRevoke).toHaveBeenCalledExactlyOnceWith(invited.id));
  });

  it('does not request signup data for a non-staff account', async () => {
    api.accountAccess.mockResolvedValue({ capabilities: { isAdmin: false } });
    render(<AdminWaitlistPage />);
    await screen.findByRole('heading', { name: 'Staff access required' });
    expect(api.adminWaitlist).not.toHaveBeenCalled();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('redirects an expired session to sign-in with the dashboard destination preserved', async () => {
    api.accountAccess.mockRejectedValue(new api.ApiError(401));
    render(<AdminWaitlistPage />);
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/login?next=/admin/waitlist'));
    expect(api.adminWaitlist).not.toHaveBeenCalled();
  });

  it('does not expose queue actions when the server rejects staff access', async () => {
    api.adminWaitlist.mockRejectedValue(new api.ApiError(403));
    render(<AdminWaitlistPage />);
    await screen.findByRole('heading', { name: 'Staff access required' });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review invitations' })).not.toBeInTheDocument();
  });
});
