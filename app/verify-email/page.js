'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
import VerificationPanel from '../components/VerificationPanel';
import { accountAccess, errorMessage } from '../lib/api';
import { safeReturnPath } from '../lib/authFlow';

function Verification() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeReturnPath(params.get('next'));
  const [access, setAccess] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const current = useRef(0);
  const check = useCallback(async () => {
    const id = ++current.current; setLoading(true); setError('');
    try {
      const result = await accountAccess();
      if (id !== current.current) return;
      if (result.user.emailVerified) { router.replace(next); return; }
      setAccess(result);
    } catch (err) {
      if (id !== current.current) return;
      if (err?.status === 401) { router.replace(`/login?next=${encodeURIComponent(`/verify-email?next=${encodeURIComponent(next)}`)}`); return; }
      setError(errorMessage(err));
    } finally { if (id === current.current) setLoading(false); }
  }, [router, next]);
  useEffect(() => {
    check(); window.addEventListener('focus', check);
    return () => { current.current += 1; window.removeEventListener('focus', check); };
  }, [check]);
  return <Shell authed><main className="auth-main"><div className="auth-card">
    <p className="eyebrow">Your Merger account</p><h1>Check your inbox.</h1>
    {params.get('verify_error') && <p className="alert alert-warn">That verification link has expired or was already used. Check your status or request a fresh email below.</p>}
    {loading && <p role="status" className="spinner-note">Checking verification…</p>}
    {error && <><p className="alert alert-error" role="alert">{error}</p><button className="btn btn-ghost" type="button" onClick={check}>Try again</button></>}
    {access && <VerificationPanel email={access.user.email} onCheck={check} />}
    <p className="form-foot"><Link href="/dashboard">Go to your account</Link></p>
  </div></main></Shell>;
}
export default function VerifyEmailPage() { return <Suspense fallback={<Shell><main className="auth-main"><p role="status">Loading…</p></main></Shell>}><Verification /></Suspense>; }
