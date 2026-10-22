'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SingularityButton from './SingularityButton';
import PlatformIcon from './PlatformIcon';
import { captureRef } from '../lib/waitlist';
import './waitlist.css';

// The front door: one Download action. New visitors create an account (or
// sign in), start the free trial from their account, then download for the
// platform they want. Referral codes ride along to sign-up as before.
export default function DownloadCTA() {
  const [ref, setRef] = useState(null);
  useEffect(() => { setRef(captureRef()); }, []);
  return <div className="wl-slot dl-cta">
    <SingularityButton className="wl-submit" href={'/signup' + (ref ? `?ref=${encodeURIComponent(ref)}` : '')}>Download Merger</SingularityButton>
    <p className="dl-cta-platforms" aria-label="Available for Windows and iPhone"><span><PlatformIcon platform="windows" size={15} />Windows</span><span><PlatformIcon platform="apple" size={15} />iPhone</span></p>
    <p className="wl-terms">Create a free account, then start your 14-day trial. $0 today; a card starts the trial and you can cancel before it ends without being charged.</p>
    <p className="wl-terms">Already have an account? <Link href="/login?next=%2Fdashboard">Sign in</Link>.</p>
  </div>;
}
