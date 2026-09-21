'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SingularityButton from './SingularityButton';
import './waitlist.css';
import { captureRef } from '../lib/waitlist';
import { validEmail } from '../lib/authFlow';
import { WAITLIST } from '../lib/billingOffer';

export default function WaitlistForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [referral, setReferral] = useState(null);
  useEffect(() => { setReferral(captureRef()); }, []);
  function continueToAccount(event) {
    event.preventDefault();
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    // Draft contains no credentials; it only saves typing across this navigation.
    try { sessionStorage.setItem('merger_waitlist_draft', JSON.stringify({ email: email.trim(), at: Date.now() })); } catch { /* Account creation works without storage. */ }
    router.push(`/signup${referral ? `?ref=${encodeURIComponent(referral)}` : ''}`);
  }
  return <div className="wl-slot"><form className="wl-form" onSubmit={continueToAccount} noValidate>
    <div className="wl-field wl-field-email"><label htmlFor="wl-email">Email</label><input id="wl-email" name="email" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@firm.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
    {error && <p className="wl-error" role="alert">{error}</p>}
    <SingularityButton className="wl-submit" type="submit">{WAITLIST.cta}</SingularityButton>
    <p className="wl-terms">Free to join. No card required. Your trial starts only after an invitation and activation.</p>
    <p className="wl-terms">Already have an account? <Link href="/login">Sign in</Link>. Already on the list? Use the same email to keep your place.</p>
  </form></div>;
}
