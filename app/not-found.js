import Link from 'next/link';
import Shell from './components/Shell';

export default function NotFound() {
  return <Shell><main className="legal-main"><p className="eyebrow">Page not found</p><h1>Let’s get you back to your desk.</h1><p>This page may have moved, or the link may be incomplete. Your account is still available.</p><div className="dl-row"><Link className="btn btn-primary" href="/dashboard">Your account</Link><Link className="btn" href="/">Merger home</Link><Link className="btn" href="/support">Get help</Link></div></main></Shell>;
}
