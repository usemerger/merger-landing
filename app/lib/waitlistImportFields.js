import { IMPORT_LIMIT, FILE_LIMIT, EXCEL_FILE_LIMIT, CELL_LIMIT, COLUMN_LIMIT } from './waitlistImportLimits';
export function checkFile(file) {
  if (!/\.(csv|xls|xlsx)$/i.test(file.name)) throw new Error('Choose a CSV, XLS, or XLSX file.');
  if (!file.size) throw new Error('This file is empty.');
  const csv = /\.csv$/i.test(file.name);
  if (file.size > (csv ? FILE_LIMIT : EXCEL_FILE_LIMIT)) throw new Error(csv ? 'Choose a CSV of 250 MB or less, containing up to 500,000 contacts.' : 'Choose an Excel workbook of 50 MB or less, or export it as a CSV.');
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
  const used = validateMapping(mapping);
  const data = headers ? sheet.rows.slice(1) : sheet.rows;
  const rows = [];
  for (const entry of data) {
    const row = mapImportEntry(entry, mapping, used);
    if (row) rows.push(row);
  }
  if (!rows.length) throw new Error('No contacts were found in these columns. Check your column choices and header setting.');
  if (data.length > IMPORT_LIMIT || rows.length > IMPORT_LIMIT) throw new Error('Import up to 500,000 contacts in one file. Split this list into smaller files.');
  return rows;
}

export function validateMapping(mapping) {
  const active = (field) => mapping[field] !== '' && mapping[field] !== undefined && mapping[field] !== null;
  if (!active('email')) throw new Error('Choose the column containing email addresses.');
  const used = Object.keys(aliases).filter((field) => active(field) && !(active('name') && ['firstName', 'lastName'].includes(field))).map((field) => [field, Number(mapping[field])]);
  if (used.some(([, column]) => !Number.isInteger(column) || column < 0 || column >= COLUMN_LIMIT)) throw new Error('Choose a valid column for each contact field.');
  if (new Set(used.map(([, column]) => column)).size !== used.length) throw new Error('Choose a different column for each field.');
  return used;
}

export function mapImportEntry(entry, mapping, used = validateMapping(mapping)) {
  for (const [field, column] of used) {
    if (String(entry.cells[column] ?? '').length > CELL_LIMIT) {
      const label = { email: 'Email address', name: 'Full name', firstName: 'First name', lastName: 'Last name', firm: 'Company', role: 'Role' }[field];
      throw new Error(`Row ${entry.row}: ${label} is over 4,096 characters. Choose the correct column or shorten that contact field.`);
    }
  }
  const value = (field) => used.some(([key]) => key === field) ? String(entry.cells[Number(mapping[field])] ?? '').trim() : '';
  const values = { name: used.some(([key]) => key === 'name') ? value('name') : [value('firstName'), value('lastName')].filter(Boolean).join(' '), email: value('email'), firm: value('firm'), role: value('role') };
  if (values.name.length > CELL_LIMIT) throw new Error(`Row ${entry.row}: Full name is over 4,096 characters. Shorten the combined first and last name.`);
  if (used.some(([, column]) => entry.formulas?.includes(column))) throw new Error(`Row ${entry.row} contains a formula in a selected column. Paste those cells as values before importing.`);
  return Object.values(values).some(Boolean) ? { row: entry.row, ...values } : null;
}

export function safeCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function resultsCsv(rows) {
  return '\uFEFF' + [['Row', 'Name', 'Email', 'Company', 'Role', 'Result', 'Details'], ...rows.map((row) => [row.row, row.name, row.email, row.firm, row.role, row.status, row.error || ''])].map((row) => row.map(safeCsvCell).join(',')).join('\r\n');
}
