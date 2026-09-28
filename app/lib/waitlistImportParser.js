import * as XLSX from 'xlsx';
import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
import { CELL_LIMIT, COLUMN_LIMIT, FILE_LIMIT, EXCEL_FILE_LIMIT, EXCEL_INFLATED_LIMIT, IMPORT_LIMIT, PREVIEW_ROWS, BATCH_SIZE, BATCH_BYTE_LIMIT } from './waitlistImportLimits';
import { checkFile, mapImportEntry, validateMapping, safeCsvCell } from './waitlistImportFields';
XLSX.set_cptable(cptable);

const tooManyRows = () => { throw new Error('Use a file with up to 500,000 contacts and one optional header row. Split larger lists into smaller files.'); };
const previewCell = (value) => String(value).slice(0, CELL_LIMIT + 1);
const emptySummary = (total = 0) => ({ total, ready: 0, existing: 0, duplicate: 0, invalid: 0, added: 0 });
const summaryKey = (status) => status === 'new' ? 'ready' : status;
const csvEncoding = (bytes) => bytes[0] === 255 && bytes[1] === 254 ? 'utf-16le' : bytes[0] === 254 && bytes[1] === 255 ? 'utf-16be' : 'utf-8';

// Count the first record's delimiters without retaining its contents.
export function createDelimiterProbe() {
  let quoted = false, pendingQuote = false, done = false, started = false;
  const counts = { ',': 0, ';': 0, '\t': 0 };
  return {
    write(text) {
      for (const c of text) {
        if (done) break;
        if (pendingQuote) { pendingQuote = false; if (c === '"') continue; quoted = false; }
        if (c === '"') { started = true; if (quoted) pendingQuote = true; else quoted = true; }
        else if (!quoted && (c === '\r' || c === '\n')) { if (started) done = true; }
        else if (!quoted && c in counts) { counts[c]++; started = true; }
        else if (/\S/.test(c)) started = true;
      }
      return done;
    },
    delimiter: () => Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0],
  };
}

// Cells cap at 4,097 characters; unselected fields are never stored. Parser
// state carries across arbitrary byte, escaped-quote and CRLF boundaries.
export function createCsvParser({ delimiter = ',', onRow, columns = null, captureRows = Infinity, maxRows = IMPORT_LIMIT + 1 } = {}) {
  let cells = [], cell = '', column = 0, fieldLength = 0, meaningful = false;
  let inQuotes = false, quotePending = false, closed = false, skipLF = false, quoteCR = false;
  let line = 1, rowLine = 1, count = 0, columnCount = 0, started = false;
  const append = (c) => {
    fieldLength += c.length;
    if (fieldLength > CELL_LIMIT || /\S/.test(c)) meaningful = true;
    if (count < captureRows && (!columns || columns.has(column)) && cell.length < CELL_LIMIT + 1) cell += c.slice(0, CELL_LIMIT + 1 - cell.length);
  };
  const endCell = () => {
    if (count < captureRows && (!columns || columns.has(column))) cells[column] = cell;
    column++; columnCount = Math.max(columnCount, column);
    if (column > COLUMN_LIMIT) throw new Error('Use a sheet with 100 columns or fewer.');
    cell = ''; fieldLength = 0; closed = false;
  };
  const endRow = () => {
    endCell();
    if (meaningful) { count++; if (count > maxRows) tooManyRows(); onRow?.({ row: rowLine, cells }, count - 1); }
    cells = []; column = 0; meaningful = false;
  };
  return {
    write(text) {
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (!started) { started = true; if (c === '\uFEFF') continue; }
        if (skipLF) { skipLF = false; if (c === '\n') continue; }
        if (quotePending) {
          quotePending = false;
          if (c === '"') { append('"'); continue; }
          inQuotes = false; closed = true;
        }
        if (inQuotes) {
          if (c === '"') quotePending = true;
          else { append(c); if (c === '\r' || (c === '\n' && !quoteCR)) line++; quoteCR = c === '\r'; }
          continue;
        }
        quoteCR = false;
        if (c === delimiter) endCell();
        else if (c === '\n' || c === '\r') { endRow(); line++; rowLine = line; skipLF = c === '\r'; }
        else if (c === '"' && !fieldLength && !closed) inQuotes = true;
        else if (closed && /\s/.test(c)) continue;
        else if (closed || c === '"') throw new Error(`The CSV has an unexpected quote near row ${line}. Export it again and retry.`);
        else append(c);
      }
    },
    finish() {
      if (inQuotes && !quotePending) throw new Error('The CSV contains an unclosed quote. Export it again and retry.');
      if (fieldLength || column || closed || quotePending) endRow();
      if (!count) throw new Error('This file does not contain any contacts.');
      return { totalRows: count, columnCount };
    },
  };
}

