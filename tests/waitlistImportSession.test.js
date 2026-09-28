// @vitest-environment node
import { describe, expect, it, vi, afterEach } from 'vitest';
import * as XLSX from 'xlsx';
import { ImportSessionEngine, walkCsvFile, createCsvParser, inspectExcelZip, parseImportBuffer, parseCsv } from '../app/lib/waitlistImportParser';
import { createImportSession, guessMapping, checkFile } from '../app/lib/waitlistImport';
import { BATCH_BYTE_LIMIT, EXCEL_FILE_LIMIT, FILE_LIMIT, IMPORT_LIMIT } from '../app/lib/waitlistImportLimits';

const csvFile = (text) => new File([text], 'contacts.csv', { type: 'text/csv' });
const mapping = { name: '0', email: '1', firstName: '', lastName: '', firm: '', role: '' };
const response = (rows, status = 'new') => ({ rows: rows.map((row) => ({ ...row, email: row.email.trim().toLowerCase(), status })) });
async function session(text) { const engine = new ImportSessionEngine(); await engine.init(csvFile(text)); await engine.prepare(mapping); return engine; }

describe('streamed CSV contact sessions', () => {
  it('previews and prepares exactly 500,000 contacts without reading the whole File or exposing raw rows', async () => {
    const chunk = Array.from({ length: 1000 }, (_, i) => `Person ${i},person${i}@example.com,private unused field\n`).join('');
    const file = new File(['Name,Email,Notes\n', ...Array(500).fill(chunk)], 'contacts.csv');
    file.arrayBuffer = () => { throw new Error('Whole-file reads are forbidden for CSV'); };
    const progress = vi.fn(), engine = new ImportSessionEngine(progress);
    const metadata = await engine.init(file);
    expect(metadata.rows).toHaveLength(11);
    expect(metadata).toMatchObject({ totalRows: 500001, columnCount: 3 });
    expect(await engine.prepare(mapping)).toEqual({ total: IMPORT_LIMIT, batchCount: 1000 });
    expect(engine.getBatch(999)).toHaveLength(500);
    expect(engine.getBatch(0)[0]).toEqual({ row: 2, name: 'Person 0', email: 'person0@example.com', firm: '', role: '' });
    expect(progress).toHaveBeenLastCalledWith(expect.objectContaining({ processed: file.size, total: file.size }));
    engine.destroy(); expect(engine.contacts).toHaveLength(0); expect(engine.file).toBeNull();
  }, 30000);

  it('rejects 500,001 contacts, including headerless and unmapped rows', async () => {
    let count = 0;
    const parser = createCsvParser({ captureRows: 0, onRow: () => count++ });
    parser.write('Name,Email\n');
    const thousand = 'Pat,pat@example.com\n'.repeat(1000);
    for (let i = 0; i < 500; i++) parser.write(thousand);
    expect(() => parser.write('Overflow,overflow@example.com\n')).toThrow(/500,000/);
    expect(count).toBe(500001);
    const engine = new ImportSessionEngine();
    await engine.init(csvFile('Pat,pat@example.com\n'.repeat(500001)));
    await expect(engine.prepare(mapping, false)).rejects.toThrow(/500,000/);
    expect(engine.getSummary().total).toBe(0);
  }, 30000);

  it.each([1, 2, 3, 7, 64])('preserves UTF-8, quoted delimiters, escaped quotes and embedded CRLF across %i-byte slices', async (chunkSize) => {
    const text = '\uFEFFName;Email;Notes\r\n"Zoë, 李 😀";zoe@example.com;"A ""quote""\r\nand next"\r\nPat;pat@example.com;Done';
    const rows = [];
    await walkCsvFile(csvFile(text), (row) => rows.push(row), { chunkSize });
    expect(rows).toEqual(parseCsv(text).rows);
    expect(rows[1].cells).toEqual(['Zoë, 李 😀', 'zoe@example.com', 'A "quote"\r\nand next']);
    expect(rows[2].row).toBe(4);
  });

  it.each([false, true])('streams UTF-16 with surrogate pairs and split BOM (big endian %s)', async (bigEndian) => {
    const text = '\uFEFFName\tEmail\r\n李 😀\tli@example.com';
    const bytes = new Uint8Array(text.length * 2), view = new DataView(bytes.buffer);
    for (let i = 0; i < text.length; i++) view.setUint16(i * 2, text.charCodeAt(i), !bigEndian);
    const rows = [];
    await walkCsvFile(new File([bytes], 'utf16.csv'), (row) => rows.push(row), { chunkSize: 3 });
    expect(rows[1].cells).toEqual(['李 😀', 'li@example.com']);
  });

  it('detects a semicolon delimiter after leading empty records', async () => {
    const rows = [];
    await walkCsvFile(csvFile('\r\n\nName;Email\r\nPat;pat@example.com'), (row) => rows.push(row), { chunkSize: 2 });
    expect(rows).toEqual([{ row: 3, cells: ['Name', 'Email'] }, { row: 4, cells: ['Pat', 'pat@example.com'] }]);
  });

  it('discards giant unused fields while checking selected fields before trimming', async () => {
    const engine = new ImportSessionEngine();
    const metadata = await engine.init(csvFile(`Name,Email,Notes\nPat,pat@example.com,"${('unused,""quoted""\n').repeat(100000)}"\nNext,next@example.com,small`));
    expect(metadata.rows[1].cells[2]).toHaveLength(4097);
    await engine.prepare(mapping);
    expect(engine.getBatch(0)).toHaveLength(2);
    expect(engine.getBatch(0)[0]).not.toHaveProperty('cells');
    await expect(engine.prepare({ ...mapping, name: '2' })).rejects.toThrow(/Row 2: Full name is over/);
    expect(engine.contacts).toHaveLength(0);
    await engine.init(csvFile(`Name,Email\n${' '.repeat(4097)},pat@example.com`));
    await expect(engine.prepare(mapping)).rejects.toThrow(/4,096/);
    await engine.init(csvFile('Name,Email\nPat,pat@example.com'));
    await expect(engine.prepare({ ...mapping, email: '99', name: '' })).rejects.toThrow(/No contacts/);
  });

  it('rejects malformed quote boundaries and empty selected/header-only files', async () => {
    for (const text of ['Name,Email\n"Pat', 'Name,Email\n"Pat"oops,p@example.com', 'Name,Email\nPa"t,p@example.com']) {
      await expect(walkCsvFile(csvFile(text), () => {}, { chunkSize: 1 })).rejects.toThrow(/quote/);
    }
    const engine = new ImportSessionEngine(); await engine.init(csvFile('Name,Email'));
    await expect(engine.prepare(mapping)).rejects.toThrow(/No contacts/);
    await engine.init(csvFile('Pat,pat@example.com\nLee,lee@example.com'));
    expect(await engine.prepare(mapping, false)).toEqual({ total: 2, batchCount: 1 });
    expect(engine.getBatch(0)[0].row).toBe(1);
  });

  it('partitions by encoded UTF-8 JSON bytes as well as 500 rows', async () => {
    const long = '李'.repeat(4096);
    const engine = new ImportSessionEngine();
    await engine.init(csvFile('Name,Email,Company,Role\n' + Array.from({ length: 500 }, (_, i) => `${long},p${i}@example.com,${long},${long}`).join('\n')));
    const prepared = await engine.prepare({ ...mapping, firm: '2', role: '3' });
    expect(prepared.batchCount).toBeGreaterThan(1);
    let count = 0;
    for (let i = 0; i < prepared.batchCount; i++) { const batch = engine.getBatch(i); count += batch.length; expect(batch.length).toBeLessThanOrEqual(500); expect(Buffer.byteLength(JSON.stringify({ rows: batch }))).toBeLessThanOrEqual(BATCH_BYTE_LIMIT); }
    expect(count).toBe(500);
  }, 15000);
});

