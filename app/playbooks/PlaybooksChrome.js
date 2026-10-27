import Link from 'next/link';
import MarketingNav from '../components/MarketingNav';
import MarketingMark from '../components/MarketingMark';
import SocialLinks from '../components/SocialLinks';
import { WAITLIST } from '../lib/billingOffer';

/** Nav and footer shared by the Playbooks hub and every article. */
export default function PlaybooksChrome({ children }) {
  return <div className="marketing-page pb-page">
    <a className="mk-skip-link" href="#playbooks-content">Skip to content</a>
    <MarketingNav signupHref={WAITLIST.href} checkoutLabel={WAITLIST.ctaShort} sectionPrefix="/" />
    <main id="playbooks-content" className="pb-main">{children}</main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>Everything, drawn together.</p><nav aria-label="Footer navigation"><Link href="/for">Who it’s for</Link><Link href="/playbooks">Playbooks</Link><Link href="/developers">API & documentation</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><SocialLinks className="mk-footer-social" /><span>Windows · iPhone</span></div></div></footer>
  </div>;
}

/** The end-of-page invitation. Copy comes from WAITLIST so it never drifts. */
export function JoinPanel() {
  return <aside className="pb-join" aria-labelledby="pb-join-title">
    <div>
      <p className="pb-kicker">Early access</p>
      <h2 id="pb-join-title">Run your next deal from one workspace.</h2>
      <p>{WAITLIST.blurb} {WAITLIST.hookNote}</p>
    </div>
    <div className="pb-join-actions">
      <Link className="pb-button pb-button-primary" href={WAITLIST.href}>{WAITLIST.cta}</Link>
      <Link className="pb-button" href="/#workflow">See how it works</Link>
    </div>
  </aside>;
}
