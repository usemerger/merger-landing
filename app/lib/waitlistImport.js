import { IMPORT_LIMIT, FILE_LIMIT, CELL_LIMIT } from './waitlistImportLimits';
export { IMPORT_LIMIT, FILE_LIMIT, COLUMN_LIMIT, CELL_LIMIT } from './waitlistImportLimits';

export function checkFile(file) {
  if (!/\.(csv|xls|xlsx)$/i.test(file.name)) throw new Error('Choose a CSV, XLS, or XLSX file.');
  if (!file.size) throw new Error('This file is empty.');
  if (file.size > FILE_LIMIT) throw new Error('Choose a file smaller than 5 MB. Split larger lists into batches of 1,000 people.');
}

// Parse in a disposable worker so a malformed workbook cannot freeze the dashboard.
export async function readImportFile(file, sheet) {
  checkFile(file);
  const buffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./waitlistImport.worker.js', import.meta.url));
    const finish = (error, result) => { clearTimeout(timer); worker.terminate(); error ? reject(new Error(error)) : resolve(result); };
    const timer = setTimeout(() => finish('This file took too long to read. Export a smaller CSV and try again.'), 15000);
    worker.onmessage = ({ data }) => finish(data.error, data.result);
    worker.onerror = () => finish('We could not read this spreadsheet. Try exporting it as a CSV.');
    worker.postMessage({ buffer, filename: file.name, sheet }, [buffer]);
  });
}

const key = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = {
  email: ['email', 'emailaddress', 'emailid', 'contactemail', 'workemail', 'recommendedemail'],
  name: ['name', 'fullname', 'contactname', 'displayname'],
  firstName: ['firstname', 'first', 'givenname'], lastName: ['lastname', 'last', 'surname', 'familyname'],
  firm: ['company', 'firm', 'organization', 'organisation', 'companyname', 'employer'], role: ['role', 'title', 'jobtitle', 'position'],
};
export function guessMapping(cells, headers = true) {
  const mapping = Object.fromEntries(Object.keys(aliases).map((field) => [field, '']));
  if (headers) {
    for (const [field, names] of Object.entries(aliases)) {
      const index = cells.findIndex((value) => names.includes(key(value)));
      if (index >= 0) mapping[field] = String(index);
    }
  } else {
    const email = cells.findIndex((value) => /\S+@\S+\.\S+/.test(value));
    if (email >= 0) mapping.email = String(email);
  }
  if (mapping.name !== '') { mapping.firstName = ''; mapping.lastName = ''; }
  return mapping;
}

export function mapImportRows(sheet, mapping, headers = true) {
  if (mapping.email === '') throw new Error('Choose the column containing email addresses.');
  const used = Object.entries(mapping).filter(([field, column]) => column !== '' && !(mapping.name !== '' && ['firstName', 'lastName'].includes(field)));
  if (new Set(used.map(([, column]) => column)).size !== used.length) throw new Error('Choose a different column for each field.');
  const data = headers ? sheet.rows.slice(1) : sheet.rows;
  const rows = [];
  for (const entry of data) {
    for (const [field, column] of used) {
      if (String(entry.cells[Number(column)] ?? '').length > CELL_LIMIT) {
        const label = { email: 'Email address', name: 'Full name', firstName: 'First name', lastName: 'Last name', firm: 'Company', role: 'Role' }[field];
        throw new Error(`Row ${entry.row}: ${label} is over 4,096 characters. Choose the correct column or shorten that contact field.`);
      }
    }
    const value = (field) => mapping[field] === '' ? '' : String(entry.cells[Number(mapping[field])] || '').trim();
    const values = { name: mapping.name !== '' ? value('name') : [value('firstName'), value('lastName')].filter(Boolean).join(' '), email: value('email'), firm: value('firm'), role: value('role') };
    if (used.some(([, column]) => entry.formulas?.includes(Number(column)))) throw new Error(`Row ${entry.row} contains a formula in a selected column. Paste those cells as values before importing.`);
    if (!Object.values(values).some(Boolean)) continue;
    rows.push({ row: entry.row, ...values });
  }
  if (!rows.length) throw new Error('No contacts were found in these columns. Check your column choices and header setting.');
  if (rows.length > IMPORT_LIMIT) throw new Error('Import up to 1,000 people at a time. Split this list into smaller files.');
  return rows;
}

export function safeCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function resultsCsv(rows) {
  return '\uFEFF' + [['Row', 'Name', 'Email', 'Company', 'Role', 'Result', 'Details'], ...rows.map((row) => [row.row, row.name, row.email, row.firm, row.role, row.status, row.error || ''])].map((row) => row.map(safeCsvCell).join(',')).join('\r\n');
}
