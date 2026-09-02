'use client';

import { useState } from 'react';
import Link from 'next/link';
import Shell from '../components/Shell';
import { errorMessage, forgotPassword } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      // Deliberately not branching on the response: the backend returns the same
      // {ok:true} for registered and unregistered addresses, and the UI must not
      // give away which is which.
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Shell>
        <main className="auth-main">
          <div className="auth-card narrow">
            <p className="eyebrow">Check your inbox</p>
            <h1>Reset link sent.</h1>

            <div className="panel mt-24">
              <p className="muted">
                If an account exists for <strong>{email.trim()}</strong>, we have sent it a link to
                reset the password. The link is single-use and expires shortly.
              </p>
              <p className="muted mt-16">
                Nothing arrived? Check your spam folder, or{' '}
                <button
                  type="button"
                  className="linklike"
                  style={{ textDecoration: 'underline' }}
                  onClick={() => {
                    setSent(false);
                    setError('');
                  }}
                >
                  try another address
                </button>
                .
              </p>
              <Link className="btn btn-ghost btn-block" href="/login">
                Back to sign in
              </Link>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="auth-main">
        <div className="auth-card narrow">
          <p className="eyebrow">Password reset</p>
          <h1>Forgot your password?</h1>
          <p className="lede">
            Enter the email on your account and we will send you a link to set a new password.
          </p>

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

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn btn-primary btn-block"
              type="submit"
              disabled={busy || !email.trim()}
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="form-foot">
            Remembered it? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </Shell>
  );
}
