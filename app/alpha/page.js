'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '../components/Shell';
function LegacyAlpha() {
  const router = useRouter(); const params = useSearchParams();
  const token = params.get('token');
  useEffect(() => {
    // Legacy public referral codes never authorize checkout or become invite tokens.
    router.replace(token ? `/invite?token=${encodeURIComponent(token)}` : '/invite');
  }, [router, token]);
  return <p role="status" className="spinner-note">Opening your invitation…</p>;
}
export default function AlphaPage() { return <Shell><main className="auth-main"><Suspense fallback={<p role="status">Loading…</p>}><LegacyAlpha /></Suspense></main></Shell>; }
