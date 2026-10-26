'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import AccountAuthLayout from '../components/AccountAuthLayout';
import GoogleAccountButton from '../components/GoogleAccountButton';
import PasswordField from '../components/PasswordField';
import { errorMessage, meOrNull, signup } from '../lib/api';
import { MIN_PASSWORD_LENGTH, normalizeEmail, safeReturnPath, validEmail } from '../lib/authFlow';
import { captureRef } from '../lib/waitlist';
import { WAITLIST } from '../lib/billingOffer';
import { loadPendingInvite } from '../lib/pendingInvite';

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeReturnPath(params.get('next'));
  const query = params.toString();
  const [session, setSession] = useState('loading');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [firm, setFirm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const sessionRequest = useRef(0);
  const referral = useRef(null);
  const [invited, setInvited] = useState(false);
  const checkSession = useCallback(async () => {
    const request = ++sessionRequest.current;
    setSession('loading'); setError('');
    try {
      const user = await meOrNull();
      if (request !== sessionRequest.current) return;
      if (user) { router.replace(next); return; }
      setSession('ready');
    } catch (err) {
      if (request !== sessionRequest.current) return;
      setError(errorMessage(err)); setSession('error');
    }
  }, [router, next]);
  useEffect(() => {
    referral.current = captureRef(query);
    try {
      const draft = JSON.parse(sessionStorage.getItem('merger_waitlist_draft') || 'null');
      if (draft && Date.now() - draft.at < 3600000) {
        setEmail(typeof draft.email === 'string' ? draft.email : '');
        setRole(WAITLIST.roles.includes(draft.role) ? draft.role : '');
        setFirm(typeof draft.firm === 'string' ? draft.firm : '');
      }
    } catch { /* Draft data is optional; the form remains usable. */ }
    // Arriving from an invitation: use the address it was sent to, since the
    // invitation only works for that email.
    const invite = loadPendingInvite();
    if (invite && next.startsWith('/invite')) {
      setInvited(true);
      if (invite.email) setEmail(invite.email);
    }
    checkSession();
    return () => { sessionRequest.current += 1; };
  }, [checkSession, query, next]);
  async function onSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < MIN_PASSWORD_LENGTH) { setError('Use at least 8 characters for your password.'); return; }
    pending.current = true; setBusy(true); setError('');
    try {
      const address = normalizeEmail(email);
      const waitlist = { ...(role ? { role } : {}), ...(firm.trim() ? { firm: firm.trim() } : {}), ...(referral.current ? { ref: referral.current } : {}) };
      try { await signup(address, password, name.trim(), waitlist); }
      catch (err) {
        // A lost response must not cause a second signup. Resume only this identity.
        let recovered;
        if (!err?.status || err.status >= 500) {
          try { recovered = await meOrNull(); } catch { /* Keep the original error. */ }
        }
        if (recovered?.email?.toLowerCase() !== address.toLowerCase()) throw err;
      }
      setPassword('');
      try { sessionStorage.removeItem('merger_waitlist_draft'); } catch { /* Optional draft. */ }
      router.replace(`/verify-email?next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch (err) { setError(errorMessage(err)); pending.current = false; setBusy(false); }
  }
  return <AccountAuthLayout><div className="auth-card">
    {session === 'loading' ? <p className="spinner-note" role="status">Checking your account…</p> : session === 'error' ? <>
      <h1>Could not check your account.</h1><div className="alert alert-error" role="alert">{error}</div>
      <button type="button" className="btn btn-ghost" onClick={checkSession}>Try again</button>
    </> : <>
      <p className="eyebrow">{invited ? 'You’re invited' : 'Download Merger'}</p><h1>Create your Merger account.</h1>
      <p className="lede">{invited ? 'Use the email your invitation was sent to. Verify it, accept your invitation, then review your plan before activation.' : 'One account for the website and the apps. After you verify your email, choose a plan and download Merger for Windows or iPhone.'}</p>
      <GoogleAccountButton mode="signup" next={next} referral={referral.current}/>
      <form className="panel mt-24" onSubmit={onSubmit} noValidate aria-busy={busy}>
        <div className="field"><label htmlFor="name">Name</label><input type="text" id="name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={busy} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@firm.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} /></div>
        <PasswordField id="password" label="Password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={MIN_PASSWORD_LENGTH} disabled={busy} />
        <details className="mt-16"><summary>Tell us about your work <span className="muted">(optional)</span></summary><div className="field mt-16"><label htmlFor="role">What you do</label><select id="role" value={role} onChange={(event) => setRole(event.target.value)} disabled={busy}><option value="">Select…</option>{WAITLIST.roles.map((value) => <option key={value}>{value}</option>)}</select></div><div className="field"><label htmlFor="firm">Firm</label><input type="text" id="firm" value={firm} autoComplete="organization" maxLength={200} onChange={(event) => setFirm(event.target.value)} disabled={busy} /></div></details>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-block mt-24" type="submit" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</button>
        <p className="field-hint center mt-16">{invited ? 'Creating an account is free. Nothing is charged until you choose a plan.' : 'Creating an account is free. Nothing is charged until you choose a plan.'}</p>
        <p className="field-hint center">By creating an account, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>. We’ll email you about verification and access.</p>
      </form>
      <p className="form-foot">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
      <p className="field-hint center">Joined the waitlist before? Use the same email to keep your account.</p>
    </>}
  </div></AccountAuthLayout>;
}
export default function SignupPage() { return <Suspense fallback={<Shell><main className="auth-main"><p className="spinner-note" role="status">Loading…</p></main></Shell>}><SignupForm /></Suspense>; }
