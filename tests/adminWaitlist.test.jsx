import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('../app/components/Shell', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../app/lib/waitlistImport', async (original) => ({ ...await original(), createImportSession: vi.fn() }));
vi.mock('../app/lib/api', async (original) => ({
  ...await original(), accountAccess: vi.fn(), adminWaitlist: vi.fn(), adminInvite: vi.fn(), adminRevoke: vi.fn(),
  adminPreviewWaitlistImport: vi.fn(), adminImportWaitlist: vi.fn(),
}));

import * as api from '../app/lib/api';
import { createImportSession } from '../app/lib/waitlistImport';
import AdminWaitlistPage from '../app/admin/waitlist/page';

const staff = { capabilities: { isAdmin: true } };
const importer = { capabilities: { isAdmin: false, canViewWaitlist: true, canImportWaitlist: true, canManageWaitlistInvitations: false } };
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
function pageResponse(rows, { page = 0, pageSize = 50, q = '', filter = 'all' } = {}) {
  const views = (row) => {
    const status = row.invitation?.status === 'pending' && new Date(row.invitation.expiresAt).getTime() <= Date.now() ? 'expired' : row.invitation?.status;
    const admitted = row.admitted || status === 'accepted';
    return { all: true, unverified: !row.emailVerified, eligible: row.accountLinked && row.emailVerified && !admitted && status !== 'pending', invited: !row.admitted && status === 'pending', admitted };
  };
  const counts = Object.fromEntries(['all', 'unverified', 'eligible', 'invited', 'admitted'].map((key) => [key, rows.filter((row) => views(row)[key]).length]));
  const matching = rows.filter((row) => views(row)[filter] && `${row.name || ''} ${row.email} ${row.firm || ''} ${row.role || ''}`.toLowerCase().includes(q.toLowerCase()));
  const actualPage = Math.min(page, Math.max(0, Math.ceil(matching.length / pageSize) - 1));
  return { waitlist: matching.slice(actualPage * pageSize, (actualPage + 1) * pageSize), totalCount: rows.length, filteredCount: matching.length, counts, page: actualPage, pageSize, hasMore: (actualPage + 1) * pageSize < matching.length };
}
function serve(rows) { api.adminWaitlist.mockImplementation(async (options) => pageResponse(rows, options)); }
async function click(element) { await act(async () => { fireEvent.click(element); }); }
async function searchFor(value) {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
  await waitFor(() => expect(api.adminWaitlist).toHaveBeenLastCalledWith(expect.objectContaining({ q: value.trim(), page: 0 })));
  await waitFor(() => expect(button('Refresh')).toBeEnabled());
}
async function show(rows = [ready]) {
  serve(rows);
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
    await click(button(/Ready to invite/i));
    expect(row(ready.email)).toBeInTheDocument();
    expect(row(second.email)).toBeInTheDocument();
    for (const person of [unverified, invited, admitted]) expect(screen.queryByText(person.email)).not.toBeInTheDocument();
    const search = screen.getByRole('searchbox');
    for (const query of ['NORTHLINE', 'Broker', 'second@']) {
      await searchFor(query);
      expect(row(second.email)).toBeInTheDocument();
      expect(screen.queryByText(ready.email)).not.toBeInTheDocument();
    }
  });

  it('shows only pending invitations or admitted accounts in their respective views', async () => {
    await show([ready, invited, admitted]);
    await click(button(/^Invited/));
    expect(row(invited.email)).toBeInTheDocument();
    expect(screen.queryByText(admitted.email)).not.toBeInTheDocument();
    await click(button(/^Admitted/));
    expect(row(admitted.email)).toBeInTheDocument();
    expect(screen.queryByText(invited.email)).not.toBeInTheDocument();
  });

  it('allows expired invitations to be reissued without classifying them as active invitations', async () => {
    const expired = signup('expired', 'expired@example.test', { invitation: { ...pending, expiresAt: '2020-01-01T00:00:00Z' } });
    await show([expired, invited]);
    await click(button(/Ready to invite/i));
    expect(row(expired.email)).toBeInTheDocument();
    expect(within(row(expired.email)).getByRole('checkbox')).toBeEnabled();
    expect(screen.queryByText(invited.email)).not.toBeInTheDocument();
    await click(button(/^Invited/));
    expect(screen.queryByText(expired.email)).not.toBeInTheDocument();
    expect(row(invited.email)).toBeInTheDocument();
  });

  it('updates invitation views and eligibility when an invitation expires without a refresh', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));
    let view;
    try {
      const expiring = signup('expiring', 'expiring@example.test', { invitation: { ...pending, expiresAt: new Date(Date.now() + 1000).toISOString() } });
      serve([expiring]);
      await act(async () => { view = render(<AdminWaitlistPage />); });
      await click(button('Invited'));
      expect(row(expiring.email)).toBeInTheDocument();
      expect(within(button('Invited')).getByText('1')).toBeInTheDocument();
      expect(within(button('Ready to invite')).getByText('0')).toBeInTheDocument();

      await act(async () => { vi.advanceTimersByTime(999); });
      expect(row(expiring.email)).toBeInTheDocument();
      await act(async () => { vi.advanceTimersByTime(2); });
      expect(screen.queryByText(expiring.email)).not.toBeInTheDocument();
      expect(within(button('Invited')).getByText('0')).toBeInTheDocument();
      expect(within(button('Ready to invite')).getByText('1')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No signups match this view.' })).toBeInTheDocument();
      await click(button('Ready to invite'));
      expect(within(row(expiring.email)).getByText('Expired')).toBeInTheDocument();
      expect(within(row(expiring.email)).getByRole('checkbox')).toBeEnabled();
      expect(api.adminWaitlist).toHaveBeenCalledTimes(4);
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
    await click(button('Review invitations'));
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
    await click(button('Review invitations'));
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
    await click(button('Review invitations'));
    await click(button('Send 2 invitations'));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument());
    expect(within(row(ready.email)).getByRole('checkbox')).not.toBeChecked();
    expect(within(row(second.email)).getByRole('checkbox')).toBeChecked();
    await click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).queryByText(ready.email)).not.toBeInTheDocument();
    expect(within(review).getByText(second.email)).toBeInTheDocument();
    expect(api.adminInvite).toHaveBeenCalledTimes(2);
  });

  it('stops a batch when staff authorization is rejected instead of submitting the remaining recipients', async () => {
    api.adminInvite.mockRejectedValue(new api.ApiError(403));
    await show([ready, second]);
    select(ready.email); select(second.email);
    await click(button('Review invitations'));
    await click(button('Send 2 invitations'));
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(ready.id);
  });

  it('drops selections that disappear or become admitted after a refresh', async () => {
    await show([ready, second]);
    select(ready.email); select(second.email);
    api.adminWaitlist.mockResolvedValue({ waitlist: [{ ...ready, admitted: true }] });
    await click(button(/Refresh/i));
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
    await click(button(/Refresh/i));
    await screen.findByRole('alert');
    for (const action of screen.queryAllByRole('button', { name: /Review invitations|Send \d+ invitation/ })) {
      expect(action).toBeDisabled();
    }
    expect(screen.queryByRole('region', { name: 'Review this invitation batch' })).not.toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
    api.adminWaitlist.mockResolvedValue({ waitlist: [ready] });
    await click(button('Try again'));
    await waitFor(() => expect(button('Review invitations')).toBeEnabled());
    await click(button('Review invitations'));
    await click(button('Send 1 invitation'));
    await waitFor(() => expect(api.adminInvite).toHaveBeenCalledExactlyOnceWith(ready.id));
  });

  it('requires revocation confirmation and supports cancelling without changing the invitation', async () => {
    await show([invited]);
    await click(button(`View details for ${invited.email}`));
    await click(button('Revoke invitation'));
    expect(button('Confirm revoke')).toBeInTheDocument();
    expect(api.adminRevoke).not.toHaveBeenCalled();
    await click(button('Keep invitation'));
    expect(screen.queryByRole('button', { name: 'Confirm revoke' })).not.toBeInTheDocument();
    expect(api.adminRevoke).not.toHaveBeenCalled();
    await click(button('Revoke invitation'));
    await click(button('Confirm revoke'));
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
    await click(button('Needs verification'));
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
    await searchFor('ELLIS');
    expect(row(imported.email)).toBeInTheDocument();
    expect(screen.queryByText(ready.email)).not.toBeInTheDocument();
  });

  it('lets staff open and close contact import without changing the queue or sending invitations', async () => {
    await show([ready]);
    await click(button('Import contacts'));
    expect(screen.getByRole('heading', { name: 'Import to waitlist' })).toBeInTheDocument();
    expect(button('Import contacts')).toBeDisabled();
    expect(api.adminWaitlist).toHaveBeenCalledTimes(1);
    expect(api.adminInvite).not.toHaveBeenCalled();
    await click(button('Close'));
    expect(screen.queryByRole('heading', { name: 'Import to waitlist' })).not.toBeInTheDocument();
    expect(button('Import contacts')).toBeEnabled();
    expect(row(ready.email)).toBeInTheDocument();
  });
});

