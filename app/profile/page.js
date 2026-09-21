'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '../components/Shell';
import { accountAccess, errorMessage, forgotPassword, logoutAll, updateProfile } from '../lib/api';
import { clearSessionHint } from '../lib/useSession';

export default function ProfilePage() {
  const router = useRouter();
  const [access, setAccess] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const request = useRef(0);
  const pending = useRef(false);
  const load = useCallback(async () => {
    const id = ++request.current; setError(''); setLoading(true);
    try { const result = await accountAccess(); if (id === request.current) { setAccess(result); setName(result.user.displayName || ''); } }
    catch (err) { if (id !== request.current) return; if (err?.status === 401) { router.replace('/login?next=/profile'); return; } setError(errorMessage(err)); }
    finally { if (id === request.current) setLoading(false); }
  }, [router]);
  useEffect(() => { load(); return () => { request.current += 1; }; }, [load]);
  async function run(action, work, success) {
    if (pending.current) return;
    pending.current = true; setBusy(action); setError(''); setMessage('');
    try { await work(); setMessage(success); }
    catch (err) { if (err?.status === 401) router.replace('/login?next=/profile'); else setError(errorMessage(err)); }
    finally { pending.current = false; setBusy(''); }
  }
  function save(event) {
    event.preventDefault();
    if (!name.trim()) { setError('Enter your name.'); return; }
    run('profile', () => updateProfile(name.trim()), 'Your profile has been saved.');
  }
  return <Shell authed><main className="dash-main">
    <p className="eyebrow">Profile & security</p><h1 className="dash-title">Make yourself at home.</h1>
    {loading && <p className="spinner-note" role="status">Loading your profile…</p>}
    {error && <p className="alert alert-error" role="alert">{error}</p>}
    {message && <p className="alert alert-info" role="status">{message}</p>}
    {!loading && !access && <button className="btn btn-ghost" type="button" onClick={load}>Try again</button>}
    {access && <>
      <form className="panel mt-24" onSubmit={save} aria-busy={busy === 'profile'}><h2>Your details</h2><div className="field mt-24"><label htmlFor="display-name">Name</label><input id="display-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={Boolean(busy)} /></div><div className="field"><label htmlFor="account-email">Email</label><input id="account-email" value={access.user.email} readOnly /><p className="field-hint">{access.user.emailVerified ? 'Verified' : 'Verification required'}. Contact support if you need to change your email.</p></div><button className="btn btn-primary btn-sm" type="submit" disabled={Boolean(busy)}>{busy === 'profile' ? 'Saving…' : 'Save profile'}</button></form>
      <section className="panel"><h2>Security</h2><p className="muted mt-16">Use a secure email link to choose a new password. If you’ve used a shared computer, sign out of all sessions, including this one.</p><div className="dl-row"><button className="btn btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => run('password', () => forgotPassword(access.user.email), 'If this account can receive email, a password reset link is on its way. Check your inbox.')}>{busy === 'password' ? 'Sending…' : 'Send password reset email'}</button><button className="btn btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => run('sessions', async () => { await logoutAll(); clearSessionHint(); router.replace('/login?signedOut=1'); router.refresh(); }, '')}>{busy === 'sessions' ? 'Signing out…' : 'Sign out of all sessions'}</button></div></section>
      <section className="panel"><h2>Need a hand?</h2><p className="muted mt-16">For account changes, data requests, or help getting started, contact the Merger team.</p><div className="dl-row"><Link className="btn btn-ghost btn-sm" href="/support">Get support</Link></div></section>
      {access.capabilities.isAdmin && <div className="dl-row"><Link className="btn btn-ghost btn-sm" href="/admin/waitlist">Manage rollout</Link></div>}
    </>}
  </main></Shell>;
}
