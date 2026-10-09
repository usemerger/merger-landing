'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../../components/Shell';
import { accountAccess } from '../../lib/api';
import { ACCOUNT_ROLES, accountAdminError, adminAccount, adminAccountGrant, adminAccountRevoke, adminAccountRole, adminAccounts, canManageUsers, roleLabel } from '../../lib/adminAccounts';
import './users-admin.css';

const PAGE_SIZE = 50;
const when = (value) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const accessLabel = (user) => user.complimentary?.status === 'active' ? 'Complimentary' : user.accessSource === 'subscription' ? 'Subscription' : user.accessSource === 'legacy' ? 'Founding access' : 'No app access';
const initials = (user) => (user.displayName || user.email || '?').split(/[\s@]+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export default function AdminUsersPage() {
  const router = useRouter();
  const [access, setAccess] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState({ q: '', page: 0 });
  const [cycle, setCycle] = useState(0);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const searchMounted = useRef(false);
  const authorize = useCallback((err) => {
    if (err?.status !== 401 && err?.status !== 403) return false;
    request.current += 1; setAccess(null); setResult(null); setSelected(''); setPhase('forbidden');
    if (err.status === 401) router.replace('/login?next=/admin/users');
    return true;
  }, [router]);
  useEffect(() => {
    if (!searchMounted.current) { searchMounted.current = true; return undefined; }
    const timer = setTimeout(() => setQuery({ q: input.trim(), page: 0 }), 300);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    const controller = new AbortController();
    const id = ++request.current;
    setPhase('loading'); setError(''); setResult(null);
    (async () => {
      try {
        const permissions = await accountAccess();
        if (id !== request.current) return;
        if (!canManageUsers(permissions.capabilities)) { setAccess(null); setSelected(''); setPhase('forbidden'); return; }
        setAccess(permissions);
        const rows = await adminAccounts({ ...query, pageSize: PAGE_SIZE, signal: controller.signal });
        if (id !== request.current) return;
        if (!Array.isArray(rows.users) || rows.users.length > PAGE_SIZE ||
            rows.users.some((user) => typeof user.id !== 'string' || typeof user.email !== 'string') ||
            !Number.isSafeInteger(rows.totalCount) || rows.totalCount < 0 ||
            !Number.isSafeInteger(rows.filteredCount) || rows.filteredCount < 0 || rows.filteredCount > rows.totalCount ||
            typeof rows.hasMore !== 'boolean') throw new Error('Invalid account list');
        setResult(rows); setPhase('ready');
      } catch (err) {
        if (id !== request.current || err?.name === 'AbortError') return;
        if (!authorize(err)) { setError(accountAdminError(err)); setPhase('error'); }
      }
    })();
    return () => { controller.abort(); request.current += 1; };
  }, [query, cycle, authorize]);
  function updated(user) {
    setResult((current) => current ? { ...current, users: current.users.map((row) => row.id === user.id ? user : row) } : current);
  }
  const allowed = canManageUsers(access?.capabilities);
  return <Shell authed capabilities={access?.capabilities}><main className="au-main">
    <header className="au-heading"><div><p className="eyebrow">Administration</p><h1>Users & access</h1><p>Manage registered accounts, team permissions, and complimentary partner access.</p></div>{allowed && <Link className="btn btn-ghost btn-sm" href="/admin/waitlist">Waitlist</Link>}</header>
    {phase === 'forbidden' ? <section className="au-empty"><h2>Administrator access required</h2><p>Only full administrators can view accounts or change access.</p><Link className="btn btn-ghost btn-sm" href="/dashboard">Back to account</Link></section> : <>
      <div className="au-toolbar"><label htmlFor="user-search">Find a registered user<input id="user-search" type="search" placeholder="Search name or email" value={input} maxLength={120} disabled={saving || !allowed} onChange={(event) => { request.current += 1; setInput(event.target.value); setResult(null); setPhase('loading'); }} /></label><p>{result ? `${result.filteredCount.toLocaleString()} ${query.q ? 'matching' : 'registered'} users` : 'Accounts load 50 at a time'}</p></div>
      <div className={`au-workspace${selected && allowed ? ' has-detail' : ''}`}>
        <section className="au-directory" aria-label="Registered users" aria-busy={phase === 'loading'}>
          {phase === 'loading' && <div className="au-empty" role="status">Loading users…</div>}
          {phase === 'error' && <div className="au-empty"><p role="alert">{error}</p><button className="btn btn-ghost btn-sm" type="button" onClick={() => setCycle((value) => value + 1)}>Try again</button></div>}
          {result && <><div className="au-list">{result.users.map((user) => <button type="button" className={`au-user${selected === user.id ? ' is-selected' : ''}`} key={user.id} onClick={() => setSelected(user.id)} disabled={saving} aria-pressed={selected === user.id}>
            <span className="au-avatar" aria-hidden="true">{initials(user)}</span><span className="au-user-copy"><strong>{user.displayName || 'Unnamed account'}</strong><span>{user.email}</span><small>{roleLabel(user.role)}{!user.emailVerified && ' · Email unverified'}</small></span><span className={`au-badge${user.canUseApp ? ' is-active' : ''}`}>{accessLabel(user)}</span>
          </button>)}</div>{!result.users.length && <div className="au-empty"><h2>No matching accounts</h2><p>{query.q ? 'Try another name or email. Imported waitlist leads appear here only after they register.' : 'Registered Merger accounts will appear here.'}</p></div>}
          <footer className="au-pagination"><span>Page {query.page + 1}{result.filteredCount > 0 ? ` of ${Math.ceil(result.filteredCount / PAGE_SIZE)}` : ''}</span><div><button type="button" className="btn btn-ghost btn-sm" disabled={saving || query.page === 0} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</button><button type="button" className="btn btn-ghost btn-sm" disabled={saving || !result.hasMore} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</button></div></footer></>}
        </section>
        {selected && allowed && <AccountDetail key={selected} id={selected} actorId={access.user?.id} onClose={() => setSelected('')} onUpdated={updated} onBusy={setSaving} onUnauthorized={authorize} />}
      </div>
    </>}
  </main></Shell>;
}

function AccountDetail({ id, actorId, onClose, onUpdated, onBusy, onUnauthorized }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState('');
  const [role, setRole] = useState('none');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const generation = useRef(0);
  const pending = useRef(false);
  const mounted = useRef(true);
  const editor = useRef(null);
  const reload = useCallback(async () => {
    const sequence = ++generation.current;
    setLoading(true); setError(''); setReview(null);
    try {
      const response = await adminAccount(id);
      if (!mounted.current || sequence !== generation.current) return;
      if (response.user?.id !== id) throw new Error('Account response mismatch');
      setDetail(response); setRole(response.user.role); setNeedsRefresh(false); setMode(''); setReason(''); setDuration('');
    } catch (err) { if (mounted.current && sequence === generation.current && !onUnauthorized(err)) setError(accountAdminError(err)); }
    finally { if (mounted.current && sequence === generation.current) setLoading(false); }
  }, [id, onUnauthorized]);
  useEffect(() => { mounted.current = true; reload(); return () => { mounted.current = false; generation.current += 1; }; }, [reload]);
  useEffect(() => { if (mode) editor.current?.scrollIntoView?.({ block: 'nearest', behavior: 'instant' }); }, [mode, review]);
  const user = detail?.user;
  const self = user?.id === actorId;
  const protectedRole = user?.protectedAdmin || self;
  const active = user?.complimentary?.status === 'active';
  function begin(value) { setMode(value); setReview(null); setReason(''); setDuration(''); setRole(user.role); setNotice(''); setError(''); }
  function prepare(event) {
    event.preventDefault();
    if (!user || pending.current || needsRefresh) return;
    if (!reason.trim()) { setError('Add a reason for the audit history.'); return; }
    if (mode === 'role' && (protectedRole || role === user.role)) return;
    if (mode === 'role' && !user.emailVerified && role !== 'none') { setError('Email verification is required before granting staff permissions.'); return; }
    if (mode === 'grant' && (!user.emailVerified || !['30', '90', 'none'].includes(duration))) { setError('Choose how long complimentary access should last.'); return; }
    setError('');
    setReview({ mode, role, duration, reason: reason.trim(), expectedRevision: user.revision });
  }
  async function confirm() {
    if (!review || pending.current || needsRefresh || !user) return;
    pending.current = true; setBusy(true); onBusy(true); setError(''); setNotice('');
    const current = generation.current;
    try {
      const body = { reason: review.reason, expectedRevision: review.expectedRevision };
      const response = await (review.mode === 'role' ? adminAccountRole(id, { ...body, role: review.role }) : review.mode === 'grant' ? adminAccountGrant(id, { ...body, durationDays: review.duration === 'none' ? null : Number(review.duration) }) : adminAccountRevoke(id, body));
      if (!mounted.current || current !== generation.current) return;
      if (response.user?.id !== id) throw new Error('Account response mismatch');
      setDetail(response); onUpdated(response.user); setReview(null); setMode(''); setReason('');
      setNotice(review.mode === 'role' ? 'Role updated.' : review.mode === 'grant' ? 'Complimentary access granted.' : 'Complimentary access revoked. Other access is unchanged.');
    } catch (err) {
      if (!mounted.current || current !== generation.current || onUnauthorized(err)) return;
      const uncertain = !err?.status || err.status >= 500 || err.code === 'invalid_response';
      setNeedsRefresh(true); setReview(null);
      setError(uncertain ? 'The result has not been confirmed. Refresh this account to check its current access before making another change.' : accountAdminError(err));
    } finally { pending.current = false; if (mounted.current) setBusy(false); onBusy(false); }
  }
  return <aside className="au-detail" aria-label="Account details" aria-busy={busy || loading}>
    <header className="au-detail-top"><span>Account details</span><button type="button" className="au-icon-button" aria-label="Close account details" onClick={onClose} disabled={busy}>×</button></header>
    {loading ? <p className="au-empty" role="status">Loading account…</p> : <>
      {error && <div className="au-feedback is-error" role="alert">{error}</div>}{notice && <div className="au-feedback" role="status">{notice}</div>}
      {(!user || needsRefresh) && <div className="au-inset"><button type="button" className="btn btn-ghost btn-sm" onClick={reload} disabled={busy}>Refresh account details</button></div>}
      {user && <><section className="au-identity"><span className="au-avatar is-large" aria-hidden="true">{initials(user)}</span><h2>{user.displayName || 'Unnamed account'}</h2><p>{user.email}</p><span className="au-badge">{user.emailVerified ? 'Email verified' : 'Email unverified'}</span><p className="au-caption">Registered {when(user.createdAt)}</p></section>
        <section className="au-section"><div className="au-section-title"><h3>Team permissions</h3><span className="au-badge">{roleLabel(user.role)}</span></div><p>{user.role === 'admin' ? 'Can manage users, access, and waitlist rollout.' : user.role === 'waitlist_importer' ? 'Can view the waitlist and import contacts.' : user.role === 'waitlist_viewer' ? 'Can view the waitlist without changing it.' : 'Standard account. No administration permissions.'}</p>
          {protectedRole ? <p className="au-caption">{user.protectedAdmin ? 'Protected administrator. This role is managed outside this dashboard.' : 'You cannot change your own administrator role.'}</p> : <button type="button" className="btn btn-ghost btn-sm" onClick={() => begin('role')} disabled={busy || needsRefresh}>Change role</button>}
        </section>
        <section className="au-section"><div className="au-section-title"><h3>App access</h3><span className={`au-badge${user.canUseApp ? ' is-active' : ''}`}>{user.canUseApp ? 'Enabled' : 'Not active'}</span></div><dl className="au-facts"><div><dt>Complimentary</dt><dd>{active ? 'Partner access' : user.complimentary?.status === 'expired' ? 'Expired' : user.complimentary?.status === 'revoked' ? 'Revoked' : 'None'}</dd></div>{user.complimentary?.grantedAt && <div><dt>{active ? 'Expires' : 'Expiry'}</dt><dd>{user.complimentary.expiresAt ? when(user.complimentary.expiresAt) : 'No expiry'}</dd></div>}<div><dt>Paid subscription</dt><dd>{user.accessSource === 'legacy' || user.subscriptionStatus === 'none' || !user.subscriptionStatus ? 'None' : user.subscriptionStatus.replaceAll('_', ' ')}</dd></div>{user.accessSource === 'legacy' && <div><dt>Founding access</dt><dd>Active</dd></div>}</dl>
          <p>Complimentary access is free. It does not create, cancel, or change a paid subscription.</p>
          <div className="au-actions"><button type="button" className="btn btn-primary btn-sm" disabled={busy || needsRefresh || !user.emailVerified} onClick={() => begin('grant')}>{active ? 'Update free access' : 'Grant free access'}</button>{active && <button type="button" className="btn btn-ghost btn-sm" disabled={busy || needsRefresh} onClick={() => begin('revoke')}>Revoke free access</button>}</div>
          {!user.emailVerified && <p className="au-caption">Email verification is required before granting free access.</p>}
        </section>
        {mode && !needsRefresh && <section className="au-editor" aria-label="Edit account access" ref={editor}>
          <h3>{mode === 'role' ? 'Change role' : mode === 'grant' ? 'Complimentary partner access' : 'Revoke complimentary access'}</h3>
          {review ? <><p className="au-caption">Review before applying</p><div className="au-review"><strong>{user.email}</strong><p>{review.mode === 'role' ? `${roleLabel(user.role)} → ${roleLabel(review.role)}` : review.mode === 'grant' ? `Free access · ${review.duration === 'none' ? 'No expiry' : `${review.duration} days from confirmation`}` : 'Remove complimentary access. Any subscription or founding access remains unchanged.'}</p><p>Reason: {review.reason}</p>{review.mode === 'role' && review.role === 'admin' && <p>This grants full control of user permissions, complimentary access, and waitlist invitations.</p>}</div><div className="au-actions"><button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setReview(null)}>Back to edit</button><button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={confirm}>{busy ? 'Applying…' : 'Confirm change'}</button></div></> : <form onSubmit={prepare}>
            {mode === 'role' && <label htmlFor="account-role">Role<select id="account-role" value={role} onChange={(event) => setRole(event.target.value)}>{ACCOUNT_ROLES.map(([value, label]) => <option value={value} key={value} disabled={!user.emailVerified && value !== 'none'}>{label}</option>)}</select>{!user.emailVerified && <span className="au-caption">Verify email before granting staff permissions.</span>}</label>}
            {mode === 'grant' && <label htmlFor="access-duration">Access duration<select id="access-duration" value={duration} onChange={(event) => setDuration(event.target.value)} required><option value="">Choose a duration</option><option value="30">30 days</option><option value="90">90 days</option><option value="none">No expiry</option></select></label>}
            <label htmlFor="access-reason">Reason<textarea id="access-reason" value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={500} rows={3} placeholder="Why is this access changing?" /></label><p className="au-caption">Saved in the administrator audit history. No email will be sent.</p><div className="au-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('')}>Cancel</button><button type="submit" className="btn btn-primary btn-sm" disabled={!reason.trim() || (mode === 'role' && role === user.role) || (mode === 'grant' && !duration)}>Review change</button></div>
          </form>}
        </section>}
        <section className="au-section"><div className="au-section-title"><h3>Recent access history</h3><button type="button" className="au-text-button" onClick={reload} disabled={busy}>Refresh</button></div>{!detail.audit?.length ? <p>No access changes recorded.</p> : <ol className="au-audit">{detail.audit.map((item) => <li key={item.id}><strong>{({ role_changed: 'Role changed', complimentary_granted: 'Free access granted', complimentary_revoked: 'Free access revoked' })[item.action] || item.action.replaceAll('_', ' ')}</strong><time dateTime={item.createdAt}>{when(item.createdAt)}</time><p>{item.reason}</p><small>Administrator {item.actor}</small></li>)}</ol>}</section>
      </>}
    </>}
  </aside>;
}