export function parseCsv(text) {
  const probe = createDelimiterProbe(); probe.write(text.replace(/^\uFEFF/, ''));
  const rows = [];
  const parser = createCsvParser({ delimiter: probe.delimiter(), onRow: (row) => rows.push(row) });
  parser.write(text); parser.finish();
  return { sheetNames: ['Contacts'], sheet: 'Contacts', rows };
}

async function readCsvChunks(file, callback, { chunkSize = 256 * 1024, onProgress, message = 'Reading CSV…' } = {}) {
  const first = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const decoder = new TextDecoder(csvEncoding(first), { fatal: true });
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, file.size);
    const text = decoder.decode(await file.slice(offset, end).arrayBuffer(), { stream: end < file.size });
    const done = callback(text);
    onProgress?.({ message, processed: end, total: file.size });
    if (done) return;
  }
}

export async function walkCsvFile(file, onRow, options = {}) {
  if (file.size > FILE_LIMIT) throw new Error('Choose a CSV of 250 MB or less.');
  const probe = createDelimiterProbe();
  await readCsvChunks(file, (text) => probe.write(text), { ...options, message: 'Checking CSV columns…' });
  const parser = createCsvParser({ ...options, delimiter: probe.delimiter(), onRow });
  await readCsvChunks(file, (text) => { parser.write(text); }, options);
  return { sheetNames: ['Contacts'], sheet: 'Contacts', ...parser.finish() };
}

// ZIP64, encrypted entries, overlapping offsets and excessive inflated sizes
// are unnecessary for contact lists. Reject them before SheetJS allocates XML.
export function inspectExcelZip(buffer) {
  const bytes = new Uint8Array(buffer), view = new DataView(buffer);
  if (!(bytes[0] === 0x50 && bytes[1] === 0x4b)) return [];
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) { end = i; break; }
  }
  if (end < 0) throw new Error('This Excel archive is incomplete. Export it as a CSV and retry.');
  const count = view.getUint16(end + 10, true), length = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || count === 65535 || count > 10000 || start + length !== end) throw new Error('This Excel archive is too complex. Export the contacts sheet as a CSV.');
  const entries = []; let offset = start, inflated = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) throw new Error('This Excel archive is malformed. Export it as a CSV.');
    const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true);
    const compressed = view.getUint32(offset + 20, true), size = view.getUint32(offset + 24, true), local = view.getUint32(offset + 42, true);
    inflated += size;
    if (flags & 1) throw new Error('Remove password protection before importing this workbook.');
    if (![0, 8].includes(method) || inflated > EXCEL_INFLATED_LIMIT || size > 128 * 1024 * 1024 || local + 30 > start || view.getUint32(local, true) !== 0x04034b50) throw new Error('This workbook expands beyond the safe Excel limit. Export it as a CSV.');
    const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const localFlags = view.getUint16(local + 6, true), localMethod = view.getUint16(local + 8, true);
    const localCompressed = view.getUint32(local + 18, true), localSize = view.getUint32(local + 22, true);
    const localNameLength = view.getUint16(local + 26, true), centralNameLength = view.getUint16(offset + 28, true);
    if (localFlags !== flags || localMethod !== method || localNameLength !== centralNameLength || (!((flags & 8) && localCompressed === 0) && localCompressed !== compressed) || (!((flags & 8) && localSize === 0) && localSize !== size)) throw new Error('This Excel archive has conflicting entry metadata. Export it as a CSV.');
    for (let n = 0; n < localNameLength; n++) if (bytes[local + 30 + n] !== bytes[offset + 46 + n]) throw new Error('This Excel archive has conflicting filenames. Export it as a CSV.');
    if (dataStart + compressed > start || (method === 0 && compressed !== size)) throw new Error('This Excel archive has invalid entry sizes. Export it as a CSV.');
    entries.push({ local, start: dataStart, compressed, size, method });
    offset += 46 + view.getUint16(offset + 28, true) + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
  }
  if (offset !== end) throw new Error('This Excel archive is malformed. Export it as a CSV.');
  const ranges = [...entries].sort((a, b) => a.local - b.local);
  for (let i = 1; i < ranges.length; i++) if (ranges[i].local < ranges[i - 1].start + ranges[i - 1].compressed) throw new Error('This Excel archive contains overlapping data. Export it as a CSV.');
  return entries;
}

