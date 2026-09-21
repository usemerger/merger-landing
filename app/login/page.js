'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import { errorMessage, login, meOrNull } from '../lib/api';
import { normalizeEmail, safeReturnPath, validEmail } from '../lib/authFlow';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Where to land after a successful sign-in (set by the auth gate on /dashboard
  // and /download). Only relative paths are honoured — never an absolute URL.
  const next = safeReturnPath(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    let current = true;
    meOrNull().then((account) => { if (current && account) router.replace(next); }).catch(() => {});
    return () => { current = false; };
  }, [next, router]);

  async function onSubmit(e) {
    e.preventDefault();
    if (pending.current) return;
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    pending.current = true;
    setError('');
    setBusy(true);
    try {
      await login(normalizeEmail(email), password);
      setPassword('');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
      pending.current = false;
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-card narrow">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to Merger.</h1>
        <p className="lede">Your waitlist, membership, and desktop app. One account.</p>
        {params.get('signedOut') === '1' && <p className="alert alert-info" role="status">You’re signed out.</p>}

        <form className="panel mt-24" onSubmit={onSubmit} noValidate aria-busy={busy}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="form-foot">
          No account yet? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
        </p>
        <p className="form-foot" style={{ marginTop: 10 }}>
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <main className="auth-main">
            <div className="auth-card narrow">
              <p className="spinner-note">Loading…</p>
            </div>
          </main>
        }
      >
        <LoginForm />
      </Suspense>
    </Shell>
  );
}
