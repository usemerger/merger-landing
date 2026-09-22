'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../../components/Shell';
import { accountAccess, adminInvite, adminRevoke, adminWaitlist, errorMessage, formatDate } from '../../lib/api';
import './waitlist-admin.css';

function inviteStatus(row) {
  if (row.invitation?.status === 'pending' && row.invitation.expiresAt && new Date(row.invitation.expiresAt).getTime() <= Date.now()) return 'expired';
  return row.invitation?.status;
}
function canSelect(row) { return row.accountLinked && row.emailVerified && !row.admitted && inviteStatus(row) !== 'accepted'; }
function isReady(row) { return canSelect(row) && inviteStatus(row) !== 'pending'; }
function rowStatus(row) {
  if (row.admitted || inviteStatus(row) === 'accepted') return { label: 'Admitted', tone: 'good' };
  if (inviteStatus(row) === 'pending') return { label: 'Invited', tone: 'gold' };
  if (inviteStatus(row) === 'expired') return { label: 'Expired', tone: 'muted' };
  if (inviteStatus(row) === 'revoked') return { label: 'Revoked', tone: 'muted' };
  if (isReady(row)) return { label: 'Ready to invite', tone: 'ready' };
  return { label: 'Waiting', tone: 'muted' };
}
function verificationLabel(row) { return !row.accountLinked ? 'Account not linked' : row.emailVerified ? 'Verified' : 'Needs verification'; }
function deliveryLabel(value) { return ({ sent: 'Sent to email provider', failed: 'Email send failed', pending: 'Send pending', queued: 'Email queued' })[value] || 'Delivery not confirmed'; }
function Icon({ name, ...props }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.2 7a7 7 0 0 1 11.6-1L20 9M4 15l2.2 3A7 7 0 0 0 17.8 17" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState([]);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [queueFresh, setQueueFresh] = useState(false);
  const [updated, setUpdated] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [revokeReview, setRevokeReview] = useState(null);
  const pending = useRef(false);
  const request = useRef(0);
  const loaded = useRef(false);
  const reviewHeading = useRef(null);

  const load = useCallback(async () => {
    const id = ++request.current;
    setRefreshing(true); setQueueFresh(false); setError(''); setReview(false); setRevokeReview(null);
    if (!loaded.current) setPhase('loading');
    try {
      const access = await accountAccess();
      if (id !== request.current) return;
      if (!access.capabilities?.isAdmin) { setRows([]); setSelected([]); setPhase('forbidden'); return; }
      const result = await adminWaitlist();
      if (id !== request.current) return;
      const next = result.waitlist || [];
      setRows(next);
      setSelected((current) => current.filter((selectedId) => next.some((row) => row.id === selectedId && canSelect(row))));
      setPhase('ready'); setQueueFresh(true); setUpdated(new Date()); loaded.current = true;
    } catch (err) {
      if (id !== request.current) return;
      if (err?.status === 401) { setRows([]); setSelected([]); setPhase('loading'); router.replace('/login?next=/admin/waitlist'); return; }
      if (err?.status === 403) { setRows([]); setSelected([]); setPhase('forbidden'); return; }
      if (!loaded.current) setPhase('error');
      setError(errorMessage(err));
    } finally { if (id === request.current) setRefreshing(false); }
  }, [router]);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);
  useEffect(() => { if (review) reviewHeading.current?.focus(); }, [review]);

  async function inviteSelected() {
    if (pending.current || refreshing || !queueFresh || !review || !selected.length) return;
    const recipients = rows.filter((row) => selected.includes(row.id) && canSelect(row));
    if (!recipients.length) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    let sent = 0; const failures = [];
    try {
      for (let index = 0; index < recipients.length; index += 1) {
        const row = recipients[index];
        try {
          const result = await adminInvite(row.id);
          if (result.emailed) sent += 1; else failures.push(row.id);
        } catch (err) {
          failures.push(row.id);
          if (err?.status === 401 || err?.status === 403) {
            failures.push(...recipients.slice(index + 1).map((recipient) => recipient.id));
            break;
          }
        }
      }
      setSelected(failures); setReview(false);
      setMessage(`${sent} invitation email${sent === 1 ? '' : 's'} sent.${failures.length ? ` ${failures.length} need attention. Refresh and check their delivery status before reissuing.` : ''}`);
      await load();
    } finally { pending.current = false; setBusy(false); }
  }
  async function revoke(id) {
    if (pending.current || refreshing || !queueFresh || revokeReview !== id) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    try { await adminRevoke(id); setMessage('Invitation revoked. The account and waitlist history are preserved.'); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }
  function toggleSelection(row, checked) {
    if (pending.current || refreshing || !queueFresh) return;
    setReview(false); setRevokeReview(null);
    setSelected((value) => checked ? [...new Set([...value, row.id])] : value.filter((id) => id !== row.id));
  }

  const counts = {
    all: rows.length,
    eligible: rows.filter(isReady).length,
    invited: rows.filter((row) => !row.admitted && inviteStatus(row) === 'pending').length,
    admitted: rows.filter((row) => row.admitted || inviteStatus(row) === 'accepted').length,
  };
  const visible = rows.filter((row) => {
    const matchesFilter = filter === 'all' || (filter === 'eligible' ? isReady(row) : filter === 'invited' ? !row.admitted && inviteStatus(row) === 'pending' : row.admitted || inviteStatus(row) === 'accepted');
    return matchesFilter && `${row.email} ${row.firm || ''} ${row.role || ''}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const recipients = rows.filter((row) => selected.includes(row.id));
  const reissueCount = recipients.filter((row) => row.invitation).length;
  const locked = busy || refreshing;
  const actionLocked = locked || !queueFresh;

  return <Shell authed><main className="wa-main">
    <header className="wa-heading"><div><p className="eyebrow">Staff workspace</p><h1>Waitlist</h1><p className="wa-lede">Meet the people waiting for Merger. Invite them when you’re ready.</p></div>{phase === 'ready' && <button type="button" className="btn btn-ghost wa-refresh" disabled={locked} onClick={load}><Icon name="refresh" className={refreshing ? 'wa-spinning' : undefined} />{refreshing ? 'Refreshing…' : 'Refresh'}</button>}</header>
    {phase === 'loading' && <section className="wa-empty wa-loading" role="status"><span className="wa-loader" /><h2>Loading waitlist…</h2><p>Getting the latest signups and invitation status.</p></section>}
    {phase === 'forbidden' && <section className="wa-empty"><Icon name="people" /><h2>Staff access required</h2><p>This account does not have permission to manage invitations. Sign in with a verified staff account to continue.</p><Link className="btn btn-ghost" href="/dashboard">Your account</Link></section>}
    {error && <div className="wa-notice wa-notice-error" role="alert"><p>{error}{phase === 'ready' && ' The list below may be out of date.'}</p><button type="button" className="btn btn-ghost" disabled={locked} onClick={load}>Try again</button></div>}
    {message && <div className="wa-notice" role="status"><Icon name="check" /><div><p>{message}</p>{message.includes('email') && <small>“Sent” means accepted by the email provider. Confirm arrival in the recipient’s inbox.</small>}</div><button type="button" className="wa-icon-button" aria-label="Dismiss update" onClick={() => setMessage('')}><Icon name="close" /></button></div>}

    {phase === 'ready' && <>
      <section className="wa-stats" aria-label="Waitlist views">{[
        ['all', 'All signups', 'Everyone on the waitlist'],
        ['eligible', 'Ready to invite', 'Verified, without an active invite'],
        ['invited', 'Invited', 'Waiting to accept'],
        ['admitted', 'Admitted', 'Invitation accepted or access granted'],
      ].map(([value, label, description]) => <button key={value} type="button" className={`wa-stat${filter === value ? ' is-active' : ''}`} aria-label={label} aria-pressed={filter === value} onClick={() => setFilter(value)}><span className="wa-stat-label">{label}</span><strong>{counts[value]}</strong><span className="wa-stat-description">{description}</span></button>)}</section>

      <section className="wa-queue" aria-label="Waitlist signups">
        <div className="wa-toolbar"><div className="wa-search"><Icon name="search" /><label className="wa-sr-only" htmlFor="queue-search">Find email, firm, or role</label><input id="queue-search" type="search" placeholder="Search email, firm, or role…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><p>{visible.length} {visible.length === 1 ? 'person' : 'people'} shown <span>· {rows.length} total</span></p></div>
        <div className="wa-selection" aria-live="polite"><div><strong>{selected.length ? `${selected.length} selected` : 'Choose your next invitations'}</strong><p>{selected.length ? 'Selections stay with you when you change views.' : 'Select verified accounts, then review before sending.'}</p></div>{selected.length > 0 && <div className="wa-actions"><button type="button" className="wa-text-button" disabled={locked} onClick={() => { setSelected([]); setReview(false); }}>Clear selection</button><button type="button" className="btn btn-primary" disabled={actionLocked || review} onClick={() => { setReview(true); setRevokeReview(null); }}>Review invitations</button></div>}</div>

        {review && <section className="wa-review" aria-labelledby="batch-review-title"><div className="wa-review-heading"><div><p className="wa-kicker">Invitation review</p><h2 id="batch-review-title" ref={reviewHeading} tabIndex={-1}>Review this invitation batch</h2></div><span className="wa-badge gold">{recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'}</span></div><p>An access invitation will be emailed to each person below. Invitations do not start subscriptions or a trial.</p><ul>{recipients.map((row) => <li key={row.id}><span>{row.email}</span>{row.invitation && <span className="wa-badge muted">Reissue</span>}</li>)}</ul>{reissueCount > 0 && <p className="wa-review-warning">Reissuing {reissueCount === 1 ? 'this invitation invalidates its' : `these ${reissueCount} invitations invalidates their`} previous {reissueCount === 1 ? 'link' : 'links'}, even if the new email cannot be delivered.</p>}<div className="wa-actions"><button type="button" className="btn btn-primary" disabled={actionLocked} onClick={inviteSelected}>{busy ? 'Sending invitations…' : `Send ${recipients.length} invitation${recipients.length === 1 ? '' : 's'}`}</button><button type="button" className="btn btn-ghost" disabled={locked} onClick={() => setReview(false)}>Back to selection</button></div></section>}

        {visible.length === 0 ? <div className="wa-empty wa-table-empty"><Icon name="people" /><h2>{rows.length ? 'No signups match this view.' : 'Your waitlist starts here.'}</h2><p>{rows.length ? 'Try another search or view to find the people you’re looking for.' : 'New signups appear here after they verify their email and join the waitlist.'}</p>{rows.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => { setQuery(''); setFilter('all'); }}>Show all signups</button>}</div> : <div className="wa-table-wrap"><table className="wa-table"><caption className="wa-sr-only">Waitlist signups and invitation eligibility</caption><thead><tr><th scope="col" className="wa-check-column"><span className="wa-sr-only">Select</span></th><th scope="col">Person</th><th scope="col">Account</th><th scope="col">Access</th><th scope="col">Joined</th><th scope="col" className="wa-referrals">Referrals</th><th scope="col"><span className="wa-sr-only">Details</span></th></tr></thead><tbody>{visible.map((row) => <WaitlistRow key={row.id} row={row} status={rowStatus(row)} selectable={canSelect(row)} selected={selected.includes(row.id)} locked={actionLocked} expanded={expanded === row.id} confirmingRevoke={revokeReview === row.id} onSelect={(checked) => toggleSelection(row, checked)} onExpand={() => { setExpanded(expanded === row.id ? null : row.id); setRevokeReview(null); }} onReviewRevoke={() => { setRevokeReview(row.id); setReview(false); }} onCancelRevoke={() => setRevokeReview(null)} onRevoke={() => revoke(row.id)} />)}</tbody></table></div>}
        <footer className="wa-table-footer"><span>{refreshing ? 'Updating the list…' : updated ? `Updated ${updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}</span><span>New accounts appear here after email verification.</span></footer>
      </section>

      <details className="wa-guide"><summary><span><span className="wa-guide-label">Before your first batch</span><strong>Test the rollout</strong></span><Icon name="chevron" /></summary><div className="wa-guide-body"><p>Rehearse on the isolated preview with separate test accounts. Preview emails are captured in the test inbox instead of being sent to real recipients. Keep your staff session in this browser and use a private window for the test account.</p><a className="btn btn-ghost wa-test-link" href="https://merger-orbit-preview.vercel.app/signup" target="_blank" rel="noopener noreferrer">Open test signup</a><ol><li><strong>Join as a new user.</strong><span>Open the test signup in a private window, create an account, and use its captured verification email.</span></li><li><strong>Check the test waitlist.</strong><span>Open the preview’s admin dashboard, refresh, and search the exact test email. It should show a verified account, ready to invite.</span></li><li><strong>Send one test invitation.</strong><span>Select only your test account, review the recipient, and send. Find the invitation in the test inbox.</span></li><li><strong>Accept the invitation.</strong><span>Open the captured invitation in the private window and accept while signed in as the test user. Refresh the test dashboard to confirm they are admitted.</span></li></ol><p className="wa-guide-note">Production and preview have separate accounts and signups. On the live site, invitation emails go to real recipients. Joining, sending an invitation, and accepting it do not start a trial or charge a card.</p></div></details>
    </>}
  </main></Shell>;
}

function WaitlistRow({ row, status, selectable, selected, locked, expanded, confirmingRevoke, onSelect, onExpand, onReviewRevoke, onCancelRevoke, onRevoke }) {
  const detailsId = `waitlist-details-${row.id}`;
  return <><tr className={`${selected ? 'is-selected ' : ''}${expanded ? 'is-expanded' : ''}`}>
    <td className="wa-check-column"><input type="checkbox" checked={selected} disabled={locked || !selectable} aria-label={row.invitation ? `Select to reissue invitation for ${row.email}` : `Select for invitation for ${row.email}`} title={!selectable ? (row.admitted ? 'Already admitted' : 'A verified, linked account is required') : undefined} onChange={(event) => onSelect(event.target.checked)} /></td>
    <td data-label="Person" className="wa-person"><button type="button" className="wa-person-button" aria-expanded={expanded} aria-controls={detailsId} onClick={onExpand}>{row.email}</button><span>{[row.firm, row.role].filter(Boolean).join(' · ') || 'No work details supplied'}</span></td>
    <td data-label="Account"><span className={`wa-verification${row.accountLinked && row.emailVerified ? ' is-verified' : ''}`}>{row.accountLinked && row.emailVerified && <Icon name="check" />}{verificationLabel(row)}</span></td>
    <td data-label="Access"><span className={`wa-badge ${status.tone}`}>{status.label}</span>{row.invitation?.deliveryStatus === 'failed' && <span className="wa-delivery-failed">Email send failed</span>}</td>
    <td data-label="Joined" className="wa-date">{formatDate(row.createdAt) || '—'}</td><td data-label="Referrals" className="wa-referrals">{row.referralCount || 0}</td>
    <td className="wa-details-toggle"><button type="button" className="wa-icon-button" aria-label={`${expanded ? 'Hide' : 'View'} details for ${row.email}`} aria-expanded={expanded} aria-controls={detailsId} onClick={onExpand}><Icon name="chevron" /></button></td>
  </tr>{expanded && <tr className="wa-detail-row"><td colSpan={7}><div id={detailsId} className="wa-detail"><dl><div><dt>Email verification</dt><dd>{verificationLabel(row)}</dd></div><div><dt>Queue position</dt><dd>{row.position ? `#${row.position}` : 'Not available'}</dd></div><div><dt>Last invitation</dt><dd>{row.invitedAt ? formatDate(row.invitedAt) : 'Not sent yet'}</dd></div><div><dt>Invitation expires</dt><dd>{formatDate(row.invitation?.expiresAt) || '—'}</dd></div>{row.invitation && <><div><dt>Email delivery</dt><dd>{deliveryLabel(row.invitation.deliveryStatus)}</dd></div><div><dt>Cohort</dt><dd>{row.invitation.cohort || '—'}</dd></div></>}</dl>{row.invitation?.deliveryStatus === 'sent' && <p className="wa-detail-note">The provider accepted this email. Inbox delivery has not been confirmed.</p>}{!selectable && !row.admitted && inviteStatus(row) !== 'accepted' && <p className="wa-detail-note">This person needs a linked account with a verified email before they can be invited.</p>}{selectable && inviteStatus(row) === 'pending' && <div className="wa-revoke">{confirmingRevoke ? <><div><h3>Revoke this invitation?</h3><p>The invitation for <strong>{row.email}</strong> will stop working. Their account and waitlist history will stay.</p></div><div className="wa-actions"><button type="button" className="btn wa-danger-button" disabled={locked} onClick={onRevoke}>Confirm revoke</button><button type="button" className="btn btn-ghost" disabled={locked} onClick={onCancelRevoke}>Keep invitation</button></div></> : <><p>Need to pause access for this person? You can revoke the current invitation.</p><button type="button" className="wa-text-button" disabled={locked} onClick={onReviewRevoke}>Revoke invitation</button></>}</div>}</div></td></tr>}</>;
}
