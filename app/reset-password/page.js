'use client';

// The reset email links here: https://usemerger.com/reset-password?token=…
// The token is single-use and short-lived, so most failures at this point are an
// expired or already-spent link rather than a malformed one.

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import { errorMessage, resetPassword } from '../lib/api';

const MIN_LENGTH = 8; // matches the backend's weak_password threshold

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params.get('token') || '').trim();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = !busy && password.length >= MIN_LENGTH && confirm === password;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      // Leave the success state up briefly so it is readable, then move on.
      setTimeout(() => router.push('/login'), 4000);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  /* ---- no token in the link at all ---- */
  if (!token) {
    return (
      <main className="auth-main">
        <div className="auth-card narrow">
          <p className="eyebrow">Password reset</p>
          <h1>This reset link is invalid.</h1>

          <div className="panel mt-24">
            <p className="muted">
              The link you followed is missing its reset token, so we cannot tell which account it
              belongs to. Request a fresh link and use the most recent email.
            </p>
            <Link className="btn btn-primary btn-block" href="/forgot-password">
              Request a new link
            </Link>
            <p className="form-foot">
              <Link href="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ---- done ---- */
  if (done) {
    return (
      <main className="auth-main">
        <div className="auth-card narrow">
          <p className="eyebrow">Password reset</p>
          <h1>Your password is set.</h1>

          <div className="panel mt-24">
            <p className="muted">
              You can now sign in with your new password. Taking you to the sign-in page…
            </p>
            <Link className="btn btn-primary btn-block" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ---- the form ---- */
  return (
    <main className="auth-main">
      <div className="auth-card narrow">
        <p className="eyebrow">Password reset</p>
        <h1>Choose a new password.</h1>

        <form className="panel mt-24" onSubmit={onSubmit} noValidate>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_LENGTH} characters`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={tooShort ? `Use at least ${MIN_LENGTH} characters.` : ''}
            hintTone={tooShort ? 'bad' : undefined}
          />

          <PasswordField
            id="confirm"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Type it again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            hint={
              mismatch
                ? 'Those passwords do not match.'
                : confirm && !mismatch
                  ? 'Passwords match.'
                  : ''
            }
            hintTone={mismatch ? 'bad' : confirm ? 'ok' : undefined}
          />

          {error && (
            <div className="alert alert-error">
              {error} <Link href="/forgot-password">Request a new one</Link>.
            </div>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={!canSubmit}>
            {busy ? 'Setting your password…' : 'Set new password'}
          </button>
        </form>

        <p className="form-foot">
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
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
        <ResetForm />
      </Suspense>
    </Shell>
  );
}