describe('worker-held reports and commit reconciliation', () => {
  it('deduplicates across batches using valid normalized emails, never invalid rows', async () => {
    const engine = await session('Name,Email\n' + Array.from({ length: 1001 }, (_, i) => `Person ${i},p${i}@example.com`).join('\n'));
    const first = response(engine.getBatch(0));
    first.rows[0].status = 'invalid'; first.rows[0].error = 'Name needs correction';
    first.rows[1].status = 'existing';
    engine.setReportBatch(0, first);
    const second = response(engine.getBatch(1));
    second.rows[0].email = 'P0@example.com'; second.rows[1].email = ' P1@example.com ';
    engine.setReportBatch(1, second);
    engine.setReportBatch(2, response(engine.getBatch(2)));
    expect(engine.getSummary()).toEqual({ total: 1001, ready: 998, existing: 1, duplicate: 1, invalid: 1, added: 0 });
    expect(engine.getReportPage({ page: 10 }).rows[0].status).toBe('new');
    expect(engine.getReportPage({ page: 10 }).rows[1].status).toBe('duplicate');
    expect(engine.setReportBatch(0, first)).toEqual(engine.getSummary());
    expect(engine.getReportPage({ issuesOnly: true })).toMatchObject({ total: 1, rows: [{ row: 2, status: 'invalid' }] });
    expect(engine.getReportPage({ page: 1, pageSize: 10000 }).rows).toHaveLength(50);
    expect(engine.getReportPage({ page: 20 }).rows).toHaveLength(1);
  });

  it('commits only ready original rows, preserves preview exclusions, and merges retry acknowledgements once', async () => {
    const engine = await session('Name,Email\n=Pat,PAT@example.com\nExisting,e@example.com\nDuplicate,d@example.com\nInvalid,no-at-sign\nNew,n@example.com');
    const preview = response(engine.getBatch(0));
    preview.rows[1].status = 'existing'; preview.rows[2].status = 'duplicate'; preview.rows[3].status = 'invalid';
    engine.setReportBatch(0, preview);
    const commit = engine.getCommitBatch(0);
    expect(commit.map((row) => row.row)).toEqual([2, 6]);
    expect(commit[0].email).toBe('PAT@example.com');
    const ack = response(commit, 'added');
    const summary = engine.applyCommitBatch(0, ack);
    expect(summary).toEqual({ total: 5, ready: 0, existing: 1, duplicate: 1, invalid: 1, added: 2 });
    expect(engine.applyCommitBatch(0, ack)).toEqual(summary);
    expect(engine.getCommitBatch(0)).toEqual([]);
    const blob = engine.exportReport(), csv = await blob.text();
    expect(Array.from(new Uint8Array(await blob.slice(0, 3).arrayBuffer()))).toEqual([0xef, 0xbb, 0xbf]);
    expect(csv).toContain("'=Pat");
    expect(parseCsv(csv).rows).toHaveLength(6);
    expect(engine.getReportPage().rows.map((row) => row.status)).toEqual(['added', 'existing', 'duplicate', 'invalid', 'added']);
  });

  it('rejects truncated/mismatched reports atomically and does not reuse reports after remapping', async () => {
    const engine = await session('Name,Email\nPat,p@example.com\nLee,l@example.com');
    expect(() => engine.setReportBatch(0, { rows: [] })).toThrow(/incomplete/);
    expect(() => engine.setReportBatch(0, { rows: [{ row: 2, status: 'new' }, { row: 2, status: 'new' }] })).toThrow(/match/);
    expect(engine.getSummary().ready).toBe(0);
    engine.setReportBatch(0, response(engine.getBatch(0)));
    expect(() => engine.applyCommitBatch(0, response(engine.getCommitBatch(0).slice(0, 1), 'added'))).toThrow(/incomplete/);
    expect(engine.getSummary().added).toBe(0);
    await engine.prepare(mapping); expect(engine.getReportPage()).toEqual({ rows: [], total: 0 });
  });

  it('rejects phase-inappropriate statuses and missing normalized fields before changing any totals', async () => {
    const engine = await session('Name,Email\nPat,p@example.com');
    expect(() => engine.setReportBatch(0, response(engine.getBatch(0), 'added'))).toThrow(/unexpected import status/);
    const missing = response(engine.getBatch(0)); delete missing.rows[0].email;
    expect(() => engine.setReportBatch(0, missing)).toThrow(/normalized contact fields/);
    expect(engine.getSummary().added).toBe(0); expect(engine.getSummary().ready).toBe(0);
    engine.setReportBatch(0, response(engine.getBatch(0)));
    expect(() => engine.applyCommitBatch(0, response(engine.getCommitBatch(0), 'new'))).toThrow(/unexpected import status/);
    expect(engine.getSummary().ready).toBe(1);
  });
});

