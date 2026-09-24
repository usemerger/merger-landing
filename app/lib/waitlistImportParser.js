import * as XLSX from 'xlsx';
import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
import { CELL_LIMIT, COLUMN_LIMIT, FILE_LIMIT, IMPORT_LIMIT } from './waitlistImportLimits';
XLSX.set_cptable(cptable);

function tooManyRows() { throw new Error('Use a sheet with up to 1,000 contacts and one header row. Split larger lists into smaller files.'); }
// Keep a bounded preview, plus one overflow character. Extra export columns
// must not prevent mapping; mapImportRows rejects oversized selected fields.
const previewCell = (value) => String(value).slice(0, CELL_LIMIT + 1);

// CSV remains text: numbers, leading zeros, and values beginning with = are never evaluated.
export function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '');
  let quoted = false;
  const separators = { ',': 0, ';': 0, '\t': 0 };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; }
    if (!quoted && (c === '\n' || c === '\r')) break;
    if (!quoted && c in separators) separators[c]++;
  }
  const delimiter = Object.keys(separators).sort((a, b) => separators[b] - separators[a])[0];
  const rows = []; let cells = [], cell = '', inQuotes = false, closed = false, line = 1, rowLine = 1;
  const append = (value) => { if (cell.length <= CELL_LIMIT) cell += value; };
  const endCell = () => { cells.push(cell); cell = ''; closed = false; if (cells.length > COLUMN_LIMIT) throw new Error('Use a sheet with 100 columns or fewer.'); };
  const endRow = () => { endCell(); if (cells.some((value) => value.length > CELL_LIMIT || value.trim())) rows.push({ row: rowLine, cells }); cells = []; if (rows.length > IMPORT_LIMIT + 1) tooManyRows(); };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { append('"'); i++; } else { inQuotes = false; closed = true; } }
      else { append(c); if (c === '\n') line++; }
    } else if (c === delimiter) endCell();
    else if (c === '\n' || c === '\r') { endRow(); if (c === '\r' && text[i + 1] === '\n') i++; line++; rowLine = line; }
    else if (c === '"' && !cell && !closed) inQuotes = true;
    else if (closed && /\s/.test(c)) continue;
    else if (closed || c === '"') throw new Error(`The CSV has an unexpected quote near row ${line}. Export it again and retry.`);
    else append(c);
  }
  if (inQuotes) throw new Error('The CSV contains an unclosed quote. Export it again and retry.');
  if (cell || cells.length || closed) endRow();
  if (!rows.length) throw new Error('This file does not contain any contacts.');
  return { sheetNames: ['Contacts'], sheet: 'Contacts', rows };
}

export function parseImportBuffer(buffer, filename, selectedSheet) {
  if (buffer.byteLength > FILE_LIMIT) throw new Error('Choose a file smaller than 5 MB.');
  if (/\.csv$/i.test(filename)) {
    const bytes = new Uint8Array(buffer);
    const encoding = bytes[0] === 255 && bytes[1] === 254 ? 'utf-16le' : bytes[0] === 254 && bytes[1] === 255 ? 'utf-16be' : 'utf-8';
    return parseCsv(new TextDecoder(encoding, { fatal: true }).decode(bytes));
  }
  if (!/\.xlsx?$/i.test(filename)) throw new Error('Choose a CSV, XLS, or XLSX file.');
  const bytes = new Uint8Array(buffer);
  if (!((bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0xd0 && bytes[1] === 0xcf) || (bytes[0] === 0x09 && bytes[1] <= 0x08))) throw new Error('This does not look like an Excel workbook. Export it as CSV, XLS, or XLSX.');
  const meta = XLSX.read(buffer, { type: 'array', bookSheets: true });
  const sheetNames = meta.SheetNames;
  if (!sheetNames?.length) throw new Error('This workbook does not contain a sheet.');
  if (sheetNames.length > 100) throw new Error('This workbook has too many sheets. Export your contacts sheet as a CSV.');
  const sheet = selectedSheet || sheetNames[0];
  if (!sheetNames.includes(sheet)) throw new Error('Choose a sheet from this workbook.');
  const workbook = XLSX.read(buffer, { type: 'array', sheets: sheet, sheetRows: IMPORT_LIMIT + 2, cellFormula: true, cellText: true });
  const ws = workbook.Sheets[sheet];
  if (!ws?.['!ref']) return { sheetNames, sheet, rows: [] };
  const range = XLSX.utils.decode_range(ws['!fullref'] || ws['!ref']);
  if (range.e.r >= IMPORT_LIMIT + 1) tooManyRows();
  if (range.e.c >= COLUMN_LIMIT) throw new Error('Use a sheet with 100 columns or fewer.');
  const rows = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cells = [], formulas = [];
    for (let c = 0; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell?.f) formulas.push(c);
      cells.push(previewCell(cell ? cell.w ?? cell.v ?? '' : ''));
    }
    if (cells.some((value) => value.length > CELL_LIMIT || value.trim()) || formulas.length) rows.push({ row: r + 1, cells, formulas });
  }
  if (!rows.length) throw new Error('This sheet does not contain any contacts.');
  return { sheetNames, sheet, rows };
}
