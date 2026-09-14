'use client';

// The reset email links here: https://usemerger.com/reset-password?token=…
// The token is single-use and short-lived, so most failures at this point are an
// expired or already-spent link rather than a malformed one.

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import PasswordField from '../components/PasswordField';
import { errorMessage, resetPassword } from '../lib/api';
import { MIN_PASSWORD_LENGTH } from '../lib/authFlow';

const MIN_LENGTH = MIN_PASSWORD_LENGTH;

function ResetForm() {
  const params = useSearchParams();
  const token = (params.get('token') || '').trim();
  // A different link must not inherit the previous token's form or result.
  return <ResetTokenForm key={token} token={token} />;
}

function ResetTokenForm({ token }) {

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const pending = useRef(false);
  const successHeading = useRef(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (done) successHeading.current?.focus(); }, [done]);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = !busy && password.length >= MIN_LENGTH && confirm === password;

  async function onSubmit(e) {
    e.preventDefault();
    if (pending.current) return;
    if (!canSubmit) { setError('Use at least 8 characters and enter the same password in both fields.'); return; }
    pending.current = true;
    setError('');
    setBusy(true);
    try {
      await resetPassword(token, password);
      if (!mounted.current) return;
      setPassword('');
      setConfirm('');
      setDone(true);
    } catch (err) {
      if (!mounted.current) return;
      setError(errorMessage(err));
      setInvalidToken(err?.code === 'invalid_token');
      setBusy(false);
      pending.current = false;
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
          <h1 ref={successHeading} tabIndex={-1}>Your password is set.</h1>

          <div className="panel mt-24">
            <p className="muted">
              Sign in with your new password. Your previous sessions have been signed out.
            </p>
            <Link className="btn btn-primary btn-block" href="/login" replace>
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

        <form className="panel mt-24" onSubmit={onSubmit} noValidate aria-busy={busy}>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_LENGTH} characters`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy || invalidToken}
            minLength={MIN_LENGTH}
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
            disabled={busy || invalidToken}
            minLength={MIN_LENGTH}
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
            <div className="alert alert-error" role="alert">
              {error} {invalidToken && <Link href="/forgot-password">Request a new link</Link>}
            </div>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={busy || invalidToken}>
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
