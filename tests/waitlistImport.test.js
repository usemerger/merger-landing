import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { checkFile, FILE_LIMIT, guessMapping, mapImportRows, resultsCsv, safeCsvCell } from '../app/lib/waitlistImport';
import { parseCsv, parseImportBuffer } from '../app/lib/waitlistImportParser';

const utf8 = (text) => new TextEncoder().encode(text).buffer;
const mapped = (text, headers = true) => {
  const sheet = parseCsv(text);
  return mapImportRows(sheet, guessMapping(sheet.rows[0].cells, headers), headers);
};
function workbook(sheets, bookType = 'xlsx') {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), name);
  return XLSX.write(book, { type: 'array', bookType });
}
function utf16(text, bigEndian = false) {
  const bytes = new Uint8Array((text.length + 1) * 2);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0xfeff, !bigEndian);
  for (let i = 0; i < text.length; i++) view.setUint16((i + 1) * 2, text.charCodeAt(i), !bigEndian);
  return bytes.buffer;
}

describe('contact spreadsheet parsing', () => {
  it('round-trips quoted CSV fields, escaped quotes, embedded newlines and Unicode without coercing text', () => {
    const parsed = parseCsv('\uFEFFName,Email,Company,Role\r\n"Zoë, 李",zoe@example.com,"A ""quoted"" firm","Line one\nLine two"\r\n"00123",zero@example.com,=SUM(A1),+Partner');
    expect(mapImportRows(parsed, guessMapping(parsed.rows[0].cells))).toEqual([
      { row: 2, name: 'Zoë, 李', email: 'zoe@example.com', firm: 'A "quoted" firm', role: 'Line one\nLine two' },
      { row: 4, name: '00123', email: 'zero@example.com', firm: '=SUM(A1)', role: '+Partner' },
    ]);
  });

  it.each([',', ';', '\t'])('detects %j as the delimiter without counting punctuation inside quotes', (delimiter) => {
    const text = ['Name', 'Email', 'Company'].join(delimiter) + '\r\n' + ['"Pat, Smith; Esq"', 'pat@example.com', '"Oak\tStreet"'].join(delimiter);
    expect(mapped(text)[0]).toMatchObject({ name: 'Pat, Smith; Esq', email: 'pat@example.com', firm: 'Oak\tStreet' });
  });

  it.each([false, true])('reads BOM-marked UTF-16 CSV (big endian: %s)', (bigEndian) => {
    const sheet = parseImportBuffer(utf16('Name,Email\r\nЖан 李,jean@example.com', bigEndian), 'contacts.CSV');
    expect(mapImportRows(sheet, guessMapping(sheet.rows[0].cells))[0].name).toBe('Жан 李');
  });

  it('reads UTF-8 BOM CSV and rejects invalid UTF-8 instead of corrupting names', () => {
    expect(parseImportBuffer(utf8('\uFEFFName,Email\nÁine,aine@example.com'), 'contacts.csv').rows[1].cells[0]).toBe('Áine');
    expect(() => parseImportBuffer(new Uint8Array([0xc3, 0x28]).buffer, 'contacts.csv')).toThrow();
  });

  it('ignores empty lines while retaining the original spreadsheet row numbers', () => {
    expect(mapped('Name,Email\r\n\r\n,\r\n Pat , pat@example.com \r\n')).toEqual([
      { row: 4, name: 'Pat', email: 'pat@example.com', firm: '', role: '' },
    ]);
    expect(() => parseCsv('\uFEFF\r\n , \n')).toThrow(/does not contain any contacts/i);
  });

  it.each(['Name,Email\n"Pat,pat@example.com', 'Name,Email\nPa"t,pat@example.com', 'Name,Email\n"Pat"oops,pat@example.com'])('rejects malformed quotes without sending partial rows: %s', (csv) => {
    expect(() => parseCsv(csv)).toThrow(/quote/i);
  });

  it('supports headerless contact lists with an explicitly selected name column', () => {
    const sheet = parseCsv('Pat,pat@example.com\nMorgan,morgan@example.com');
    const mapping = { ...guessMapping(sheet.rows[0].cells, false), name: '0' };
    expect(mapImportRows(sheet, mapping, false).map(({ row, name, email }) => ({ row, name, email }))).toEqual([
      { row: 1, name: 'Pat', email: 'pat@example.com' }, { row: 2, name: 'Morgan', email: 'morgan@example.com' },
    ]);
  });

  it.each(['xlsx', 'biff8'])('reads a real %s workbook preserving international names and formatted values', (bookType) => {
    const buffer = workbook({ Contacts: [['Full name', 'Email address', 'Company', 'Role'], ['Zoë 李', 'zoe@example.com', '00123', 'Investor']] }, bookType);
    const sheet = parseImportBuffer(buffer, bookType === 'biff8' ? 'contacts.xls' : 'contacts.xlsx');
    expect(mapImportRows(sheet, guessMapping(sheet.rows[0].cells))).toEqual([
      { row: 2, name: 'Zoë 李', email: 'zoe@example.com', firm: '00123', role: 'Investor' },
    ]);
  });

  it('lets the user choose another worksheet when the first is empty', () => {
    const buffer = workbook({ Notes: [], People: [['Name', 'Email'], ['Pat', 'pat@example.com']] });
    expect(parseImportBuffer(buffer, 'contacts.xlsx')).toEqual({ sheetNames: ['Notes', 'People'], sheet: 'Notes', rows: [] });
    const sheet = parseImportBuffer(buffer, 'contacts.xlsx', 'People');
    expect(sheet.sheet).toBe('People');
    expect(mapImportRows(sheet, guessMapping(sheet.rows[0].cells))[0].email).toBe('pat@example.com');
    expect(() => parseImportBuffer(buffer, 'contacts.xlsx', 'Missing')).toThrow(/choose a sheet/i);
  });

  it('rejects workbook formula cells only when their columns are selected for import', () => {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([['Name', 'Email', 'Ignored'], ['Pat', 'pat@example.com', 'Cached result']]);
    sheet.C2 = { t: 's', v: 'Cached result', f: 'CONCAT("Cached", " result")' };
    XLSX.utils.book_append_sheet(book, sheet, 'Contacts');
    const parsed = parseImportBuffer(XLSX.write(book, { type: 'array', bookType: 'xlsx' }), 'contacts.xlsx');
    const mapping = guessMapping(parsed.rows[0].cells);
    expect(mapImportRows(parsed, mapping)).toHaveLength(1);
    expect(() => mapImportRows(parsed, { ...mapping, name: '2' })).toThrow(/row 2 contains a formula/i);
  });

  it('rejects a renamed text document and unsupported file types', () => {
    expect(() => parseImportBuffer(utf8('Name,Email\nPat,pat@example.com'), 'renamed.xlsx')).toThrow(/does not look like an Excel/i);
    expect(() => parseImportBuffer(utf8('Name,Email'), 'contacts.txt')).toThrow(/CSV, XLS, or XLSX/);
    expect(() => checkFile({ name: 'contacts.xlsm', size: 100 })).toThrow(/CSV, XLS, or XLSX/);
    expect(() => checkFile({ name: 'contacts.csv', size: 0 })).toThrow(/empty/i);
    expect(() => checkFile({ name: 'contacts.csv', size: FILE_LIMIT + 1 })).toThrow(/smaller than 5 MB/i);
    expect(() => parseImportBuffer(new ArrayBuffer(FILE_LIMIT + 1), 'contacts.csv')).toThrow(/smaller than 5 MB/i);
  });

  it('accepts 1,000 contacts and rejects excess rows, columns, and cell length', () => {
    const contacts = Array.from({ length: 1000 }, (_, i) => `Person ${i},person${i}@example.com`);
    expect(mapped(['Name,Email', ...contacts].join('\n'))).toHaveLength(1000);
    expect(() => parseCsv(['Name,Email', ...contacts, 'Overflow,overflow@example.com'].join('\n'))).toThrow(/1,000 contacts/i);
    expect(() => parseCsv(Array.from({ length: 101 }, (_, i) => `Column${i}`).join(','))).toThrow(/100 columns/i);
    expect(() => parseCsv('Name,Email\n' + 'x'.repeat(4097) + ',pat@example.com')).toThrow(/4,096 characters/i);
    const headerless = parseCsv([...contacts, 'Overflow,overflow@example.com'].join('\n'));
    expect(() => mapImportRows(headerless, guessMapping(headerless.rows[0].cells, false), false)).toThrow(/1,000 people/i);
  });

  it('enforces the same row and column limits on Excel worksheets', () => {
    const rows = [['Name', 'Email'], ...Array.from({ length: 1001 }, (_, i) => [`Person ${i}`, `person${i}@example.com`])];
    expect(() => parseImportBuffer(workbook({ Contacts: rows }), 'contacts.xlsx')).toThrow(/1,000 contacts/i);
    expect(() => parseImportBuffer(workbook({ Contacts: [Array.from({ length: 101 }, (_, i) => String(i))] }), 'contacts.xlsx')).toThrow(/100 columns/i);
  });
});

