import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../app/lib/waitlistImport', async (original) => ({ ...await original(), readImportFile: vi.fn() }));
vi.mock('../app/lib/api', async (original) => ({ ...await original(), adminPreviewWaitlistImport: vi.fn(), adminImportWaitlist: vi.fn() }));

import * as api from '../app/lib/api';
import { readImportFile } from '../app/lib/waitlistImport';
import WaitlistImport from '../app/admin/waitlist/WaitlistImport';

const contact = { row: 2, name: 'Morgan Ellis', email: 'morgan@example.com', firm: 'Oak Street', role: 'Partner' };
const parsed = { sheetNames: ['Contacts'], sheet: 'Contacts', rows: [
  { row: 1, cells: ['Name', 'Email', 'Company', 'Role', 'Private notes'] },
  { row: 2, cells: ['Morgan Ellis', 'morgan@example.com', 'Oak Street', 'Partner', 'Never transmit this'] },
] };
const preview = { summary: { ready: 1, existing: 0, duplicate: 0, invalid: 0 }, rows: [{ ...contact, status: 'new' }] };
const complete = { summary: { added: 1, existing: 0, duplicate: 0, invalid: 0 }, rows: [{ ...contact, status: 'added' }] };
const button = (name) => screen.getByRole('button', { name });

async function choose(props = {}) {
  const callbacks = { onClose: vi.fn(), onImported: vi.fn(), ...props };
  render(<WaitlistImport {...callbacks} />);
  const file = new File(['synthetic fixture'], 'contacts.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fireEvent.change(screen.getByLabelText('Contact spreadsheet'), { target: { files: [file] } });
  await screen.findByRole('heading', { name: 'Match your columns' });
  return { ...callbacks, file };
}
async function review(props = {}) {
  const context = await choose(props);
  fireEvent.click(button('Review contacts'));
  await screen.findByRole('heading', { name: 'Review your import' });
  return context;
}

beforeEach(() => {
  vi.resetAllMocks();
  readImportFile.mockResolvedValue(parsed);
  api.adminPreviewWaitlistImport.mockResolvedValue(preview);
  api.adminImportWaitlist.mockResolvedValue(complete);
});

describe('staff contact import', () => {
  it('reviews only mapped fields without adding contacts before explicit confirmation', async () => {
    const { onImported } = await review();
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledExactlyOnceWith([contact]);
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
    expect(screen.getByText(/Importing sends no emails and does not create accounts/)).toBeInTheDocument();
    expect(button('Add 1 to waitlist')).toBeEnabled();
    fireEvent.click(button('Back to columns'));
    expect(button('Review contacts')).toBeInTheDocument();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });

  it('requires the user to map an unrecognized email column', async () => {
    readImportFile.mockResolvedValue({ ...parsed, rows: [
      { row: 1, cells: ['Name', 'Address'] }, { row: 2, cells: ['Pat', 'pat@example.com'] },
    ] });
    await choose();
    expect(button('Review contacts')).toBeDisabled();
    expect(api.adminPreviewWaitlistImport).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Email address column' }), { target: { value: '1' } });
    fireEvent.click(button('Review contacts'));
    await screen.findByRole('heading', { name: 'Review your import' });
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledExactlyOnceWith([{ row: 2, name: 'Pat', email: 'pat@example.com', firm: '', role: '' }]);
  });

  it('combines first and last names and lets a full name override that combination', async () => {
    readImportFile.mockResolvedValue({ ...parsed, rows: [
      { row: 1, cells: ['First name', 'Last name', 'Email', 'Preferred'] },
      { row: 2, cells: ['  José ', ' Núñez  ', 'jose@example.com', 'Jo Núñez'] },
    ] });
    await review();
    expect(api.adminPreviewWaitlistImport).toHaveBeenLastCalledWith([{ row: 2, name: 'José Núñez', email: 'jose@example.com', firm: '', role: '' }]);
    fireEvent.click(button('Back to columns'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Full name column' }), { target: { value: '3' } });
    expect(screen.getByRole('combobox', { name: 'First name column' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Last name column' })).toBeDisabled();
    fireEvent.click(button('Review contacts'));
    await screen.findByRole('heading', { name: 'Review your import' });
    expect(api.adminPreviewWaitlistImport).toHaveBeenLastCalledWith([{ row: 2, name: 'Jo Núñez', email: 'jose@example.com', firm: '', role: '' }]);
  });

  it('shows authoritative partial-validity counts and filters only corrections', async () => {
    api.adminPreviewWaitlistImport.mockResolvedValue({
      summary: { ready: 1, existing: 1, duplicate: 1, invalid: 1 },
      rows: [
        { ...contact, status: 'new' },
        { row: 3, name: 'Existing', email: 'existing@example.com', status: 'existing' },
        { row: 4, name: 'Repeated', email: 'morgan@example.com', status: 'duplicate' },
        { row: 5, name: 'Needs help', email: 'broken', status: 'invalid', error: 'Enter a valid email address.' },
      ],
    });
    await review();
    const totals = screen.getByLabelText('Import totals');
    for (const label of ['Ready to add', 'Already on waitlist', 'Repeated in file', 'Needs correction']) {
      expect(within(totals).getByText(label).parentElement).toHaveTextContent('1');
    }
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show corrections only' }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(within(table).getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(within(table).queryByText('Morgan Ellis')).not.toBeInTheDocument();
    expect(button('Add 1 to waitlist')).toBeEnabled();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });

  it('does not allow committing a review with no valid new contacts', async () => {
    api.adminPreviewWaitlistImport.mockResolvedValue({ summary: { ready: 0, existing: 1, duplicate: 0, invalid: 0 }, rows: [{ ...contact, status: 'existing' }] });
    await review();
    expect(button('Add 0 to waitlist')).toBeDisabled();
    fireEvent.click(button('Add 0 to waitlist'));
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });

  it('submits a confirmed batch once on a double click and reports successful import', async () => {
    let finish;
    api.adminImportWaitlist.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { onImported, onClose } = await review();
    const confirm = button('Add 1 to waitlist');
    fireEvent.click(confirm); fireEvent.click(confirm);
    expect(api.adminImportWaitlist).toHaveBeenCalledTimes(1);
    expect(api.adminImportWaitlist.mock.calls[0][0]).toEqual({ batchId: expect.any(String), filename: 'contacts.xlsx', rows: [contact] });
    expect(button('Adding to waitlist…')).toBeDisabled();
    expect(button('Close')).toBeDisabled();
    expect(onImported).not.toHaveBeenCalled();
    await act(async () => { finish(complete); });
    expect(screen.getByRole('heading', { name: '1 person added to the queue' })).toBeInTheDocument();
    expect(onImported).toHaveBeenCalledExactlyOnceWith(complete);
    expect(screen.getByText(/create and verify a Merger account with the same email/i)).toBeInTheDocument();
    fireEvent.click(button('Done'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('retains the same batch ID and reviewed rows after an uncertain network failure', async () => {
    api.adminImportWaitlist.mockRejectedValueOnce(new api.ApiError(0, 'network_error')).mockResolvedValueOnce(complete);
    const { onImported } = await review();
    fireEvent.click(button('Add 1 to waitlist'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not reach the server.*Retry to safely check or finish this same import/);
    const original = structuredClone(api.adminImportWaitlist.mock.calls[0][0]);
    expect(original.batchId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(onImported).not.toHaveBeenCalled();
    fireEvent.click(button('Add 1 to waitlist'));
    await screen.findByRole('heading', { name: '1 person added to the queue' });
    expect(api.adminImportWaitlist).toHaveBeenCalledTimes(2);
    expect(api.adminImportWaitlist.mock.calls[1][0]).toEqual(original);
    expect(api.adminPreviewWaitlistImport).toHaveBeenCalledTimes(1);
    expect(onImported).toHaveBeenCalledOnce();
  });

  it.each([
    [new api.ApiError(401), /session has expired/i],
    [new api.ApiError(403), /Staff access is required.*has not been imported/i],
    [new api.ApiError(0, 'network_error'), /Could not reach the server/i],
  ])('keeps column mapping available when preview fails: %s', async (error, message) => {
    api.adminPreviewWaitlistImport.mockRejectedValue(error);
    await choose();
    fireEvent.click(button('Review contacts'));
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(button('Review contacts')).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Email address column' })).toHaveValue('1');
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });

  it('shows rejected staff access at commit without reporting success', async () => {
    api.adminImportWaitlist.mockRejectedValue(new api.ApiError(403));
    const { onImported } = await review();
    fireEvent.click(button('Add 1 to waitlist'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Staff access is required/i);
    expect(onImported).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Review your import' })).toBeInTheDocument();
  });

  it('selects a contacts worksheet after an empty first sheet without making API calls', async () => {
    readImportFile.mockResolvedValueOnce({ sheetNames: ['Notes', 'Contacts'], sheet: 'Notes', rows: [] })
      .mockResolvedValueOnce({ ...parsed, sheetNames: ['Notes', 'Contacts'] });
    const { file } = await choose();
    expect(button('Review contacts')).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Worksheet' }), { target: { value: 'Contacts' } });
    await waitFor(() => expect(button('Review contacts')).toBeEnabled());
    expect(readImportFile).toHaveBeenLastCalledWith(file, 'Contacts');
    expect(api.adminPreviewWaitlistImport).not.toHaveBeenCalled();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
  });

  it('reports a file-read failure and allows another upload without reviewing or importing it', async () => {
    readImportFile.mockRejectedValueOnce(new Error('The CSV contains an unclosed quote. Export it again and retry.'));
    render(<WaitlistImport onClose={vi.fn()} onImported={vi.fn()} />);
    const input = screen.getByLabelText('Contact spreadsheet');
    fireEvent.change(input, { target: { files: [new File(['bad'], 'bad.csv')] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(/unclosed quote/);
    expect(input).toBeEnabled();
    expect(api.adminPreviewWaitlistImport).not.toHaveBeenCalled();
    expect(api.adminImportWaitlist).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { files: [new File(['fixed'], 'fixed.csv')] } });
    await screen.findByRole('heading', { name: 'Match your columns' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
