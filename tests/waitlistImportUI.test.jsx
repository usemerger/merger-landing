import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../app/lib/waitlistImport', async (original) => ({ ...await original(), createImportSession: vi.fn() }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), adminPreviewWaitlistImport: vi.fn(), adminImportWaitlist: vi.fn() }));
import * as api from '../app/lib/api';
import { createImportSession, mapImportRows } from '../app/lib/waitlistImport';
import WaitlistImport from '../app/admin/waitlist/WaitlistImport';

const contact = { row: 2, name: 'Morgan Ellis', email: 'morgan@example.com', firm: 'Oak Street', role: 'Partner' };
const parsed = { sheetNames: ['Contacts'], sheet: 'Contacts', columnCount: 5, rows: [
  { row: 1, cells: ['Name', 'Email', 'Company', 'Role', 'Private notes'] },
  { row: 2, cells: ['Morgan Ellis', 'morgan@example.com', 'Oak Street', 'Partner', 'Never transmit this'] },
] };
let session;
function fixture(source = parsed, batchSize = 500) {
  let mapped = [], reports = [];
  const summary = () => ({ total: reports.length, ready: reports.filter(r => r.status === 'new').length, added: reports.filter(r => r.status === 'added').length, existing: reports.filter(r => r.status === 'existing').length, duplicate: reports.filter(r => r.status === 'duplicate').length, invalid: reports.filter(r => r.status === 'invalid').length });
  return { ...source,
    prepare: vi.fn(async (mapping, headers) => { mapped = mapImportRows(source, mapping, headers); reports = []; return { total: mapped.length, batchCount: Math.ceil(mapped.length / batchSize) }; }),
    getBatch: vi.fn(async (index) => mapped.slice(index * batchSize, (index + 1) * batchSize)),
    setReportBatch: vi.fn(async (_, response) => { reports.push(...response.rows); return summary(); }),
    getReportPage: vi.fn(async ({ page, pageSize, issuesOnly }) => { const rows = reports.filter(r => !issuesOnly || r.status === 'invalid'); return { rows: rows.slice(page * pageSize, (page + 1) * pageSize), total: rows.length }; }),
    getCommitBatch: vi.fn(async (index) => mapped.slice(index * batchSize, (index + 1) * batchSize).filter(row => reports.some(r => r.row === row.row && r.status === 'new'))),
    applyCommitBatch: vi.fn(async (_, response) => { reports = reports.map(r => response.rows.find(row => row.row === r.row) || r); return summary(); }),
    exportReport: vi.fn(async () => new Blob(['report'])), destroy: vi.fn(),
  };
}
const button = (name) => screen.getByRole('button', { name });
async function choose(props = {}) {
  const callbacks = { onClose: vi.fn(), onImported: vi.fn(), ...props };
  const view = render(<WaitlistImport {...callbacks} />);
  const file = new File(['synthetic'], 'contacts.csv');
  fireEvent.change(screen.getByLabelText('Contact spreadsheet'), { target: { files: [file] } });
  await screen.findByRole('heading', { name: 'Match your columns' });
  return { ...callbacks, ...view, file };
}
async function review(props = {}) {
  const context = await choose(props);
  fireEvent.click(button('Review contacts'));
  await screen.findByRole('button', { name: /^Add \d/ });
  await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  return context;
}
beforeEach(() => {
  vi.resetAllMocks();
  session = fixture(); createImportSession.mockImplementation(async () => session);
  api.adminPreviewWaitlistImport.mockImplementation(async (rows) => ({ rows: rows.map(row => ({ ...row, status: 'new' })) }));
  api.adminImportWaitlist.mockImplementation(async ({ rows, batchId }) => ({ ok: true, batchId, rows: rows.map(row => ({ ...row, status: 'added' })) }));
});

