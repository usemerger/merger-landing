'use client';
import { useEffect, useRef, useState } from 'react';
import { adminImportWaitlist, adminPreviewWaitlistImport, errorMessage } from '../../lib/api';
import { guessMapping, mapImportRows, readImportFile, resultsCsv } from '../../lib/waitlistImport';

const fields = [['email', 'Email address', true], ['name', 'Full name'], ['firstName', 'First name'], ['lastName', 'Last name'], ['firm', 'Company'], ['role', 'Role']];
const labels = { new: 'Ready to add', added: 'Added to queue', existing: 'Already on waitlist', duplicate: 'Repeated in file', invalid: 'Needs correction' };
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importError(error) {
  if (error?.status === 403) return 'Staff access is required to import contacts. Your file has not been imported.';
  if (error?.code === 'import_batch_conflict') return 'This import has changed. Go back and review it again.';
  if (error?.status === 413) return 'This batch is too large. Split it into smaller files and try again.';
  return error?.status !== undefined ? errorMessage(error) : error.message || 'We could not read this file. Try exporting it as CSV.';
}

export default function WaitlistImport({ onClose, onImported }) {
  const [file, setFile] = useState(null), [sheet, setSheet] = useState(null);
  const [headers, setHeaders] = useState(true), [mapping, setMapping] = useState({});
  const [phase, setPhase] = useState('choose'), [busy, setBusy] = useState('');
  const [error, setError] = useState(''), [preview, setPreview] = useState(null), [result, setResult] = useState(null);
  const [issuesOnly, setIssuesOnly] = useState(false), [shown, setShown] = useState(50);
  const payload = useRef(null), pending = useRef(false), version = useRef(0), heading = useRef(null);
  useEffect(() => { heading.current?.focus(); return () => { version.current++; }; }, []);
  useEffect(() => { heading.current?.focus(); }, [phase]);

  async function choose(next, selectedSheet) {
    if (!next || pending.current) return;
    const id = ++version.current;
    setBusy('Reading file…'); setError(''); setPreview(null); setResult(null); payload.current = null;
    try {
      const parsed = await readImportFile(next, selectedSheet);
      if (id !== version.current) return;
      setFile(next); setSheet(parsed); setHeaders(true); setMapping(guessMapping(parsed.rows[0]?.cells || [])); setPhase('map');
    } catch (err) { if (id === version.current) { setError(importError(err)); if (!sheet) setPhase('choose'); } }
    finally { if (id === version.current) setBusy(''); }
  }
  async function review() {
    if (pending.current || busy) return;
    pending.current = true; setBusy('Checking contacts…'); setError('');
    const id = version.current;
    try {
      const rows = mapImportRows(sheet, mapping, headers);
      const response = await adminPreviewWaitlistImport(rows);
      if (id !== version.current) return;
      payload.current = { batchId: crypto.randomUUID(), filename: file.name, rows };
      setPreview(response); setIssuesOnly(false); setShown(50); setPhase('review');
    } catch (err) { if (id === version.current) setError(importError(err)); }
    finally { pending.current = false; if (id === version.current) setBusy(''); }
  }
  async function commit() {
    if (pending.current || busy || !payload.current || !preview?.summary.ready) return;
    pending.current = true; setBusy('Adding to waitlist…'); setError('');
    try {
      const response = await adminImportWaitlist(payload.current);
      setResult(response); setIssuesOnly(false); setShown(50); setPhase('done'); onImported(response);
    } catch (err) { setError(`${importError(err)} Your review is saved here. Retry to safely check or finish this same import.`); }
    finally { pending.current = false; setBusy(''); }
  }
  const report = result || preview;
  const reportRows = report?.rows.filter((row) => !issuesOnly || row.status === 'invalid') || [];
  const columns = sheet ? Math.max(...sheet.rows.map((row) => row.cells.length), 0) : 0;
  return <section className="wi-panel" aria-labelledby="import-heading" aria-busy={!!busy}>
    <div className="wi-heading"><div><p className="wa-kicker">{phase === 'done' ? 'Import complete' : 'Bring your contacts'}</p><h2 id="import-heading" tabIndex={-1} ref={heading}>{phase === 'review' ? 'Review your import' : phase === 'done' ? `${result.summary.added} ${result.summary.added === 1 ? 'person' : 'people'} added to the queue` : 'Import to waitlist'}</h2></div><button type="button" className="btn btn-ghost" disabled={!!busy} onClick={onClose}>{phase === 'done' ? 'Done' : 'Close'}</button></div>
    <p className="wi-intro">Add names and emails from a spreadsheet. Existing signups keep their place and details. Importing sends no emails and does not create accounts.</p>
    {error && <p className="wi-error" role="alert">{error}</p>}
    {busy && <p className="wi-progress" role="status"><span className="wa-loader" />{busy}</p>}
    {(phase === 'choose' || phase === 'map') && <>
      <div className="wi-file-row"><label className="wi-file"><span>{file ? file.name : 'Choose a contact list'}</span><small>CSV, XLS, or XLSX · up to 5 MB and 1,000 contacts</small><input aria-label="Contact spreadsheet" type="file" accept=".csv,.xls,.xlsx" disabled={!!busy} onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ''; }} /></label><button type="button" className="wa-text-button" onClick={() => download('Name,Email,Company,Role\r\nMorgan Ellis,morgan@example.com,Oak Street Partners,Partner\r\n', 'merger-waitlist-template.csv')}>Download CSV template</button></div>
      {sheet && <>
        <div className="wi-sheet-settings">{sheet.sheetNames.length > 1 && <label>Worksheet<select aria-label="Worksheet" disabled={!!busy} value={sheet.sheet} onChange={(event) => choose(file, event.target.value)}>{sheet.sheetNames.map((name) => <option key={name}>{name}</option>)}</select></label>}<label className="wi-checkbox"><input type="checkbox" checked={headers} disabled={!!busy} onChange={(event) => { setHeaders(event.target.checked); setMapping(guessMapping(sheet.rows[0]?.cells || [], event.target.checked)); setError(''); }} />First row contains column names</label></div>
        <h3>Match your columns</h3><p className="wi-help">Email is required. Use a full name, or combine first and last names. Extra columns, including notes and skills, are ignored unless selected.</p>
        <div className="wi-mapping">{fields.map(([field, label, required]) => {
          const disabled = !!busy || (['firstName', 'lastName'].includes(field) && mapping.name !== '');
          return <label key={field}>{label}{required && <span className="wi-required">Required</span>}<select aria-label={`${label} column`} disabled={disabled} value={mapping[field] ?? ''} onChange={(event) => { setMapping({ ...mapping, [field]: event.target.value }); setError(''); }}><option value="">{required ? 'Choose a column' : 'Skip this field'}</option>{Array.from({ length: columns }, (_, index) => <option key={index} value={String(index)}>{headers ? sheet.rows[0]?.cells[index]?.slice(0, 65) || `Column ${index + 1} (unnamed)` : `Column ${index + 1}`}</option>)}</select><small>{mapping[field] !== '' && !disabled ? `Example: ${(sheet.rows[headers ? 1 : 0]?.cells[Number(mapping[field])] || 'Empty').slice(0, 90)}` : disabled && !busy ? 'Using the full name column' : ' '}</small></label>;
        })}</div>
        <div className="wi-footer"><span>Only the selected contact fields will be sent for review.</span><button type="button" className="btn btn-primary" disabled={!!busy || mapping.email === ''} onClick={review}>Review contacts</button></div>
      </>}
    </>}
    {report && (phase === 'review' || phase === 'done') && <>
      <div className="wi-totals" aria-label="Import totals">{[[phase === 'done' ? 'Added to queue' : 'Ready to add', phase === 'done' ? report.summary.added : report.summary.ready], ['Already on waitlist', report.summary.existing], ['Repeated in file', report.summary.duplicate], ['Needs correction', report.summary.invalid]].map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
      <p className="wi-help">{phase === 'done' ? 'New contacts are waiting in the queue. They need to create and verify a Merger account with the same email before you can invite them.' : 'Only valid new contacts will be added. Repeated emails and existing signups are skipped. Correct invalid rows in your file and import them again.'}</p>
      <div className="wi-report-tools"><label className="wi-checkbox"><input type="checkbox" checked={issuesOnly} onChange={(event) => { setIssuesOnly(event.target.checked); setShown(50); }} />Show corrections only</label><button type="button" className="wa-text-button" onClick={() => download(resultsCsv(report.rows), 'merger-import-results.csv')}>Download results</button></div>
      <div className="wi-table-wrap"><table className="wi-table"><caption className="wa-sr-only">Contact import review</caption><thead><tr><th>Row</th><th>Name</th><th>Email</th><th>Result</th></tr></thead><tbody>{reportRows.slice(0, shown).map((row, index) => <tr key={`${row.row}-${index}`}><td>{row.row}</td><td>{row.name || '—'}</td><td>{row.email || 'Missing email'}{(row.firm || row.role) && <small>{[row.firm, row.role].filter(Boolean).join(' · ')}</small>}</td><td><span className={`wa-badge ${row.status === 'invalid' ? 'wi-invalid' : ['new', 'added'].includes(row.status) ? 'good' : 'muted'}`}>{labels[row.status]}</span>{row.error && <small>{row.error}</small>}</td></tr>)}</tbody></table>{!reportRows.length && <p className="wi-no-rows">No rows need correction.</p>}</div>
      {reportRows.length > shown && <button type="button" className="wa-text-button" onClick={() => setShown(shown + 100)}>Show more ({Math.min(shown, reportRows.length)} of {reportRows.length})</button>}
      {phase === 'review' && <div className="wi-footer"><button type="button" className="btn btn-ghost" disabled={!!busy} onClick={() => { setPhase('map'); setPreview(null); setError(''); payload.current = null; }}>Back to columns</button><button type="button" className="btn btn-primary wi-submit" disabled={!!busy || !report.summary.ready} onClick={commit}>{busy === 'Adding to waitlist…' ? busy : `Add ${report.summary.ready} to waitlist`}</button></div>}
    </>}
  </section>;
}
