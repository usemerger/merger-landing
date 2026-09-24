import { parseImportBuffer } from './waitlistImportParser';
self.onmessage = ({ data }) => {
  try { self.postMessage({ result: parseImportBuffer(data.buffer, data.filename, data.sheet) }); }
  catch (error) { self.postMessage({ error: /password|encrypted/i.test(error.message) ? 'Remove password protection before importing this workbook.' : error.message || 'This file could not be read. Export it as a CSV and try again.' }); }
};
