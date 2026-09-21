'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import VerificationPanel from '../components/VerificationPanel';
import { acceptInvitation, accountAccess, errorMessage, formatDate } from '../lib/api';

function Invitation() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const legacy = Boolean(params.get('code') || params.get('invite'));
  const next = token ? `/invite?token=${encodeURIComponent(token)}` : '/invite';
  const [state, setState] = useState('loading');
  const [access, setAccess] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const request = useRef(0);
  const load = useCallback(async () => {
    const id = ++request.current; setState('loading'); setError('');
    try { const result = await accountAccess(); if (id === request.current) { setAccess(result); setState('ready'); } }
    catch (err) { if (id === request.current) { setState(err?.status === 401 ? 'signedOut' : 'error'); setError(err?.status === 401 ? '' : errorMessage(err)); } }
  }, []);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);
  async function accept() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { setAccess(await acceptInvitation(token || undefined)); }
    catch (err) { if (err?.status === 401) setState('signedOut'); setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }
  const accepted = ['accepted', 'member'].includes(access?.admission?.status);
  const canAccept = access?.user?.emailVerified && !accepted && (token || access?.admission?.status === 'invited');
  return <Shell authed={state === 'ready'}><main className="auth-main"><div className="auth-card">
    <p className="eyebrow">Merger early access</p><h1>{accepted ? 'Your invitation is accepted.' : 'A place for your next deal.'}</h1>
    {state === 'loading' && <p className="spinner-note" role="status">Checking your invitation…</p>}
    {state === 'signedOut' && <><p className="lede">Sign in with the email that received your invitation. We’ll check your access securely before you activate.</p><div className="dl-row"><Link className="btn btn-primary" href={`/login?next=${encodeURIComponent(next)}`}>Sign in to continue</Link><Link className="btn btn-ghost" href={`/signup?next=${encodeURIComponent(next)}`}>Create account</Link></div></>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {state === 'error' && <button className="btn btn-ghost" type="button" onClick={load}>Try again</button>}
    {state === 'ready' && <>
      <p className="field-hint mt-16">Signed in as {access.user.email}</p>
      {!access.user.emailVerified ? <VerificationPanel email={access.user.email} onCheck={load} /> : accepted ? <div className="panel mt-24"><h2>Ready when you are.</h2><p className="muted mt-16">{access.capabilities.canUseApp ? 'Your membership includes Merger access.' : 'Accepting an invitation does not start your trial or charge you. Review the terms in your account before completing secure checkout.'}</p><div className="dl-row"><Link className="btn btn-primary" href={access.capabilities.canDownload ? '/download' : '/dashboard'}>{access.capabilities.canDownload ? 'Go to downloads' : 'Continue to activation'}</Link></div></div> : canAccept ? <div className="panel mt-24"><h2>Make it your workspace.</h2><p className="muted mt-16">Accept your invitation, then choose whether to activate the Windows alpha. Your first 14 days are free after checkout, then $50/month. A card is required at checkout.</p>{access.admission.inviteExpiresAt && <p className="field-hint mt-16">Invitation expires {formatDate(access.admission.inviteExpiresAt)}.</p>}<div className="dl-row"><button className="btn btn-primary" type="button" disabled={busy} onClick={accept}>{busy ? 'Accepting…' : 'Accept invitation'}</button></div><p className="field-hint mt-16">No payment is taken by accepting this invitation.</p></div> : <div className="panel mt-24"><h2>Access opens in small groups.</h2><p className="muted mt-16">{legacy ? 'This older link cannot activate your account. Any current invitation will appear in your account after email verification.' : 'There is no active invitation for this account yet. Your account shows your current waitlist status.'}</p><div className="dl-row"><Link className="btn btn-primary" href="/dashboard">View your account</Link></div></div>}
      <p className="form-foot">Need help with an expired or different-account invitation? <Link href="/support">Contact support</Link>.</p>
    </>}
  </div></main></Shell>;
}
export default function InvitePage() { return <Suspense fallback={<Shell><main className="auth-main"><p role="status">Loading…</p></main></Shell>}><Invitation /></Suspense>; }
