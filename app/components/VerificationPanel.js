'use client';

import { useRef, useState } from 'react';
import { errorMessage, resendVerification } from '../lib/api';

export default function VerificationPanel({ email, onCheck }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pending = useRef(false);
  async function resend() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    try { await resendVerification(); setMessage('Verification email sent. Check your inbox and spam folder.'); }
    catch (err) { setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="panel mt-24" aria-labelledby="verification-heading">
    <p className="eyebrow">One more step</p>
    <h2 id="verification-heading">Verify your email.</h2>
    <p className="muted mt-16">Open the verification link sent to <strong>{email}</strong>. This protects your account and connects any existing waitlist place to you.</p>
    <p className="field-hint mt-16">No card is required. Your trial has not started.</p>
    {error && <p className="alert alert-error" role="alert">{error}</p>}
    {message && <p className="alert alert-info" role="status">{message}</p>}
    <div className="dl-row">
      <button className="btn btn-primary btn-sm" type="button" onClick={onCheck}>I’ve verified my email</button>
      <button className="btn btn-ghost btn-sm" type="button" onClick={resend} disabled={busy}>{busy ? 'Sending…' : 'Resend verification email'}</button>
    </div>
  </section>;
}
