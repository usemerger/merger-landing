import { describe, expect, it, vi } from 'vitest';
import { createImportFlow } from '../app/lib/waitlistImportFlow';

function fixture(count = 1200) {
  const row = (index) => ({ row: index + 2, name: 'Synthetic contact', email: `load-${index}@example.com`, firm: '', role: '' });
  const rows = (index) => Array.from({ length: Math.min(500, count - index * 500) }, (_, offset) => row(index * 500 + offset));
  const summary = { total: count, ready: 0, added: 0, existing: 0, duplicate: 0, invalid: 0 };
  const session = {
    prepare: vi.fn(async () => ({ total: count, batchCount: Math.ceil(count / 500) })),
    getBatch: vi.fn(async (index) => rows(index)),
    setReportBatch: vi.fn(async (_, response) => { summary.ready += response.rows.length; return { ...summary }; }),
    getCommitBatch: vi.fn(async (index) => rows(index)),
    applyCommitBatch: vi.fn(async (_, response) => { summary.ready -= response.rows.length; summary.added += response.rows.length; return { ...summary }; }),
  };
  const previewBatch = vi.fn(async (batch) => ({ rows: batch.map((entry) => ({ ...entry, status: 'new' })) }));
  const commitBatch = vi.fn(async (batch) => ({ ok: true, batchId: batch.batchId, rows: batch.rows.map((entry) => ({ ...entry, status: 'added' })) }));
  return { session, previewBatch, commitBatch };
}

describe('large import coordinator', () => {
  it('reviews and imports 500,000 contacts through bounded sequential requests', async () => {
    const context = fixture(500000);
    let active = 0, maxActive = 0;
    const commitBatch = vi.fn(async (batch) => { active++; maxActive = Math.max(active, maxActive); await Promise.resolve(); active--; return { ok: true, batchId: batch.batchId, rows: batch.rows }; });
    const progress = vi.fn();
    const flow = createImportFlow(context.session, 'large.csv', { ...context, commitBatch, onProgress: progress });
    expect((await flow.review({}, true)).complete).toBe(true);
    expect(context.previewBatch).toHaveBeenCalledTimes(1000);
    expect(commitBatch).not.toHaveBeenCalled();
    const result = await flow.commit();
    expect(result).toMatchObject({ complete: true, summary: { added: 500000, ready: 0 } });
    expect(commitBatch).toHaveBeenCalledTimes(1000);
    expect(maxActive).toBe(1);
    expect(commitBatch.mock.calls.every(([batch]) => batch.rows.length <= 500)).toBe(true);
    expect(progress).toHaveBeenLastCalledWith({ stage: 'import', processed: 500000, total: 500000, batch: 1000, batches: 1000 });
  });

  it('replays exactly the uncertain batch and never repeats previously acknowledged ones', async () => {
    const context = fixture();
    const accepted = context.commitBatch.getMockImplementation();
    context.commitBatch.mockImplementationOnce(accepted).mockRejectedValueOnce(new Error('Connection lost after commit')).mockImplementation(accepted);
    const flow = createImportFlow(context.session, 'contacts.csv', context);
    await flow.review({}, true);
    await expect(flow.commit()).rejects.toThrow('Connection lost');
    const uncertain = structuredClone(context.commitBatch.mock.calls[1][0]);
    expect(context.session.applyCommitBatch).toHaveBeenCalledTimes(1);
    expect((await flow.commit()).summary.added).toBe(1200);
    expect(context.commitBatch).toHaveBeenCalledTimes(4);
    expect(context.commitBatch.mock.calls[2][0]).toEqual(uncertain);
    expect(context.commitBatch.mock.calls[0][0].batchId).not.toBe(uncertain.batchId);
    expect(context.session.getCommitBatch.mock.calls.map(([index]) => index)).toEqual([0, 1, 2]);
  });

  it('pauses after an in-flight batch and resumes the remaining file', async () => {
    const context = fixture();
    let flow, requested = false;
    flow = createImportFlow(context.session, 'contacts.csv', { ...context, onProgress(update) { if (!requested && update.stage === 'import' && update.batch === 1) { requested = true; flow.pause(); } } });
    await flow.review({}, true);
    expect((await flow.commit()).complete).toBe(false);
    expect(context.commitBatch).toHaveBeenCalledTimes(1);
    expect((await flow.commit()).complete).toBe(true);
    expect(context.commitBatch).toHaveBeenCalledTimes(3);
  });

  it('resumes review at the failed request and does not allow an incomplete review to write', async () => {
    const context = fixture();
    const accepted = context.previewBatch.getMockImplementation();
    context.previewBatch.mockImplementationOnce(accepted).mockRejectedValueOnce(new Error('Offline')).mockImplementation(accepted);
    const flow = createImportFlow(context.session, 'contacts.csv', context);
    await expect(flow.review({}, true)).rejects.toThrow('Offline');
    await expect(flow.commit()).rejects.toThrow('Finish reviewing');
    expect(context.commitBatch).not.toHaveBeenCalled();
    expect((await flow.review({}, true)).complete).toBe(true);
    expect(context.session.prepare).toHaveBeenCalledTimes(1);
    expect(context.session.getBatch.mock.calls.map(([index]) => index)).toEqual([0, 1, 1, 2]);
  });

  it('skips batches with no new rows and sends only worker-approved contacts', async () => {
    const context = fixture(1000);
    context.session.getCommitBatch.mockResolvedValueOnce([]).mockResolvedValueOnce([{ row: 998, email: 'new@example.com', name: 'New', role: '', firm: '' }]);
    const flow = createImportFlow(context.session, 'contacts.csv', context);
    await flow.review({}, true);
    expect((await flow.commit()).complete).toBe(true);
    expect(context.commitBatch).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ rows: [{ row: 998, email: 'new@example.com', name: 'New', role: '', firm: '' }] }));
  });
});
