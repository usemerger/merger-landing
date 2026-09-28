import { ImportSessionEngine } from './waitlistImportParser';

let activeId;
const engine = new ImportSessionEngine((progress) => self.postMessage({ id: activeId, progress }));
const methods = new Set(['init', 'prepare', 'getBatch', 'setReportBatch', 'getSummary', 'getReportPage', 'getCommitBatch', 'applyCommitBatch', 'exportReport']);
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  // Serialize commands so remapping cannot race an unfinished file pass.
  queue = queue.then(async () => {
    activeId = data.id;
    try {
      if (!methods.has(data.method)) throw new Error('Unknown import operation.');
      const result = await engine[data.method](...(data.args || []));
      self.postMessage({ id: data.id, result });
    } catch (error) {
      self.postMessage({ id: data.id, error: /password|encrypted/i.test(error.message) ? 'Remove password protection before importing this workbook.' : error.message || 'This file could not be read. Export it as a CSV and try again.' });
    }
  });
};
