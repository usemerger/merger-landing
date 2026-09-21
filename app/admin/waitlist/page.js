'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../../components/Shell';
import { accountAccess, adminInvite, adminRevoke, adminWaitlist, errorMessage, formatDate } from '../../lib/api';

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [filter, setFilter] = useState('eligible');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState([]);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const request = useRef(0);
  const load = useCallback(async () => {
    const id = ++request.current; setPhase('loading'); setError('');
    try {
      const access = await accountAccess();
      if (id !== request.current) return;
      if (!access.capabilities?.isAdmin) { setPhase('forbidden'); return; }
      const result = await adminWaitlist();
      if (id === request.current) { setRows(result.waitlist || []); setPhase('ready'); }
    } catch (err) {
      if (id !== request.current) return;
      if (err?.status === 401) { router.replace('/login?next=/admin/waitlist'); return; }
      if (err?.status === 403) { setPhase('forbidden'); return; }
      setPhase('error'); setError(errorMessage(err));
    }
  }, [router]);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);
  async function inviteSelected() {
    if (pending.current || !selected.length) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    let sent = 0; const failures = [];
    for (const id of selected) {
      try { const result = await adminInvite(id); if (result.emailed) sent += 1; else failures.push(id); }
      catch { failures.push(id); }
    }
    setSelected(failures); setReview(false); setMessage(`${sent} invitation email${sent === 1 ? '' : 's'} sent.${failures.length ? ` ${failures.length} need attention. Check delivery status before retrying.` : ''}`);
    pending.current = false; setBusy(false); await load();
  }
  async function revoke(id) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    try { await adminRevoke(id); setMessage('Invitation revoked. The account and waitlist history are preserved.'); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }
  const visible = rows.filter((row) => {
    const eligible = row.accountLinked && row.emailVerified && !row.admitted && row.invitation?.status !== 'pending';
    return (filter === 'all' || (filter === 'eligible' ? eligible : filter === 'invited' ? row.invitation?.status === 'pending' : row.admitted)) && `${row.email} ${row.firm || ''} ${row.role || ''}`.toLowerCase().includes(query.toLowerCase());
  });
  return <Shell authed><main className="dash-main">
    <p className="eyebrow">Staff workspace</p><h1 className="dash-title">Open the door, a few at a time.</h1>
    {phase === 'loading' && <p role="status" className="spinner-note">Loading waitlist…</p>}
    {phase === 'forbidden' && <div className="panel mt-24"><h2>Staff access required</h2><p className="muted mt-16">This account does not have permission to manage invitations.</p><Link className="btn btn-ghost mt-24" href="/dashboard">Your account</Link></div>}
    {error && <p className="alert alert-error" role="alert">{error}</p>}{message && <p className="alert alert-info" role="status">{message}</p>}
    {phase === 'error' && <button type="button" className="btn btn-ghost" onClick={load}>Try again</button>}
    {phase === 'ready' && <>
      <p className="dash-sub">Only verified, linked accounts can receive new invitations. Review the recipients before sending. Invitations do not start subscriptions.</p>
      <div className="panel mt-24"><div className="field"><label htmlFor="queue-filter">Show</label><select id="queue-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="eligible">Ready to invite</option><option value="invited">Invited</option><option value="admitted">Admitted</option><option value="all">All signups</option></select></div><div className="field"><label htmlFor="queue-search">Find email, firm, or role</label><input id="queue-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></div><p className="field-hint">{visible.length} shown · {rows.length} total</p></div>
      {selected.length > 0 && <section className="panel"><h2>{review ? 'Review this invitation batch' : `${selected.length} selected`}</h2>{review && <><p className="muted mt-16">An access invitation will be emailed to each person below. Reissuing an invitation invalidates its previous link.</p><ul>{rows.filter((row) => selected.includes(row.id)).map((row) => <li key={row.id}>{row.email}</li>)}</ul></>}<div className="dl-row"><button type="button" className="btn btn-primary" disabled={busy} onClick={review ? inviteSelected : () => setReview(true)}>{busy ? 'Sending invitations…' : review ? `Send ${selected.length} invitation${selected.length === 1 ? '' : 's'}` : 'Review invitations'}</button><button type="button" className="btn btn-ghost" disabled={busy} onClick={() => { setSelected([]); setReview(false); }}>Clear selection</button></div></section>}
      {visible.length === 0 && <div className="panel"><p className="muted">No signups match this view.</p></div>}
      {visible.map((row) => <section className="panel" key={row.id}><div className="panel-head"><h2 style={{ overflowWrap: 'anywhere' }}>{row.email}</h2><span className="pill neutral">{row.admitted ? 'Admitted' : row.invitation?.status || 'Waiting'}</span></div><p className="muted mt-16">{[row.role, row.firm].filter(Boolean).join(' · ') || 'No work details supplied'}</p><p className="field-hint mt-16">{row.emailVerified ? 'Verified account' : row.accountLinked ? 'Email not verified' : 'Account not linked'} · Joined {formatDate(row.createdAt) || '—'} · {row.referralCount || 0} referrals</p>{row.invitation && <p className="field-hint">Delivery: {row.invitation.deliveryStatus}. Expires {formatDate(row.invitation.expiresAt) || '—'}.</p>}<div className="dl-row">{row.accountLinked && row.emailVerified && !row.admitted && <label className="field-hint"><input type="checkbox" checked={selected.includes(row.id)} disabled={busy} onChange={(event) => { setReview(false); setSelected((value) => event.target.checked ? [...value, row.id] : value.filter((id) => id !== row.id)); }} /> {row.invitation ? 'Select to reissue invitation' : 'Select for invitation'}</label>}{row.invitation?.status === 'pending' && <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => revoke(row.id)}>Revoke invitation</button>}</div></section>)}
    </>}
  </main></Shell>;
}