describe('contact field mapping and safe result exports', () => {
  it('recognizes common column names and combines first and last names', () => {
    expect(mapped('Given name,Surname,Work email,Organisation,Job title\n  José  ,  Núñez  ,jose@example.com,Élan,Managing partner')[0]).toEqual({
      row: 2, name: 'José Núñez', email: 'jose@example.com', firm: 'Élan', role: 'Managing partner',
    });
    expect(mapped('First,Last,Full name,Email\nIgnored,Ignored,Preferred Name,pat@example.com')[0].name).toBe('Preferred Name');
  });

  it('requires an email mapping and prevents one selected column from filling two fields', () => {
    const sheet = parseCsv('Name,Address\nPat,pat@example.com');
    const mapping = guessMapping(sheet.rows[0].cells);
    expect(() => mapImportRows(sheet, mapping)).toThrow(/column containing email/i);
    expect(() => mapImportRows(sheet, { ...mapping, email: '0' })).toThrow(/different column for each field/i);
    expect(() => mapped('Name,Email\n,')).toThrow(/no contacts/i);
  });

  it('sends duplicate and invalid addresses unchanged for authoritative server review', () => {
    const rows = mapped('Name,Email\nFirst,PAT@example.com\nSecond,pat@example.com\nNeeds fixing,no-at-sign\nMissing email,');
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.email)).toEqual(['PAT@example.com', 'pat@example.com', 'no-at-sign', '']);
    expect(rows.map((row) => row.row)).toEqual([2, 3, 4, 5]);
  });

  it('omits rows empty in the selected fields and does not transmit unrelated spreadsheet columns', () => {
    const rows = mapped('Name,Email,Private notes\nPat,pat@example.com,Do not transmit\n,,Only a note');
    expect(rows).toEqual([{ row: 2, name: 'Pat', email: 'pat@example.com', firm: '', role: '' }]);
  });

  it.each(['=HYPERLINK("https://example.com")', '+1+1', '-1+1', '@SUM(A1)', '  =1+1', '\uFEFF=1+1', '\tplain', '\rplain', '\nplain'])('neutralizes spreadsheet formula prefixes in exports: %j', (value) => {
    expect(parseCsv('Value\n' + safeCsvCell(value)).rows[1].cells[0]).toBe("'" + value);
  });

  it('exports a BOM, readable column names, escaped quotes, Unicode, and every result row', () => {
    const csv = resultsCsv([
      { row: 2, name: 'Zoë "Z" 李', email: 'zoe@example.com', firm: '=1+1', role: 'Partner', status: 'added' },
      { row: 3, name: 'Pat', email: 'broken', firm: '', role: '', status: 'invalid', error: 'Enter a valid email' },
    ]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(parseCsv(csv).rows.map((row) => row.cells)).toEqual([
      ['Row', 'Name', 'Email', 'Company', 'Role', 'Result', 'Details'],
      ['2', 'Zoë "Z" 李', 'zoe@example.com', "'=1+1", 'Partner', 'added', ''],
      ['3', 'Pat', 'broken', '', '', 'invalid', 'Enter a valid email'],
    ]);
  });
});
