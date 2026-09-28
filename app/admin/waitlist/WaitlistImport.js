'use client';
import { useEffect, useRef, useState } from 'react';
import { adminImportWaitlist, adminPreviewWaitlistImport, errorMessage } from '../../lib/api';
import { createImportSession, guessMapping } from '../../lib/waitlistImport';
import { createImportFlow } from '../../lib/waitlistImportFlow';

const fields = [['email', 'Email address', true], ['name', 'Full name'], ['firstName', 'First name'], ['lastName', 'Last name'], ['firm', 'Company'], ['role', 'Role']];
const labels = { new: 'Ready to add', added: 'Added to queue', existing: 'Already on waitlist', duplicate: 'Repeated in file', invalid: 'Needs correction' };
const PAGE_SIZE = 50;
const number = (value = 0) => value.toLocaleString('en-US');
function download(value, name) {
  const url = URL.createObjectURL(value instanceof Blob ? value : new Blob([value], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importError(error) {
  if (error?.status === 403) return 'Staff access is required to import contacts. Any completed batches remain saved.';
  if (error?.code === 'import_batch_conflict') return 'This batch does not match its saved import. Choose the file again to review the remaining contacts.';
  if (error?.status === 413) return 'A contact batch exceeded the server limit. Choose fewer or shorter contact fields and review again.';
  return error?.status !== undefined ? errorMessage(error) : error.message || 'We could not read this file. Try exporting it as CSV.';
}

export default function WaitlistImport({ onClose, onImported }) {
  const [file, setFile] = useState(null), [sheet, setSheet] = useState(null);
  const [headers, setHeaders] = useState(true), [mapping, setMapping] = useState({});
  const [phase, setPhase] = useState('choose'), [busy, setBusy] = useState('');
  const [error, setError] = useState(''), [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState(null), [pauseRequested, setPauseRequested] = useState(false);
  const [issuesOnly, setIssuesOnly] = useState(false), [page, setPage] = useState(0);
  const [report, setReport] = useState({ rows: [], total: 0 }), [reportRevision, setReportRevision] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [needsReopen, setNeedsReopen] = useState(false);
  const session = useRef(null), flow = useRef(null), pending = useRef(false), version = useRef(0), heading = useRef(null);
  const fileRead = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true; heading.current?.focus();
    return () => { mounted.current = false; version.current++; flow.current?.pause(); fileRead.current?.abort(); session.current?.destroy(); };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [phase]);
  useEffect(() => {
    if (!busy && !['reviewing', 'importing'].includes(phase)) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy, phase]);
  useEffect(() => {
    if (!session.current || session.current.closed || !summary || busy) return;
    let current = true;
    setReportLoading(true);
    session.current.getReportPage({ page, pageSize: PAGE_SIZE, issuesOnly }).then((next) => {
      if (current) setReport(next);
    }).catch((err) => { if (current) setError(importError(err)); }).finally(() => { if (current) setReportLoading(false); });
    return () => { current = false; };
  }, [page, issuesOnly, reportRevision, busy, !!summary]);

  function resetReview() { flow.current = null; setSummary(null); setReport({ rows: [], total: 0 }); setProgress(null); setError(''); setPage(0); setNeedsReopen(false); }
  async function choose(next, selectedSheet) {
    if (!next || pending.current) return;
    const id = ++version.current;
    fileRead.current?.abort(); fileRead.current = new AbortController();
    session.current?.destroy(); session.current = null; resetReview(); setSheet(null);
    setBusy('Reading file…'); setPhase('choose');
    try {
      const opened = await createImportSession(next, selectedSheet, (update) => { if (id === version.current) setProgress({ ...update, stage: 'file' }); }, fileRead.current.signal);
      if (id !== version.current) { opened.destroy(); return; }
      session.current = opened;
      setFile(next); setSheet(opened); setHeaders(true); setMapping(guessMapping(opened.rows[0]?.cells || [])); setPhase('map'); setProgress(null);
    } catch (err) { if (id === version.current) setError(importError(err)); }
    finally { if (id === version.current) setBusy(''); }
  }
  function getFlow() {
    if (!flow.current) flow.current = createImportFlow(session.current, file.name, {
      previewBatch: adminPreviewWaitlistImport, commitBatch: adminImportWaitlist,
      onProgress: (next) => { if (mounted.current) setProgress(next); },
      onSummary: (next) => { if (mounted.current) setSummary({ ...next }); },
    });
    return flow.current;
  }
  async function review() {
    if (pending.current || busy || !session.current) return;
    pending.current = true; setBusy('Checking contacts…'); setError(''); setPauseRequested(false); setPhase('reviewing');
    try {
      const outcome = await getFlow().review(mapping, headers);
      if (!mounted.current) return;
      setPhase(outcome.complete ? 'review' : 'reviewing'); setPage(0); setIssuesOnly(false); setReportRevision((value) => value + 1);
    } catch (err) { if (mounted.current) { setNeedsReopen(!!session.current?.closed); setError(session.current?.closed ? 'The file reader stopped. Close this panel and choose the file again.' : importError(err)); setReportRevision((value) => value + 1); } }
    finally { pending.current = false; if (mounted.current) { setBusy(''); setPauseRequested(false); } }
  }
  async function commit() {
    if (pending.current || busy || !flow.current?.reviewComplete) return;
    pending.current = true; setBusy('Adding to waitlist…'); setError(''); setPauseRequested(false); setPhase('importing');
    try {
      const outcome = await flow.current.commit();
      if (!mounted.current) return;
      setSummary({ ...outcome.summary }); setPage(0); setIssuesOnly(false); setPhase(outcome.complete ? 'done' : 'importing');
      if (outcome.complete) onImported({ ok: true, summary: outcome.summary });
    } catch (err) {
      if (mounted.current) { setNeedsReopen(!!session.current?.closed); setError(session.current?.closed ? 'The file reader stopped. Completed batches are saved. Close this panel and upload the file again; contacts already added will be skipped.' : `${importError(err)} Completed batches are saved. Resume to safely check or finish the current batch.`); }
    } finally { pending.current = false; if (mounted.current) { setBusy(''); setPauseRequested(false); setReportRevision((value) => value + 1); } }
  }
  async function exportResults() {
    if (busy || !session.current) return;
    setBusy('Preparing download…'); setError('');
    try { download(await session.current.exportReport(), 'merger-import-results.csv'); }
    catch (err) { if (mounted.current) setError(importError(err)); }
    finally { if (mounted.current) setBusy(''); }
  }
  function close() {
    if (busy) return;
    if (flow.current?.hasStartedImport && phase !== 'done') onImported({ ok: true, partial: true, summary });
    session.current?.destroy(); onClose();
  }
  const working = ['reviewing', 'importing'].includes(phase);
  const importing = ['importing', 'done'].includes(phase);
  const percent = progress?.total ? Math.min(100, Math.floor(progress.processed / progress.total * 100)) : 0;
  const progressText = progress?.stage === 'file' ? progress.message : progress ? `${number(progress.processed)} of ${number(progress.total)} contacts ${progress.stage === 'review' ? 'reviewed' : 'processed'}` : busy;
  const columns = sheet?.columnCount || 0;
  return <section className="wi-panel" aria-labelledby="import-heading" aria-busy={!!busy}>
    <div className="wi-heading"><div><p className="wa-kicker">{phase === 'done' ? 'Import complete' : 'Bring your contacts'}</p><h2 id="import-heading" tabIndex={-1} ref={heading}>{phase === 'done' ? `${number(summary?.added)} ${summary?.added === 1 ? 'person' : 'people'} added to the queue` : phase === 'importing' ? 'Adding your contacts' : ['review', 'reviewing'].includes(phase) ? 'Review your import' : 'Import to waitlist'}</h2></div><button type="button" className="btn btn-ghost" disabled={!!busy} onClick={close}>{phase === 'done' ? 'Done' : 'Close'}</button></div>
    <p className="wi-intro">Add names and emails from a spreadsheet. Existing signups keep their place and details. Importing sends no emails and does not create accounts.</p>
    {error && <p className="wi-error" role="alert">{error}</p>}
    {(busy || working) && <div className="wi-progress-block"><div className="wi-progress" role="status">{busy && <span className="wa-loader" />}<span>{busy ? progressText : `${phase === 'importing' ? 'Import' : 'Review'} paused. ${progressText || ''}`}</span>{working && busy && <button type="button" className="wa-text-button" disabled={pauseRequested} onClick={() => { flow.current?.pause(); setPauseRequested(true); }}>{pauseRequested ? 'Pausing after this batch…' : 'Pause'}</button>}</div>{!!progress?.total && <progress className="wi-progress-meter" aria-label={phase === 'importing' ? 'Import progress' : 'Review progress'} value={percent} max="100" />}<p className="wi-help">Keep this tab open while the file is processed in small batches. If you close it, upload the file again; contacts already added will be skipped.</p></div>}
    {(phase === 'choose' || phase === 'map') && <>
      <div className="wi-file-row"><label className="wi-file"><span>{file ? file.name : 'Choose a contact list'}</span><small>Up to 500,000 contacts · CSV up to 250 MB · XLS / XLSX up to 50 MB</small><input aria-label="Contact spreadsheet" type="file" accept=".csv,.xls,.xlsx" disabled={!!busy} onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ''; }} /></label><button type="button" className="wa-text-button" onClick={() => download('Name,Email,Company,Role\r\nMorgan Ellis,morgan@example.com,Oak Street Partners,Partner\r\n', 'merger-waitlist-template.csv')}>Download CSV template</button></div>
      {sheet && <>
        <div className="wi-sheet-settings">{sheet.sheetNames.length > 1 && <label>Worksheet<select aria-label="Worksheet" disabled={!!busy} value={sheet.sheet} onChange={(event) => choose(file, event.target.value)}>{sheet.sheetNames.map((name) => <option key={name}>{name}</option>)}</select></label>}<label className="wi-checkbox"><input type="checkbox" checked={headers} disabled={!!busy} onChange={(event) => { resetReview(); setHeaders(event.target.checked); setMapping(guessMapping(sheet.rows[0]?.cells || [], event.target.checked)); }} />First row contains column names</label></div>
        <h3>Match your columns</h3><p className="wi-help">{sheet.totalRows === 0 ? 'This worksheet has no contacts. Choose another worksheet or upload a different file.' : 'Email is required. Use a full name, or combine first and last names. Extra columns, including notes and skills, are ignored unless selected.'}</p>
        <div className="wi-mapping">{fields.map(([field, label, required]) => {
          const disabled = !!busy || (['firstName', 'lastName'].includes(field) && mapping.name !== '');
          return <label key={field}>{label}{required && <span className="wi-required">Required</span>}<select aria-label={`${label} column`} disabled={disabled} value={mapping[field] ?? ''} onChange={(event) => { resetReview(); setMapping({ ...mapping, [field]: event.target.value }); }}><option value="">{required ? 'Choose a column' : 'Skip this field'}</option>{Array.from({ length: columns }, (_, index) => <option key={index} value={String(index)}>{headers ? sheet.rows[0]?.cells[index]?.slice(0, 65) || `Column ${index + 1} (unnamed)` : `Column ${index + 1}`}</option>)}</select><small>{mapping[field] !== '' && !disabled ? `Example: ${(sheet.rows[headers ? 1 : 0]?.cells[Number(mapping[field])] || 'Empty').slice(0, 90)}` : disabled && !busy ? 'Using the full name column' : ' '}</small></label>;
        })}</div>
        <div className="wi-footer"><span>Only the selected contact fields will be sent for review.</span><button type="button" className="btn btn-primary" disabled={!!busy || mapping.email === ''} onClick={review}>Review contacts</button></div>
      </>}
    </>}
    {summary && ['review', 'reviewing', 'importing', 'done'].includes(phase) && <>
      <div className="wi-totals" aria-label="Import totals">{[[importing ? 'Added to queue' : 'Ready to add', importing ? summary.added : summary.ready], ['Already on waitlist', summary.existing], ['Repeated in file', summary.duplicate], ['Needs correction', summary.invalid]].map(([label, count]) => <div key={label}><strong>{number(count)}</strong><span>{label}</span></div>)}</div>
      <p className="wi-help">{importing ? 'New contacts are waiting in the queue. They need to create and verify a Merger account with the same email before you can invite them.' : 'Only valid new contacts will be added. Repeated emails and existing signups are skipped. Correct invalid rows in your file and import them again.'}</p>
      {!busy && !needsReopen && <><div className="wi-report-tools"><label className="wi-checkbox"><input type="checkbox" checked={issuesOnly} disabled={reportLoading} onChange={(event) => { setIssuesOnly(event.target.checked); setPage(0); }} />Show corrections only</label><button type="button" className="wa-text-button" onClick={exportResults}>Download results</button></div>
        <div className="wi-table-wrap" aria-busy={reportLoading}><table className="wi-table"><caption className="wa-sr-only">Contact import review</caption><thead><tr><th>Row</th><th>Name</th><th>Email</th><th>Result</th></tr></thead><tbody>{report.rows.map((row) => <tr key={row.row}><td>{number(row.row)}</td><td>{row.name || '—'}</td><td>{row.email || 'Missing email'}{(row.firm || row.role) && <small>{[row.firm, row.role].filter(Boolean).join(' · ')}</small>}</td><td><span className={`wa-badge ${row.status === 'invalid' ? 'wi-invalid' : ['new', 'added'].includes(row.status) ? 'good' : 'muted'}`}>{labels[row.status]}</span>{row.error && <small>{row.error}</small>}</td></tr>)}</tbody></table>{!report.rows.length && <p className="wi-no-rows">{reportLoading ? 'Loading review…' : issuesOnly ? 'No rows need correction.' : 'No reviewed rows yet.'}</p>}</div>
        {report.total > PAGE_SIZE && <nav className="wi-report-pages" aria-label="Import result pages"><button type="button" className="btn btn-ghost" disabled={reportLoading || page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>{number(page * PAGE_SIZE + 1)}–{number(Math.min((page + 1) * PAGE_SIZE, report.total))} of {number(report.total)}</span><button type="button" className="btn btn-ghost" disabled={reportLoading || (page + 1) * PAGE_SIZE >= report.total} onClick={() => setPage(page + 1)}>Next</button></nav>}
      </>}
    </>}
    {['reviewing', 'review', 'importing'].includes(phase) && <div className="wi-footer">{phase !== 'importing' ? <button type="button" className="btn btn-ghost" disabled={!!busy || needsReopen} onClick={() => { resetReview(); setPhase('map'); }}>Back to columns</button> : <span>Completed batches stay saved if you pause.</span>}<button type="button" className="btn btn-primary wi-submit" disabled={!!busy || needsReopen || (phase === 'review' && !summary?.ready)} onClick={phase === 'reviewing' ? review : commit}>{busy || (phase === 'importing' ? 'Resume import' : phase === 'reviewing' ? 'Resume review' : `Add ${number(summary?.ready)} to waitlist`)}</button></div>}
  </section>;
}
