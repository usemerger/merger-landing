// The worker owns the contact list. Only one possibly-unacknowledged write
// stays here so a lost response can replay the same UUID and exact payload.
export function createImportFlow(session, filename, { previewBatch, commitBatch, onProgress = () => {}, onSummary = () => {} }) {
  let prepared = null, reviewIndex = 0, commitIndex = 0;
  let reviewed = 0, processed = 0, paused = false, running = false, pendingWrite = null, summary = null;
  const batchSizes = [];
  const progress = (stage, count, index) => onProgress({ stage, processed: count, total: prepared.total, batch: index, batches: prepared.batchCount });
  async function run(operation) {
    if (running) throw new Error('An import operation is already running.');
    running = true; paused = false;
    try { return await operation(); } finally { running = false; }
  }
  return {
    pause() { paused = true; },
    get hasStartedImport() { return commitIndex > 0 || pendingWrite !== null; },
    get reviewComplete() { return !!prepared && reviewIndex === prepared.batchCount; },
    review(mapping, headers) {
      return run(async () => {
        if (!prepared) prepared = await session.prepare(mapping, headers);
        progress('review', reviewed, reviewIndex);
        while (reviewIndex < prepared.batchCount && !paused) {
          const rows = await session.getBatch(reviewIndex);
          summary = await session.setReportBatch(reviewIndex, await previewBatch(rows));
          batchSizes[reviewIndex] = rows.length; reviewed += rows.length; reviewIndex++;
          onSummary(summary); progress('review', reviewed, reviewIndex);
        }
        return { complete: reviewIndex === prepared.batchCount, summary };
      });
    },
    commit() {
      return run(async () => {
        if (!prepared || reviewIndex !== prepared.batchCount) throw new Error('Finish reviewing this file before importing.');
        progress('import', processed, commitIndex);
        while (commitIndex < prepared.batchCount && !paused) {
          if (!pendingWrite) {
            const rows = await session.getCommitBatch(commitIndex);
            if (rows.length) pendingWrite = { batchId: crypto.randomUUID(), filename, rows };
          }
          if (pendingWrite) {
            const response = await commitBatch(pendingWrite);
            if (response?.ok !== true || response.batchId !== pendingWrite.batchId) throw new Error('The server did not confirm this import receipt. Retry the current batch.');
            summary = await session.applyCommitBatch(commitIndex, response);
            pendingWrite = null; onSummary(summary);
          }
          processed += batchSizes[commitIndex]; commitIndex++;
          progress('import', processed, commitIndex);
        }
        return { complete: commitIndex === prepared.batchCount, summary };
      });
    },
  };
}
