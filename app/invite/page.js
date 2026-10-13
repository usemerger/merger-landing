'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import VerificationPanel from '../components/VerificationPanel';
import { acceptInvitation, accountAccess, errorMessage, formatDate, invitationPreview } from '../lib/api';
import { clearPendingInvite, savePendingInvite } from '../lib/pendingInvite';

function Invitation() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const legacy = Boolean(params.get('code') || params.get('invite'));
  const next = token ? `/invite?token=${encodeURIComponent(token)}` : '/invite';
  const [state, setState] = useState('loading');
  const [access, setAccess] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const pending = useRef(false);
  const request = useRef(0);
  const autoAccepted = useRef(false);
  // Remember the invitation so sign-up can pre-fill the address and email
  // verification can bring the person straight back here.
  useEffect(() => {
    if (!token) return undefined;
    let live = true;
    savePendingInvite(token);
    invitationPreview(token).then((preview) => {
      if (!live || !preview?.email) return;
      setInvitedEmail(preview.email); savePendingInvite(token, preview.email);
    }).catch(() => { /* Expired or unknown tokens are explained after sign-in. */ });
    return () => { live = false; };
  }, [token]);
  const load = useCallback(async () => {
    const id = ++request.current; setState('loading'); setError('');
    try { const result = await accountAccess(); if (id === request.current) { setAccess(result); setState('ready'); } }
    catch (err) { if (id === request.current) { setState(err?.status === 401 ? 'signedOut' : 'error'); setError(err?.status === 401 ? '' : errorMessage(err)); } }
  }, []);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);
  const accept = useCallback(async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { setAccess(await acceptInvitation(token || undefined)); clearPendingInvite(); }
    catch (err) { if (err?.status === 401) setState('signedOut'); setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }, [token]);
  const accepted = ['accepted', 'member'].includes(access?.admission?.status);
  const canAccept = access?.user?.emailVerified && !accepted && (token || access?.admission?.status === 'invited');
  const wrongAccount = Boolean(invitedEmail && access?.user?.email && invitedEmail.toLowerCase() !== access.user.email.toLowerCase());
  // A verified member arriving from their own invite link is accepted straight
  // away: accepting takes no payment, so there is nothing to confirm.
  useEffect(() => {
    if (state === 'ready' && token && canAccept && !wrongAccount && !autoAccepted.current) { autoAccepted.current = true; accept(); }
  }, [state, token, canAccept, wrongAccount, accept]);
  const paid = access?.capabilities?.canUseApp;
  const trialCopy = access?.rollout?.trialEligible === false ? 'Choose your plan' : 'Start your 14-day free trial';
  return <Shell authed={state === 'ready'}><main className="auth-main"><div className="auth-card">
    <p className="eyebrow">Merger early access</p><h1>{accepted ? 'Your invitation is accepted.' : 'A place for your next deal.'}</h1>
    {state === 'loading' && <p className="spinner-note" role="status">Checking your invitation…</p>}
    {state === 'signedOut' && <><p className="lede">{invitedEmail ? <>This invitation is for <strong>{invitedEmail}</strong>. Create your account with that email and you’ll land straight back here, ready to start.</> : 'Create your account with the email that received your invitation, or sign in if you already have one.'}</p><div className="dl-row"><Link className="btn btn-primary" href={`/signup?next=${encodeURIComponent(next)}`}>Create your account</Link><Link className="btn btn-ghost" href={`/login?next=${encodeURIComponent(next)}`}>I already have an account</Link></div><p className="field-hint mt-16">Three steps: create your account, verify your email, start your 14-day free trial. $0 today.</p></>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {state === 'error' && <button className="btn btn-ghost" type="button" onClick={load}>Try again</button>}
    {state === 'ready' && <>
      <p className="field-hint mt-16">Signed in as {access.user.email}</p>
      {wrongAccount && !accepted && <div className="alert alert-warn mt-16" role="status">This invitation was sent to {invitedEmail}. Sign out and create an account with that email to use it.</div>}
      {!access.user.emailVerified ? <VerificationPanel email={access.user.email} onCheck={load} /> : accepted ? <div className="panel mt-24"><h2>{paid ? 'Ready when you are.' : 'One step left.'}</h2><p className="muted mt-16">{paid ? 'Your membership includes Merger access.' : access.rollout?.trialEligible === false ? 'Pick monthly or annual on the next page. Nothing is charged until you confirm checkout.' : 'Pick monthly or annual on the next page. Your first 14 days are free and $0 is charged today.'}</p><div className="dl-row"><Link className="btn btn-primary" href={paid ? (access.capabilities.canDownload ? '/download' : '/dashboard') : '/billing'}>{paid ? (access.capabilities.canDownload ? 'Go to downloads' : 'Go to your account') : trialCopy}</Link></div></div> : canAccept ? <div className="panel mt-24"><h2>Make it your workspace.</h2><p className="muted mt-16">Accept your invitation, then choose whether to activate the Windows alpha. {access.rollout?.trialEligible === true ? 'Your first 14 days are free after checkout, then $50/month. A card is required at checkout.' : access.rollout?.trialEligible === false ? 'As a returning member, $50 plus applicable tax is due at checkout, then $50/month. Another free trial does not apply.' : 'Your account will show the applicable membership terms before you can check out.'}</p>{access.admission.inviteExpiresAt && <p className="field-hint mt-16">Invitation expires {formatDate(access.admission.inviteExpiresAt)}.</p>}<div className="dl-row"><button className="btn btn-primary" type="button" disabled={busy || wrongAccount} onClick={accept}>{busy ? 'Accepting…' : 'Accept invitation'}</button></div><p className="field-hint mt-16">No payment is taken by accepting this invitation.</p></div> : <div className="panel mt-24"><h2>Access opens in small groups.</h2><p className="muted mt-16">{legacy ? 'This older link cannot activate your account. Any current invitation will appear in your account after email verification.' : 'There is no active invitation for this account yet. Your account shows your current waitlist status.'}</p><div className="dl-row"><Link className="btn btn-primary" href="/dashboard">View your account</Link></div></div>}
      <p className="form-foot">Need help with an expired or different-account invitation? <Link href="/support">Contact support</Link>.</p>
    </>}
  </div></main></Shell>;
}
export default function InvitePage() { return <Suspense fallback={<Shell><main className="auth-main"><p role="status">Loading…</p></main></Shell>}><Invitation /></Suspense>; }
