'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { accountWaitlist, errorMessage, formatDate } from '../lib/api';
import { captureRef, referralLink } from '../lib/waitlist';

export default function AccountWaitlist({ access, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const pending = useRef(false);
  const row = access.waitlist;
  const status = access.admission?.status;
  const invited = status === 'invited';
  const accepted = ['accepted', 'member'].includes(status);
  const shareUrl = row?.referralCode ? referralLink(row.referralCode) : '';
  async function join() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { const ref = captureRef(); onChange(await accountWaitlist(ref ? { ref } : {})); }
    catch (err) { setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); }
    catch { setCopied(false); setError('Copy is unavailable here. Select and copy the link below.'); }
  }
  return <section className="panel mt-24" aria-labelledby="waitlist-heading">
    <div className="panel-head"><h2 id="waitlist-heading">{invited ? 'Your invitation is ready.' : accepted ? 'Your alpha access' : row ? 'You’re on the waitlist.' : 'Join the Merger waitlist.'}</h2><span className={`pill ${invited || accepted ? 'good' : 'neutral'}`}>{invited ? 'Invited' : accepted ? 'Admitted' : row ? 'Waiting' : 'Not joined'}</span></div>
    <p className="muted mt-16">{invited ? 'A place is ready for you. Accept your invitation to review your membership terms.' : accepted ? 'Your invitation has been accepted. You can finish activation whenever you are ready.' : row ? 'We’re opening Merger in small groups. We’ll email you when your invitation is ready, and it will appear here too.' : 'Request early access with your verified account. If you joined before, your matching email keeps its original place and referrals.'}</p>
    {invited && <><p className="field-hint mt-16">{access.admission.inviteExpiresAt ? `Invitation expires ${formatDate(access.admission.inviteExpiresAt)}.` : ''} No subscription has started.</p><div className="dl-row"><Link className="btn btn-primary" href="/invite">Review invitation</Link></div></>}
    {!row && !accepted && !invited && <div className="dl-row"><button type="button" className="btn btn-primary" onClick={join} disabled={busy}>{busy ? 'Joining…' : 'Join the waitlist'}</button></div>}
    {row && !accepted && <>
      <div className="stat-grid"><div className="stat"><div className="k">Current position</div><div className="v">{Number.isFinite(row.position) ? `#${row.position}` : 'Reserved'}</div></div><div className="stat"><div className="k">Referrals</div><div className="v">{row.referralCount ?? 0}</div></div><div className="stat"><div className="k">Joined</div><div className="v">{formatDate(row.joinedAt) || 'Saved'}</div></div></div>
      <p className="field-hint mt-16">Position reflects signup time and referrals. Invitations also depend on platform readiness and cohort size.</p>
    </>}
    {shareUrl && <div className="field mt-24"><label htmlFor="account-referral">Your referral link</label><input type="text" id="account-referral" value={shareUrl} readOnly onFocus={(event) => event.target.select()} /><div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy referral link'}</button></div><span className="field-hint" role="status">{copied ? 'Link copied.' : ''}</span></div>}
    {!accepted && <p className="field-hint mt-16">No card required while waiting. If eligible, your 14-day trial begins only after you accept an invitation and complete checkout.</p>}
    {error && <p className="alert alert-error" role="alert">{error}</p>}
  </section>;
}