describe('Excel limits and safe workbook bounds', () => {
  it('reads compressed Excel in a worker session, keeps a bounded preview, and maps only chosen fields', async () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Name', 'Email', 'Unused'], ...Array.from({ length: 20 }, (_, i) => [`Person ${i}`, `p${i}@example.com`, 'x'.repeat(6000)])]), 'People');
    const file = new File([XLSX.write(book, { type: 'array', bookType: 'xlsx', compression: true })], 'contacts.xlsx');
    const engine = new ImportSessionEngine();
    const metadata = await engine.init(file);
    expect(metadata).toMatchObject({ totalRows: 21, columnCount: 3 });
    expect(metadata.rows).toHaveLength(11);
    expect(await engine.prepare(mapping)).toEqual({ total: 20, batchCount: 1 });
    expect(engine.getBatch(0)[0]).toEqual({ row: 2, name: 'Person 0', email: 'p0@example.com', firm: '', role: '' });
  });
  it('applies separate CSV and Excel upload limits', () => {
    expect(() => checkFile({ name: 'contacts.csv', size: FILE_LIMIT })).not.toThrow();
    expect(() => checkFile({ name: 'contacts.xlsx', size: EXCEL_FILE_LIMIT })).not.toThrow();
    expect(() => checkFile({ name: 'contacts.xls', size: EXCEL_FILE_LIMIT + 1 })).toThrow(/50 MB/);
  });
  it('rejects exaggerated decompression sizes before the workbook parser runs', () => {
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Name', 'Email'], ['Pat', 'p@example.com']]), 'Contacts');
    const buffer = XLSX.write(book, { type: 'array', bookType: 'xlsx' }), view = new DataView(buffer);
    for (let i = 0; i < buffer.byteLength - 46; i++) if (view.getUint32(i, true) === 0x02014b50) { view.setUint32(i + 24, 0x7fffffff, true); break; }
    expect(() => inspectExcelZip(buffer)).toThrow(/safe Excel limit/);
    expect(() => parseImportBuffer(buffer, 'contacts.xlsx')).toThrow(/safe Excel limit/);
  });
  it('rejects pathological worksheet bounds', () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, { A1: { t: 's', v: 'Name' }, B500002: { t: 's', v: 'overflow@example.com' }, '!ref': 'A1:B500002' }, 'Contacts');
    expect(() => parseImportBuffer(XLSX.write(book, { type: 'array', bookType: 'xlsx' }), 'contacts.xlsx')).toThrow(/500,000/);
  });
});

