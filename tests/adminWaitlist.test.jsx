import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
const largeQueue = (count = 1025) => Array.from({ length: count }, (_, index) => signup(`person-${index}`, `person-${index}@example.test`));

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

  it('updates invitation views and eligibility when an invitation expires without a refresh', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));
    let view;
    try {
      const expiring = signup('expiring', 'expiring@example.test', { invitation: { ...pending, expiresAt: new Date(Date.now() + 1000).toISOString() } });
      api.adminWaitlist.mockResolvedValue({ waitlist: [expiring] });
      await act(async () => { view = render(<AdminWaitlistPage />); });
      fireEvent.click(button('Invited'));
      expect(row(expiring.email)).toBeInTheDocument();
      expect(within(button('Invited')).getByText('1')).toBeInTheDocument();
      expect(within(button('Ready to invite')).getByText('0')).toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(999); });
      expect(row(expiring.email)).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(2); });
      expect(screen.queryByText(expiring.email)).not.toBeInTheDocument();
      expect(within(button('Invited')).getByText('0')).toBeInTheDocument();
      expect(within(button('Ready to invite')).getByText('1')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No signups match this view.' })).toBeInTheDocument();
      fireEvent.click(button('Ready to invite'));
      expect(within(row(expiring.email)).getByText('Expired')).toBeInTheDocument();
      expect(within(row(expiring.email)).getByRole('checkbox')).toBeEnabled();
      expect(api.adminWaitlist).toHaveBeenCalledTimes(1);
      expect(api.adminInvite).not.toHaveBeenCalled();
    } finally {
      view?.unmount();
      vi.useRealTimers();
    }
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
    expect(screen.queryByRole('button', { name: 'Import contacts' })).not.toBeInTheDocument();
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
    expect(screen.queryByRole('button', { name: 'Import contacts' })).not.toBeInTheDocument();
  });

  it('includes unlinked imported contacts in Needs verification while keeping invitations disabled', async () => {
    const imported = signup('imported', 'imported@example.test', { name: 'Morgan Ellis', source: 'admin_import', accountLinked: false, emailVerified: false });
    await show([ready, unverified, imported]);
    fireEvent.click(button('Needs verification'));
    expect(button('Needs verification')).toHaveAttribute('aria-pressed', 'true');
    expect(within(button('Needs verification')).getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(ready.email)).not.toBeInTheDocument();
    expect(row(unverified.email)).toBeInTheDocument();
    expect(within(row(imported.email)).getByText('Account not linked')).toBeInTheDocument();
    expect(within(row(imported.email)).getByRole('checkbox')).toBeDisabled();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('shows an imported name alongside its email and finds it through case-insensitive name search', async () => {
    const imported = signup('imported', 'imported@example.test', { name: 'Morgan Ellis', source: 'admin_import', accountLinked: false, emailVerified: false });
    await show([ready, imported]);
    expect(within(row(imported.email)).getByRole('button', { name: 'Morgan Ellis' })).toBeInTheDocument();
    expect(within(row(imported.email)).getByText('Imported')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ELLIS' } });
    expect(row(imported.email)).toBeInTheDocument();
    expect(screen.queryByText(ready.email)).not.toBeInTheDocument();
  });

  it('lets staff open and close contact import without changing the queue or sending invitations', async () => {
    await show([ready]);
    fireEvent.click(button('Import contacts'));
    expect(screen.getByRole('heading', { name: 'Import to waitlist' })).toBeInTheDocument();
    expect(button('Import contacts')).toBeDisabled();
    expect(api.adminWaitlist).toHaveBeenCalledTimes(1);
    expect(api.adminInvite).not.toHaveBeenCalled();
    fireEvent.click(button('Close'));
    expect(screen.queryByRole('heading', { name: 'Import to waitlist' })).not.toBeInTheDocument();
    expect(button('Import contacts')).toBeEnabled();
    expect(row(ready.email)).toBeInTheDocument();
  });
});

describe('waitlist administration with large queues', () => {
  it('bounds the rendered table to one page and adds only the currently expanded details', async () => {
    const people = largeQueue(20000);
    await show(people);
    const table = screen.getByRole('table');
    const pages = screen.getByRole('navigation', { name: 'Waitlist pages' });
    expect(within(table).getAllByRole('row')).toHaveLength(51);
    expect(screen.getByText('Showing 1–50 of 20,000')).toBeInTheDocument();
    expect(row(people[49].email)).toBeInTheDocument();
    expect(screen.queryByText(people[50].email)).not.toBeInTheDocument();
    expect(within(pages).getByRole('button', { name: 'Previous' })).toBeDisabled();

    fireEvent.click(button(`View details for ${people[0].email}`));
    expect(within(table).getAllByRole('row')).toHaveLength(52);
    expect(within(table).getAllByText('Email verification')).toHaveLength(1);
    fireEvent.click(button(`View details for ${people[1].email}`));
    expect(within(table).getAllByRole('row')).toHaveLength(52);
    expect(within(table).getAllByText('Email verification')).toHaveLength(1);
    expect(button(`View details for ${people[0].email}`)).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(within(pages).getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 51–100 of 20,000')).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(51);
    expect(row(people[50].email)).toBeInTheDocument();
    expect(row(people[99].email)).toBeInTheDocument();
    expect(screen.queryByText(people[0].email)).not.toBeInTheDocument();
    expect(screen.queryByText(people[100].email)).not.toBeInTheDocument();
    expect(within(pages).getByRole('button', { name: 'Previous' })).toBeEnabled();
    fireEvent.click(within(pages).getByRole('button', { name: 'Previous' }));
    expect(row(people[0].email)).toBeInTheDocument();
    expect(screen.queryByText(people[50].email)).not.toBeInTheDocument();
    expect(api.adminWaitlist).toHaveBeenCalledTimes(1);
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('searches and filters the full queue and resets the current page when the view changes', async () => {
    const people = largeQueue();
    people[1000] = { ...people[1000], name: 'Distant Prospect' };
    people[1001] = { ...people[1001], emailVerified: false };
    people[1002] = { ...people[1002], invitation: pending };
    people[1003] = { ...people[1003], admitted: true, invitation: { ...pending, status: 'accepted' } };
    await show(people);
    const search = screen.getByRole('searchbox');
    const nextPage = () => fireEvent.click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));

    nextPage();
    fireEvent.change(search, { target: { value: 'DISTANT PROSPECT' } });
    expect(row(people[1000].email)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByText(people[50].email)).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('Showing 1–50 of 1,025')).toBeInTheDocument();

    for (const [view, person] of [
      ['Needs verification', people[1001]],
      ['Invited', people[1002]],
      ['Admitted', people[1003]],
    ]) {
      nextPage();
      fireEvent.click(button(view));
      expect(row(person.email)).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
      expect(screen.queryByText(people[0].email)).not.toBeInTheDocument();
      fireEvent.click(button('All signups'));
      expect(screen.getByText('Showing 1–50 of 1,025')).toBeInTheDocument();
    }

    nextPage();
    fireEvent.click(button('Ready to invite'));
    expect(row(people[0].email)).toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'person-100' } });
    for (const index of [100, 1000, 1004, 1005, 1006, 1007, 1008, 1009]) expect(row(people[index].email)).toBeInTheDocument();
    for (const index of [1001, 1002, 1003]) expect(screen.queryByText(people[index].email)).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(9);
    expect(api.adminWaitlist).toHaveBeenCalledTimes(1);
  });

  it('clamps a page after the queue shrinks and keeps that page when the queue grows again', async () => {
    const people = largeQueue();
    await show(people);
    const pages = screen.getByRole('navigation', { name: 'Waitlist pages' });
    fireEvent.click(within(pages).getByRole('button', { name: 'Next' }));
    fireEvent.click(within(pages).getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 101–150 of 1,025')).toBeInTheDocument();

    api.adminWaitlist.mockResolvedValue({ waitlist: people.slice(0, 75) });
    fireEvent.click(button('Refresh'));
    await screen.findByText('Showing 51–75 of 75');
    expect(row(people[50].email)).toBeInTheDocument();
    expect(row(people[74].email)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(26);
    expect(within(pages).getByRole('button', { name: 'Next' })).toBeDisabled();

    api.adminWaitlist.mockResolvedValue({ waitlist: people });
    fireEvent.click(button('Refresh'));
    await screen.findByText('Showing 51–100 of 1,025');
    expect(row(people[50].email)).toBeInTheDocument();
    expect(row(people[99].email)).toBeInTheDocument();
    expect(screen.queryByText(people[100].email)).not.toBeInTheDocument();
    expect(within(pages).getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(api.adminWaitlist).toHaveBeenCalledTimes(3);
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('preserves selections across pages and views and sends every selected recipient exactly once', async () => {
    const people = largeQueue();
    people[50] = { ...people[50], invitation: pending };
    await show(people);
    select(people[0].email);
    const pages = screen.getByRole('navigation', { name: 'Waitlist pages' });
    fireEvent.click(within(pages).getByRole('button', { name: 'Next' }));
    select(people[50].email);
    fireEvent.click(within(pages).getByRole('button', { name: 'Previous' }));
    expect(within(row(people[0].email)).getByRole('checkbox')).toBeChecked();
    fireEvent.click(button('Invited'));
    expect(within(row(people[50].email)).getByRole('checkbox')).toBeChecked();
    fireEvent.click(button('Ready to invite'));
    expect(within(row(people[0].email)).getByRole('checkbox')).toBeChecked();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: people[1000].email } });
    select(people[1000].email);
    expect(screen.getByText('3 selected')).toBeInTheDocument();

    fireEvent.click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    const recipients = [people[0], people[50], people[1000]];
    for (const person of recipients) expect(within(review).getByText(person.email)).toBeInTheDocument();
    expect(within(review).getAllByRole('listitem')).toHaveLength(3);
    expect(api.adminInvite).not.toHaveBeenCalled();
    fireEvent.click(within(review).getByRole('button', { name: 'Send 3 invitations' }));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    expect(api.adminInvite.mock.calls).toEqual(recipients.map((person) => [person.id]));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument());
    expect(within(row(people[1000].email)).getByRole('checkbox')).not.toBeChecked();
  });

  it('paginates a large recipient review while sending the complete selected batch', async () => {
    const people = largeQueue();
    await show(people);
    const checkboxes = within(screen.getByRole('table')).getAllByRole('checkbox');
    act(() => { for (const checkbox of checkboxes) fireEvent.click(checkbox); });
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    select(people[50].email);
    fireEvent.click(button('Review invitations'));

    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    const recipients = within(review).getByRole('list', { name: 'Invitation recipients' });
    const pages = within(review).getByRole('navigation', { name: 'Invitation review pages' });
    expect(within(recipients).getAllByRole('listitem')).toHaveLength(50);
    expect(within(recipients).getByText(people[0].email)).toBeInTheDocument();
    expect(within(recipients).getByText(people[49].email)).toBeInTheDocument();
    expect(within(recipients).queryByText(people[50].email)).not.toBeInTheDocument();
    expect(within(pages).getByRole('button', { name: 'Previous' })).toBeDisabled();
    fireEvent.click(within(pages).getByRole('button', { name: 'Next' }));
    expect(within(recipients).getAllByRole('listitem')).toHaveLength(1);
    expect(within(recipients).getByText(people[50].email)).toBeInTheDocument();
    expect(within(recipients).queryByText(people[0].email)).not.toBeInTheDocument();
    expect(within(pages).getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(51);
    expect(api.adminInvite).not.toHaveBeenCalled();

    fireEvent.click(within(review).getByRole('button', { name: 'Send 51 invitations' }));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    expect(api.adminInvite.mock.calls).toEqual(people.slice(0, 51).map((person) => [person.id]));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument());
  });
});
