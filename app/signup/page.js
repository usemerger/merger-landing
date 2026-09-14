'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import HandleField from '../components/HandleField';
import PlanStep, { useStartCheckout } from '../components/PlanStep';
import { errorMessage, meOrNull, signup } from '../lib/api';
import { MIN_PASSWORD_LENGTH, normalizeEmail, validEmail, validHandle } from '../lib/authFlow';
import useHandleClaim from '../lib/useHandleClaim';
import { ALPHA_OFFER } from '../lib/billingOffer';

function SignupForm() {
  const router = useRouter();
  const [session, setSession] = useState('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');
  const pending = useRef(false);
  const sessionRequest = useRef(0);
  const handleCtl = useHandleClaim();
  const checkoutCtl = useStartCheckout();

  const checkSession = useCallback(async () => {
    const request = ++sessionRequest.current;
    setSession('loading');
    setError('');
    try {
      const user = await meOrNull();
      if (request !== sessionRequest.current) return;
      if (user) { router.replace('/dashboard'); return; }
      setSession('ready');
    } catch (err) {
      if (request !== sessionRequest.current) return;
      setError(errorMessage(err));
      setSession('error');
    }
  }, [router]);

  useEffect(() => { checkSession(); return () => { sessionRequest.current += 1; }; }, [checkSession]);

  async function onSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    if (!account && !validEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!account && password.length < MIN_PASSWORD_LENGTH) { setError('Use at least 8 characters for your password.'); return; }
    if (!validHandle(handleCtl.handle)) { setError('Choose a handle with 3–30 letters, numbers or underscores.'); return; }
    pending.current = true;
    setBusy(true);
    setError('');
    let currentAccount = account;
    try {
      if (!currentAccount) {
        setBusyLabel('Creating your account…');
        const address = normalizeEmail(email);
        try {
          await signup(address, password, null);
          currentAccount = { email: address };
        } catch (err) {
          // Resume only the exact account submitted here after a lost response.
          if (!err?.status || err.status >= 500) {
            try {
              const recovered = await meOrNull();
              if (recovered?.email?.toLowerCase() === address.toLowerCase()) currentAccount = recovered;
            } catch { /* Preserve the original signup error. */ }
          }
          if (!currentAccount) throw err;
        }
        setAccount(currentAccount);
        setPassword('');
      }
      if (!currentAccount.handle) {
        setBusyLabel('Reserving your handle…');
        const handle = await handleCtl.claim();
        setAccount({ ...currentAccount, handle });
      }
    } catch (err) {
      if (err?.status === 401) { router.replace('/login?next=/dashboard'); return; }
      setError(errorMessage(err));
    } finally {
      pending.current = false;
      setBusy(false);
      setBusyLabel('');
    }
  }

  return <Shell authed={Boolean(account)}>
    <main className="auth-main">
      <div className="auth-card">
        {session === 'loading' ? <p className="spinner-note" role="status">Checking your account…</p> : session === 'error' ? <>
          <h1>Could not check your account.</h1>
          <div className="alert alert-error" role="alert">{error}</div>
          <button type="button" className="btn btn-ghost" onClick={checkSession}>Try again</button>
          <p className="form-foot"><Link href="/login">Sign in</Link></p>
        </> : account?.handle ? <>
          <p className="eyebrow">Account ready</p>
          <h1>Your desk starts here.</h1>
          <p className="lede">Signed in as {account.email} · @{account.handle}. Review the alpha offer below to subscribe.</p>
          <div className="panel mt-24"><PlanStep ctl={checkoutCtl} heading="Join the paid alpha" /></div>
          <p className="form-foot"><Link href="/dashboard">Continue to your account</Link></p>
        </> : <>
          <p className="eyebrow">Join Merger</p>
          <h1>{account ? 'Finish your account.' : 'Set up your deal desk.'}</h1>
          <p className="lede">{account ? `Your account for ${account.email} is ready. Reserve your handle to continue.` : 'Create your account and reserve your handle. You can review the paid alpha before subscribing.'}</p>
          {!account && <p className="field-hint mt-16">Windows alpha · {ALPHA_OFFER.priceLabel}{ALPHA_OFFER.intervalLabel}. Your account is free until you complete checkout.</p>}
          <form className="panel mt-24" onSubmit={onSubmit} aria-busy={busy} noValidate>
            {!account && <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
                  placeholder="you@firm.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
              </div>
              <PasswordField id="password" label="Password" autoComplete="new-password" placeholder="At least 8 characters"
                value={password} onChange={(event) => setPassword(event.target.value)} minLength={MIN_PASSWORD_LENGTH} disabled={busy}
                hint={password && password.length < MIN_PASSWORD_LENGTH ? 'Use at least 8 characters.' : ''}
                hintTone={password && password.length < MIN_PASSWORD_LENGTH ? 'bad' : undefined} />
            </>}
            <HandleField ctl={handleCtl} disabled={busy} />
            {error && <div className="alert alert-error" role="alert">{error}{account && <> Your account is saved. Retry here or <Link href="/dashboard">finish from your account</Link>.</>}</div>}
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? busyLabel || 'Working…' : account ? 'Reserve handle' : 'Create account'}
            </button>
            <p className="field-hint center mt-16">Creating an account does not start a subscription or charge your card.</p>
            <p className="field-hint center">By creating an account, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>.</p>
          </form>
          <p className="form-foot">Already have an account? <Link href="/login">Sign in</Link></p>
        </>}
      </div>
    </main>
  </Shell>;
}

export default function SignupPage() {
  return <Suspense fallback={<Shell><main className="auth-main"><p className="spinner-note" role="status">Loading…</p></main></Shell>}><SignupForm /></Suspense>;
}