describe('session worker lifecycle', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
  class WorkerStub {
    static instance;
    constructor() { WorkerStub.instance = this; this.messages = []; this.terminate = vi.fn(); }
    postMessage(message) { this.messages.push(message); if (message.method === 'init') queueMicrotask(() => this.onmessage({ data: { id: message.id, result: { sheetNames: ['Contacts'], sheet: 'Contacts', rows: [], totalRows: 0, columnCount: 0 } } })); }
  }
  it('posts a File handle instead of a buffer and rejects all pending calls on destroy', async () => {
    vi.stubGlobal('Worker', WorkerStub);
    const file = csvFile('Name,Email\nPat,p@example.com');
    const api = await createImportSession(file);
    expect(api.closed).toBe(false);
    expect(WorkerStub.instance.messages[0].args[0]).toBe(file);
    const one = api.getSummary(), two = api.getReportPage();
    api.destroy();
    expect(api.closed).toBe(true);
    await expect(one).rejects.toThrow(/closed/); await expect(two).rejects.toThrow(/closed/);
    expect(WorkerStub.instance.terminate).toHaveBeenCalledOnce();
    await expect(api.getBatch(0)).rejects.toThrow(/closed/);
  });
  it('can abort and terminate while initial parsing has not returned a session', async () => {
    vi.stubGlobal('Worker', WorkerStub);
    const controller = new AbortController();
    const pending = createImportSession(csvFile('Name,Email'), undefined, undefined, controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow(/cancelled/);
    expect(WorkerStub.instance.terminate).toHaveBeenCalledOnce();
  });
  it('treats worker failure and inactivity timeout as fatal for every pending request', async () => {
    vi.stubGlobal('Worker', WorkerStub);
    const api = await createImportSession(csvFile('Name,Email'));
    const first = api.getSummary(), second = api.exportReport();
    WorkerStub.instance.onerror();
    await expect(first).rejects.toThrow(/worker stopped/); await expect(second).rejects.toThrow(/worker stopped/);
    const next = await createImportSession(csvFile('Name,Email'));
    vi.useFakeTimers();
    const pending = next.prepare(mapping);
    vi.advanceTimersByTime(120001);
    await expect(pending).rejects.toThrow(/stopped responding/);
    expect(WorkerStub.instance.terminate).toHaveBeenCalledOnce();
  });
});