describe('limited waitlist access', () => {
  it('lets an importer browse the full queue and invitation details without invitation controls', async () => {
    api.accountAccess.mockResolvedValue(importer);
    const people = [ready, invited, unverified, ...largeQueue(49)];
    await show(people);
    expect(api.adminWaitlist).toHaveBeenCalledOnce();
    expect(within(button('All signups')).getByText('52')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–50 of 52')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Select' })).not.toBeInTheDocument();
    expect(screen.queryByText('Choose your next invitations')).not.toBeInTheDocument();
    expect(screen.queryByText('Test the rollout')).not.toBeInTheDocument();
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 51–52 of 52')).toBeInTheDocument();
    await click(button('Invited'));
    await searchFor('INVITED@');
    expect(row(invited.email)).toBeInTheDocument();
    await click(button(`View details for ${invited.email}`));
    expect(screen.getByText('Sent to email provider')).toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('Email delivery').closest('td')).toHaveAttribute('colspan', '6');
    expect(screen.queryByRole('button', { name: /Revoke|Review invitations|Send \d+ invitation/ })).not.toBeInTheDocument();
    expect(button('Import contacts')).toBeEnabled();
    expect(api.adminInvite).not.toHaveBeenCalled();
    expect(api.adminRevoke).not.toHaveBeenCalled();
  });

  it.each(['csv', 'xls', 'xlsx'])('lets an importer review and add %s contacts without granting or sending invitations', async (extension) => {
    api.accountAccess.mockResolvedValue(importer);
    const contact = { row: 2, name: 'Morgan Ellis', email: 'morgan@example.com', firm: '', role: '' };
    const destroy = vi.fn();
    let report = [];
    createImportSession.mockResolvedValue({ sheetNames: ['Contacts'], sheet: 'Contacts', columnCount: 2, totalRows: 2, rows: [
      { row: 1, cells: ['Name', 'Email'] }, { row: 2, cells: [contact.name, contact.email] },
    ],
      prepare: async () => ({ total: 1, batchCount: 1 }), getBatch: async () => [contact],
      getCommitBatch: async () => [contact], destroy,
      setReportBatch: async (_index, result) => { report = result.rows; return result.summary; },
      applyCommitBatch: async (_index, result) => { report = result.rows; return result.summary; },
      getReportPage: async () => ({ rows: report, total: report.length }),
    });
    api.adminPreviewWaitlistImport.mockResolvedValue({ summary: { ready: 1, existing: 0, duplicate: 0, invalid: 0 }, rows: [{ ...contact, status: 'new' }] });
    api.adminImportWaitlist.mockImplementation(async (request) => ({ ok: true, batchId: request.batchId, summary: { added: 1, existing: 0, duplicate: 0, invalid: 0 }, rows: [{ ...contact, status: 'added' }] }));
    await show([invited]);
    await click(button('Import contacts'));
    expect(button('Download CSV template')).toBeInTheDocument();
    const file = new File(['synthetic contacts'], `contacts.${extension}`);
    fireEvent.change(screen.getByLabelText('Contact spreadsheet'), { target: { files: [file] } });
    await screen.findByRole('heading', { name: 'Match your columns' });
    await click(button('Review contacts'));
    await screen.findByRole('heading', { name: 'Review your import' });
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledExactlyOnceWith([contact]);
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
    await click(button('Add 1 to waitlist'));
    await screen.findByRole('heading', { name: '1 person added to the queue' });
    expect(api.adminImportWaitlist).toHaveBeenCalledExactlyOnceWith({ batchId: expect.any(String), filename: file.name, rows: [contact] });
    await waitFor(() => expect(api.adminWaitlist).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(button('Refresh')).toBeEnabled());
    expect(destroy).not.toHaveBeenCalled();
    expect(button('Download results')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revoke|Review invitations|Send \d+ invitation/ })).not.toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
    expect(api.adminRevoke).not.toHaveBeenCalled();
    await click(button('Done'));
    expect(destroy).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Download results' })).not.toBeInTheDocument();
  });

  it('keeps a viewer without import capability out of import and invitation actions', async () => {
    api.accountAccess.mockResolvedValue({ capabilities: { canViewWaitlist: true } });
    await show([invited]);
    await click(button(`View details for ${invited.email}`));
    expect(screen.getByText('Sent to email provider')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Import contacts|Revoke|Review invitations/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(api.adminPreviewWaitlistImport).not.toHaveBeenCalled();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
    expect(api.adminInvite).not.toHaveBeenCalled();
    expect(api.adminRevoke).not.toHaveBeenCalled();
  });

  it('clears invitation selections when an administrator becomes a limited importer', async () => {
    await show([ready, invited]);
    select(ready.email);
    await click(button('Review invitations'));
    expect(button('Send 1 invitation')).toBeInTheDocument();
    api.accountAccess.mockResolvedValue(importer);
    await click(button('Refresh'));
    await waitFor(() => expect(screen.queryByRole('checkbox')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Review invitations|Send \d+ invitation/ })).not.toBeInTheDocument();
    await click(button(`View details for ${invited.email}`));
    expect(screen.queryByRole('button', { name: /Revoke/ })).not.toBeInTheDocument();
    expect(button('Import contacts')).toBeEnabled();
    api.accountAccess.mockResolvedValue(staff);
    await click(button('Refresh'));
    await waitFor(() => expect(within(row(ready.email)).getByRole('checkbox')).toBeEnabled());
    expect(within(row(ready.email)).getByRole('checkbox')).not.toBeChecked();
    expect(api.adminInvite).not.toHaveBeenCalled();
    expect(api.adminRevoke).not.toHaveBeenCalled();
  });

  it('closes an open import when import capability is removed on refresh', async () => {
    api.accountAccess.mockResolvedValue(importer);
    await show([ready]);
    await click(button('Import contacts'));
    api.accountAccess.mockResolvedValue({ capabilities: { canViewWaitlist: true } });
    await click(button('Refresh'));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Import to waitlist' })).not.toBeInTheDocument());
    expect(row(ready.email)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import contacts' })).not.toBeInTheDocument();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });
});


describe('server-paged waitlist', () => {
  it('requests only 50 rows and reaches the final contacts of a 500,000-person queue', async () => {
    api.adminWaitlist.mockImplementation(async ({ page, pageSize, q, filter }) => ({
      waitlist: Array.from({ length: 50 }, (_, offset) => signup(page * 50 + offset, `person-${page * 50 + offset}@example.test`)),
      totalCount: 500000, filteredCount: 500000, counts: { all: 500000, eligible: 500000 }, page, pageSize, hasMore: page < 9999,
    }));
    render(<AdminWaitlistPage />);
    await screen.findByText('person-0@example.test');
    expect(api.adminWaitlist).toHaveBeenCalledExactlyOnceWith({ page: 0, pageSize: 50, q: '', filter: 'all' });
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(51);
    expect(screen.getByText('Showing 1–50 of 500,000')).toBeInTheDocument();
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Last' }));
    expect(api.adminWaitlist).toHaveBeenLastCalledWith({ page: 9999, pageSize: 50, q: '', filter: 'all' });
    expect(screen.getByText('person-499999@example.test')).toBeInTheDocument();
    expect(screen.getByText('Showing 499,951–500,000 of 500,000')).toBeInTheDocument();
    expect(screen.queryByText('person-0@example.test')).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(51);
    expect(within(button('All signups')).getByText('500000')).toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('searches the server and resets page for search and filter changes', async () => {
    const people = largeQueue(1100);
    people[1000] = { ...people[1000], name: 'Distant Prospect', emailVerified: false };
    await show(people);
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    await searchFor('DISTANT PROSPECT');
    expect(row(people[1000].email)).toBeInTheDocument();
    expect(screen.getByText('Showing 1–1 of 1')).toBeInTheDocument();
    expect(within(button('All signups')).getByText('1100')).toBeInTheDocument();
    await searchFor('');
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    await click(button('Needs verification'));
    expect(api.adminWaitlist).toHaveBeenLastCalledWith({ page: 0, pageSize: 50, q: '', filter: 'unverified' });
    expect(row(people[1000].email)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  });

  it('debounces search and ignores responses for an older query, including during the debounce interval', async () => {
    await show();
    let finishOld;
    api.adminWaitlist.mockImplementation(({ q, ...options }) => q === 'old' ? new Promise((resolve) => { finishOld = resolve; }) : Promise.resolve(pageResponse([second], { q, ...options })));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'o' } });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'old' } });
    await waitFor(() => expect(finishOld).toBeTypeOf('function'));
    expect(api.adminWaitlist).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'second' } });
    await act(async () => { finishOld(pageResponse([signup('stale', 'stale@example.test')], { q: '' })); });
    expect(screen.queryByText('stale@example.test')).not.toBeInTheDocument();
    await screen.findByText(second.email);
    expect(api.adminWaitlist).toHaveBeenLastCalledWith({ page: 0, pageSize: 50, q: 'second', filter: 'all' });
    expect(screen.queryByText('stale@example.test')).not.toBeInTheDocument();
  });

  it('reloads safely when a pending search is cleared back to the current query', async () => {
    await show();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'partial' } });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    await waitFor(() => expect(button('Refresh')).toBeEnabled());
    expect(row(ready.email)).toBeInTheDocument();
    select(ready.email);
    expect(button('Review invitations')).toBeEnabled();
  });

  it('uses the server clamp when a queue shrinks after moving to a later page', async () => {
    const people = largeQueue(120);
    await show(people);
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Last' }));
    expect(screen.getByText('Showing 101–120 of 120')).toBeInTheDocument();
    serve(people.slice(0, 75));
    await click(button('Refresh'));
    await screen.findByText('Showing 51–75 of 75');
    expect(row(people[74].email)).toBeInTheDocument();
    expect(api.adminWaitlist).toHaveBeenLastCalledWith({ page: 1, pageSize: 50, q: '', filter: 'all' });
  });

  it('keeps selected snapshots across pages and search, then reviews and sends only those recipients', async () => {
    const people = largeQueue(1100);
    await show(people);
    select(people[0].email);
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    select(people[50].email);
    await searchFor(people[1000].email);
    select(people[1000].email);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    await click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    for (const person of [people[0], people[50], people[1000]]) expect(within(review).getByText(person.email)).toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
    await click(within(review).getByRole('button', { name: 'Send 3 invitations' }));
    await waitFor(() => expect(api.adminInvite.mock.calls).toEqual([people[0], people[50], people[1000]].map((person) => [person.id])));
    expect(screen.queryByText('3 selected')).not.toBeInTheDocument();
  });

  it('selects only the current page and caps the cross-page batch at 100', async () => {
    const people = largeQueue(500);
    await show(people);
    await click(button('Select this page'));
    expect(screen.getByText('50 selected')).toBeInTheDocument();
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    await click(button('Select this page'));
    expect(screen.getByText('100 selected')).toBeInTheDocument();
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    expect(button('Select this page')).toBeDisabled();
    expect(within(row(people[100].email)).getByRole('checkbox')).toBeDisabled();
    await click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).getAllByRole('listitem')).toHaveLength(50);
    expect(within(review).getByRole('button', { name: 'Send 100 invitations' })).toBeEnabled();
    await click(within(within(review).getByRole('navigation', { name: 'Invitation review pages' })).getByRole('button', { name: 'Next' }));
    expect(within(review).getByText(people[99].email)).toBeInTheDocument();
    expect(within(review).queryByText(people[100].email)).not.toBeInTheDocument();
    expect(api.adminInvite).not.toHaveBeenCalled();
  });

  it('refreshes selected visible rows without discarding selected rows on another page', async () => {
    const people = largeQueue(110);
    await show(people);
    select(people[0].email);
    await click(within(screen.getByRole('navigation', { name: 'Waitlist pages' })).getByRole('button', { name: 'Next' }));
    select(people[50].email);
    people[50] = { ...people[50], admitted: true };
    await click(button('Refresh'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    await click(button('Review invitations'));
    const review = screen.getByRole('region', { name: 'Review this invitation batch' });
    expect(within(review).getByText(people[0].email)).toBeInTheDocument();
    expect(within(review).queryByText(people[50].email)).not.toBeInTheDocument();
  });
});