async function verifyExcelInflation(buffer) {
  const entries = inspectExcelZip(buffer);
  // Count actual inflated bytes too: incorrect ZIP metadata cannot bypass the
  // limit. No complete inflated XML string is retained by this preflight.
  for (const entry of entries) {
    if (entry.method !== 8) continue;
    let stream;
    try { stream = new DecompressionStream('deflate-raw'); }
    catch { throw new Error('This browser cannot safely open this compressed workbook. Export it as a CSV.'); }
    const reader = new Blob([new Uint8Array(buffer, entry.start, entry.compressed)]).stream().pipeThrough(stream).getReader();
    let length = 0;
    try {
      while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > entry.size) { await reader.cancel(); throw new Error('This workbook expands beyond its declared size. Export it as a CSV.'); } }
      if (length !== entry.size) throw new Error('This workbook contains incomplete compressed data. Export it as a CSV.');
    } finally { reader.releaseLock(); }
  }
}

function walkExcelBuffer(buffer, filename, selectedSheet, onRow, { captureRows = Infinity, columns = null } = {}) {
  if (buffer.byteLength > EXCEL_FILE_LIMIT) throw new Error('Choose an Excel workbook of 50 MB or less, or export it as a CSV.');
  const bytes = new Uint8Array(buffer);
  if (!/\.xlsx?$/i.test(filename)) throw new Error('Choose a CSV, XLS, or XLSX file.');
  if (!((bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0xd0 && bytes[1] === 0xcf) || (bytes[0] === 0x09 && bytes[1] <= 0x08))) throw new Error('This does not look like an Excel workbook. Export it as CSV, XLS, or XLSX.');
  inspectExcelZip(buffer);
  const meta = XLSX.read(buffer, { type: 'array', bookSheets: true });
  const sheetNames = meta.SheetNames;
  if (!sheetNames?.length) throw new Error('This workbook does not contain a sheet.');
  if (sheetNames.length > 100) throw new Error('This workbook has too many sheets. Export your contacts sheet as a CSV.');
  const sheet = selectedSheet || sheetNames[0];
  if (!sheetNames.includes(sheet)) throw new Error('Choose a sheet from this workbook.');
  const workbook = XLSX.read(buffer, { type: 'array', sheets: sheet, sheetRows: IMPORT_LIMIT + 2, cellFormula: true, cellText: true, dense: true });
  const ws = workbook.Sheets[sheet];
  if (!ws?.['!ref']) return { sheetNames, sheet, totalRows: 0, columnCount: 0 };
  const range = XLSX.utils.decode_range(ws['!fullref'] || ws['!ref']);
  if (![range.s.r, range.s.c, range.e.r, range.e.c].every(Number.isSafeInteger) || range.s.r < 0 || range.s.c < 0 || range.e.r > IMPORT_LIMIT || range.e.c >= COLUMN_LIMIT) {
    if (range.e.c >= COLUMN_LIMIT) throw new Error('Use a sheet with 100 columns or fewer.');
    tooManyRows();
  }
  let totalRows = 0;
  const dense = ws['!data'];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cells = [], formulas = []; let meaningful = false;
    for (let c = 0; c <= range.e.c; c++) {
      const cell = dense ? dense[r]?.[c] : ws[XLSX.utils.encode_cell({ r, c })];
      const value = cell ? String(cell.w ?? cell.v ?? '') : '';
      if (cell?.f || value.length > CELL_LIMIT || value.trim()) meaningful = true;
      if (totalRows < captureRows && (!columns || columns.has(c))) { cells[c] = previewCell(value); if (cell?.f) formulas.push(c); }
    }
    if (meaningful) { totalRows++; if (totalRows > IMPORT_LIMIT + 1) tooManyRows(); onRow?.({ row: r + 1, cells, formulas }, totalRows - 1); }
  }
  if (!totalRows) throw new Error('This sheet does not contain any contacts.');
  return { sheetNames, sheet, totalRows, columnCount: range.e.c + 1 };
}

