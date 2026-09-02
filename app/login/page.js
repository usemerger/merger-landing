'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import { errorMessage, login } from '../lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Where to land after a successful sign-in (set by the auth gate on /dashboard
  // and /download). Only relative paths are honoured — never an absolute URL.
  const rawNext = params.get('next') || '/dashboard';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-card narrow">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to Merger.</h1>

        <form className="panel mt-24" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy || !email.trim() || !password}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="form-foot">
          No account yet? <Link href="/signup">Start your trial</Link>
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