describe('large staff contact import UI', () => {
  it('advertises500k and reviews only mapped fields without importing or emailing', async () => {
    const { onImported } = await review();
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledExactlyOnceWith([contact]);
    expect(api.adminImportWaitlist).not.toHaveBeenCalled(); expect(onImported).not.toHaveBeenCalled();
    expect(screen.getByText(/Importing sends no emails/)).toBeInTheDocument();
    fireEvent.click(button('Back to columns'));
    expect(screen.getByText(/500,000 contacts/)).toBeInTheDocument();
    expect(button('Review contacts')).toBeEnabled();
  });

  it('blocks an oversized mapped field but permits a large ignored export column', async () => {
    session = fixture({ ...parsed, rows: [parsed.rows[0], { row: 2, cells: [...parsed.rows[1].cells.slice(0, 4), 'x'.repeat(4097)] }] });
    await choose();
    fireEvent.change(screen.getByRole('combobox', { name: 'Role column' }), { target: { value: '4' } });
    fireEvent.click(button('Review contacts'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Row 2: Role is over 4,096 characters');
    expect(api.adminPreviewWaitlistImport).not.toHaveBeenCalled();
    fireEvent.click(button('Back to columns'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Role column' }), { target: { value: '3' } });
    fireEvent.click(button('Review contacts'));
    await screen.findByRole('button', { name: 'Add 1 to waitlist' });
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledExactlyOnceWith([contact]);
  });

  it('requires an email mapping and supports changing header/column settings', async () => {
    session = fixture({ ...parsed, columnCount: 2, rows: [{ row: 1, cells: ['Name', 'Address'] }, { row: 2, cells: ['Pat', 'pat@example.com'] }] });
    await choose(); expect(button('Review contacts')).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Email address column' }), { target: { value: '1' } });
    fireEvent.click(button('Review contacts')); await screen.findByRole('button', { name: 'Add 1 to waitlist' });
    expect(api.adminPreviewWaitlistImport).toHaveBeenLastCalledWith([{ row: 2, name: 'Pat', email: 'pat@example.com', firm: '', role: '' }]);
  });

  it('shows validation results and commits only valid new contacts', async () => {
    session = fixture({ ...parsed, rows: [parsed.rows[0], parsed.rows[1], { row: 3, cells: ['Existing', 'existing@example.com'] }, { row: 4, cells: ['Bad', 'broken'] }] });
    api.adminPreviewWaitlistImport.mockResolvedValue({ rows: [{ ...contact, status: 'new' }, { row: 3, name: 'Existing', email: 'existing@example.com', status: 'existing' }, { row: 4, name: 'Bad', email: 'broken', status: 'invalid', error: 'Enter a valid email address.' }] });
    await review();
    await waitFor(() => expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show corrections only' }));
    await waitFor(() => expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2));
    fireEvent.click(button('Add 1 to waitlist'));
    await screen.findByRole('heading', { name: '1 person added to the queue' });
    expect(api.adminImportWaitlist).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ rows: [contact] }));
  });

  it('prevents double submission and preserves the same uncertain batch on resume', async () => {
    let reject;
    api.adminImportWaitlist.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
    const { onImported } = await review();
    const submit = button('Add 1 to waitlist'); fireEvent.click(submit); fireEvent.click(submit);
    await waitFor(() => expect(api.adminImportWaitlist).toHaveBeenCalledTimes(1));
    expect(button('Close')).toBeDisabled(); expect(button('Adding to waitlist…')).toBeDisabled();
    await act(async () => reject(new api.ApiError(0, 'network_error')));
    expect(await screen.findByRole('alert')).toHaveTextContent('Completed batches are saved. Resume');
    const original = structuredClone(api.adminImportWaitlist.mock.calls[0][0]);
    fireEvent.click(button('Resume import'));
    await screen.findByRole('heading', { name: '1 person added to the queue' });
    expect(api.adminImportWaitlist.mock.calls[1][0]).toEqual(original);
    expect(onImported).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ ok: true, summary: expect.objectContaining({ added: 1 }) }));
  });

  it('pauses a multi-batch import after its current request and resumes later', async () => {
    session = fixture({ ...parsed, rows: [...parsed.rows, { row: 3, cells: ['Second', 'second@example.com'] }] }, 1);
    let finish;
    api.adminImportWaitlist.mockImplementationOnce(({ rows, batchId }) => new Promise(resolve => { finish = () => resolve({ ok: true, batchId, rows: rows.map(r => ({ ...r, status: 'added' })) }); }));
    await review(); fireEvent.click(button('Add 2 to waitlist'));
    await waitFor(() => expect(api.adminImportWaitlist).toHaveBeenCalledTimes(1));
    fireEvent.click(button('Pause')); await act(async () => finish());
    expect(button('Resume import')).toBeEnabled(); expect(api.adminImportWaitlist).toHaveBeenCalledTimes(1);
    fireEvent.click(button('Resume import')); await screen.findByRole('heading', { name: '2 people added to the queue' });
    expect(api.adminImportWaitlist).toHaveBeenCalledTimes(2);
  });

  it('mounts only50 report rows and requests a new page instead of accumulating DOM rows', async () => {
    session.getReportPage.mockImplementation(async ({ page, pageSize }) => ({ total: 200000, rows: Array.from({ length: pageSize }, (_, i) => ({ ...contact, row: page * pageSize + i + 2, name: `Contact ${page * pageSize + i}`, status: 'new' })) }));
    await review();
    await waitFor(() => expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(51));
    expect(screen.getByRole('navigation', { name: 'Import result pages' })).toHaveTextContent('200,000');
    fireEvent.click(button('Next')); await screen.findByText('Contact 50');
    expect(screen.queryByText('Contact 0')).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(51);
    expect(session.getReportPage).toHaveBeenLastCalledWith({ page: 1, pageSize: 50, issuesOnly: false });
  });

  it('keeps staff errors actionable and never reports a failed import as complete', async () => {
    api.adminImportWaitlist.mockRejectedValue(new api.ApiError(403));
    const { onImported } = await review(); fireEvent.click(button('Add 1 to waitlist'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Staff access is required');
    expect(onImported).not.toHaveBeenCalled(); expect(button('Resume import')).toBeEnabled();
  });

  it('terminates the worker when the panel unmounts', async () => {
    const view = await choose(); view.unmount(); expect(session.destroy).toHaveBeenCalledOnce();
  });
});
