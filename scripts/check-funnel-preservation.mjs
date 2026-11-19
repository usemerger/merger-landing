// A migration fence, not an authorization test. Existing functional tests cover
// permissions. New homepage code may be added; retained account/admin code must
// remain byte-for-byte equivalent to the reviewed baseline (line endings ignored).
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = JSON.parse(await readFile(path.join(root, 'docs/funnel-preservation-baseline.json'), 'utf8'));
const changed = [];
for (const [name, expected] of Object.entries(baseline.files)) {
  try {
    const text = (await readFile(path.join(root, name), 'utf8')).replace(/\r\n/g, '\n');
    const actual = createHash('sha256').update(text).digest('hex');
    if (actual !== expected) changed.push(name);
  } catch { changed.push(`${name} (missing)`); }
}
console.log(JSON.stringify({ baselineCommit: baseline.commit, protectedFiles: Object.keys(baseline.files).length,
  existingRouteCount: baseline.routes.length, changed, passed: changed.length === 0 }, null, 2));
if (changed.length) {
  console.error('Retained functionality changed. Review the diff and rerun its acceptance tests; do not silently regenerate the baseline.');
  process.exitCode = 1;
}