// Small legacy/unit-test consumers only. Production retains its File in a worker.
export function parseImportBuffer(buffer, filename, selectedSheet) {
  if (/\.csv$/i.test(filename)) {
    if (buffer.byteLength > FILE_LIMIT) throw new Error('Choose a CSV of 250 MB or less.');
    return parseCsv(new TextDecoder(csvEncoding(new Uint8Array(buffer)), { fatal: true }).decode(buffer));
  }
  const rows = [];
  const { sheetNames, sheet } = walkExcelBuffer(buffer, filename, selectedSheet, (row) => rows.push(row));
  return { sheetNames, sheet, rows };
}

export class ImportSessionEngine {
  constructor(onProgress = () => {}) { this.onProgress = onProgress; this.file = null; this.reset(); }
  reset() { this.contacts = []; this.batches = []; this.reports = []; this.seen = new Map(); this.reviewed = new Set(); this.summary = emptySummary(); }
  async walk(onRow, options = {}) {
    if (/\.csv$/i.test(this.file.name)) return walkCsvFile(this.file, onRow, { ...options, onProgress: this.onProgress });
    this.onProgress({ message: 'Reading Excel workbook…', processed: 0, total: this.file.size });
    const buffer = await this.file.arrayBuffer();
    await verifyExcelInflation(buffer);
    const metadata = walkExcelBuffer(buffer, this.file.name, this.selectedSheet, onRow, options);
    this.onProgress({ message: 'Workbook read', processed: this.file.size, total: this.file.size });
    return metadata;
  }
  async init(file, selectedSheet) {
    checkFile(file); this.file = file; this.selectedSheet = selectedSheet; this.reset();
    const rows = [];
    const metadata = await this.walk((row, index) => { if (index < PREVIEW_ROWS) rows.push(row); }, { captureRows: PREVIEW_ROWS });
    this.metadata = { ...metadata, rows };
    return this.metadata;
  }
  async prepare(mapping, headers = true) {
    const used = validateMapping(mapping);
    this.reset();
    const encoder = new TextEncoder(); let batchStart = 0, batchBytes = 32;
    try {
      await this.walk((entry, index) => {
        if (headers && index === 0) return;
        if (index - (headers ? 1 : 0) >= IMPORT_LIMIT) tooManyRows();
        const row = mapImportEntry(entry, mapping, used);
        if (!row) return;
        const bytes = encoder.encode(JSON.stringify(row)).length + 1;
        if (this.contacts.length - batchStart >= BATCH_SIZE || batchBytes + bytes > BATCH_BYTE_LIMIT) { this.batches.push([batchStart, this.contacts.length]); batchStart = this.contacts.length; batchBytes = 32; }
        this.contacts.push(row); batchBytes += bytes;
      }, { columns: new Set(used.map(([, column]) => column)), message: 'Preparing contact batches…' });
      if (!this.contacts.length) throw new Error('No contacts were found in these columns. Check your column choices and header setting.');
      this.batches.push([batchStart, this.contacts.length]);
      this.summary = emptySummary(this.contacts.length);
      return { total: this.contacts.length, batchCount: this.batches.length };
    } catch (error) { this.reset(); throw error; }
  }
  range(index) { if (!Number.isInteger(index) || !this.batches[index]) throw new Error('Choose a valid import batch.'); return this.batches[index]; }
  getBatch(index) { const [start, end] = this.range(index); return this.contacts.slice(start, end); }
  getSummary() { return { ...this.summary }; }
  update(index, report) {
    const old = this.reports[index];
    if (old && summaryKey(old.status) in this.summary) this.summary[summaryKey(old.status)]--;
    this.reports[index] = report;
    this.summary[summaryKey(report.status)]++;
  }
  responseRows(response, expected, phase) {
    if (!Array.isArray(response?.rows) || response.rows.length !== expected.length) throw new Error('The server returned an incomplete import report. Retry this batch.');
    const byRow = new Map(response.rows.map((row) => [row.row, row]));
    if (byRow.size !== expected.length || expected.some((row) => !byRow.has(row.row))) throw new Error('The server report does not match this batch. Retry this batch.');
    return expected.map((original) => {
      const row = byRow.get(original.row);
      const statuses = phase === 'preview' ? ['new', 'existing', 'duplicate', 'invalid'] : ['added', 'existing', 'duplicate', 'invalid'];
      if (!statuses.includes(row.status)) throw new Error('The server returned an unexpected import status. Retry this batch.');
      if (!Number.isSafeInteger(row.row) || ['name', 'email', 'firm', 'role'].some((key) => typeof row[key] !== 'string' || row[key].length > CELL_LIMIT)) throw new Error('The server returned incomplete normalized contact fields. Retry this batch.');
      const report = { ...original, status: row.status, error: String(row.error || '').slice(0, CELL_LIMIT) };
      for (const key of ['name', 'email', 'firm', 'role']) if (typeof row[key] === 'string') report[key] = row[key] === original[key] ? original[key] : row[key].slice(0, CELL_LIMIT);
      return report;
    });
  }
  setReportBatch(index, response) {
    const [start] = this.range(index);
    if (this.reviewed.has(index)) return this.getSummary();
    if (index !== this.reviewed.size) throw new Error('Review import batches in order.');
    const rows = this.responseRows(response, this.getBatch(index), 'preview');
    rows.forEach((report, offset) => {
      const at = start + offset;
      // Invalid rows never reserve an email. Address normalization and field
      // validation are supplied by the authoritative server preview.
      if (report.status !== 'invalid' && report.email) {
        const email = report.email.trim().toLowerCase();
        if (this.seen.has(email) && this.seen.get(email) !== at) { report.status = 'duplicate'; report.error = 'This email appears earlier in this file.'; }
        else this.seen.set(email, at);
      }
      this.update(at, report);
    });
    this.reviewed.add(index); return this.getSummary();
  }
  getReportPage({ page = 0, pageSize = 50, issuesOnly = false } = {}) {
    page = Math.max(0, Number.isFinite(page) ? Math.floor(page) : 0);
    pageSize = Math.max(1, Math.min(50, Number.isFinite(pageSize) ? Math.floor(pageSize) : 50));
    const rows = []; let total = 0;
    for (const row of this.reports) {
      if (!row || (issuesOnly && row.status !== 'invalid')) continue;
      if (total >= page * pageSize && rows.length < pageSize) rows.push(row);
      total++;
    }
    return { rows, total };
  }
  getCommitBatch(index) {
    const [start, end] = this.range(index), rows = [];
    for (let at = start; at < end; at++) if (this.reports[at]?.status === 'new') rows.push(this.contacts[at]);
    return rows;
  }
  applyCommitBatch(index, response) {
    const [start, end] = this.range(index);
    const requested = this.getCommitBatch(index);
    // Acknowledgements already merged are idempotent. The caller retains the
    // exact request and UUID across ambiguous network failures.
    if (!requested.length) return this.getSummary();
    const rows = this.responseRows(response, requested, 'commit');
    const byRow = new Map(rows.map((row) => [row.row, row]));
    for (let at = start; at < end; at++) if (this.reports[at]?.status === 'new' && byRow.has(this.contacts[at].row)) this.update(at, byRow.get(this.contacts[at].row));
    return this.getSummary();
  }
  exportReport() {
    const chunks = ['\uFEFF' + ['Row', 'Name', 'Email', 'Company', 'Role', 'Result', 'Details'].map(safeCsvCell).join(',')];
    let chunk = '';
    for (let index = 0; index < this.contacts.length; index++) {
      const row = this.reports[index] || { ...this.contacts[index], status: 'not reviewed' };
      chunk += '\r\n' + [row.row, row.name, row.email, row.firm, row.role, row.status, row.error || ''].map(safeCsvCell).join(',');
      if (chunk.length >= 128 * 1024) { chunks.push(chunk); chunk = ''; }
    }
    if (chunk) chunks.push(chunk);
    return new Blob(chunks, { type: 'text/csv;charset=utf-8' });
  }
  destroy() { this.reset(); this.file = null; this.metadata = null; }
}
