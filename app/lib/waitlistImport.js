import { checkFile } from './waitlistImportFields';
export { checkFile, guessMapping, mapImportRows, mapImportEntry, validateMapping, safeCsvCell, resultsCsv } from './waitlistImportFields';
export { IMPORT_LIMIT, FILE_LIMIT, EXCEL_FILE_LIMIT, COLUMN_LIMIT, CELL_LIMIT, BATCH_SIZE } from './waitlistImportLimits';

// Only the File handle crosses into the worker. Full spreadsheets and reports
// stay there; the dashboard receives a small column preview and bounded batches.
export async function createImportSession(file, selectedSheet, onProgress, signal) {
  if (signal?.aborted) throw new Error('This import was cancelled.');
  checkFile(file);
  const worker = new Worker(new URL('./waitlistImport.worker.js', import.meta.url));
  const pending = new Map();
  let nextId = 0, closed = false;
  const abort = () => destroy('This import was cancelled.');
  const destroy = (reason = 'This import was closed.') => {
    if (closed) return;
    closed = true;
    signal?.removeEventListener('abort', abort);
    worker.terminate();
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error(reason)); }
    pending.clear();
  };
  signal?.addEventListener('abort', abort, { once: true });
  const arm = (id, request) => {
    clearTimeout(request.timer);
    request.timer = setTimeout(() => destroy('This file stopped responding. Export it as a CSV or try a smaller file.'), 120000);
  };
  worker.onmessage = ({ data }) => {
    if (data.progress) {
      const request = pending.get(data.id);
      if (request) arm(data.id, request);
      onProgress?.(data.progress);
      return;
    }
    const request = pending.get(data.id);
    if (!request) return;
    clearTimeout(request.timer); pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error)); else request.resolve(data.result);
  };
  worker.onerror = () => destroy('The import worker stopped. Export this spreadsheet as a CSV and try again.');
  worker.onmessageerror = () => destroy('The import worker could not transfer this result. Please retry the import.');
  const call = (method, args = []) => new Promise((resolve, reject) => {
    if (closed) { reject(new Error('This import was closed.')); return; }
    const id = ++nextId;
    const request = { resolve, reject, timer: null };
    pending.set(id, request); arm(id, request);
    try { worker.postMessage({ id, method, args }); } catch (error) { destroy(error.message); }
  });
  try {
    const metadata = await call('init', [file, selectedSheet]);
    return {
      ...metadata,
      get closed() { return closed; },
      prepare: (mapping, headers = true) => call('prepare', [mapping, headers]),
      getBatch: (index) => call('getBatch', [index]),
      setReportBatch: (index, response) => call('setReportBatch', [index, response]),
      getSummary: () => call('getSummary'),
      getReportPage: (options = {}) => call('getReportPage', [options]),
      getCommitBatch: (index) => call('getCommitBatch', [index]),
      applyCommitBatch: (index, response) => call('applyCommitBatch', [index, response]),
      exportReport: () => call('exportReport'),
      destroy,
    };
  } catch (error) { destroy(); throw error; }
}

// Legacy callers receive only the column preview. New import flows must retain
// createImportSession() and use prepare()/getBatch() for the complete file.
export async function readImportFile(file, sheet) {
  const session = await createImportSession(file, sheet);
  const { sheetNames, rows, columnCount, totalRows } = session;
  const result = { sheetNames, sheet: session.sheet, rows, columnCount, totalRows };
  session.destroy();
  return result;
}
