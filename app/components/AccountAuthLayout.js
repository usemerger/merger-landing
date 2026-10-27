"use client";
import Link from "next/link";
import MarketingMark from "./MarketingMark";
import SocialLinks from "./SocialLinks";
import MergeHero from "./MergeHero";
import "./account-auth.css";
import "../singularity-funnel.css";

export function MergerWordmark() {
  return (
    <Link className="auth-wordmark" href="/" aria-label="Merger home">
      <MarketingMark size={30} />
      <span>MERGER</span>
    </Link>
  );
}
export default function AccountAuthLayout({ children }) {
  return (
    <div className="account-auth">
      <section className="account-auth-form" aria-label="Merger account">
        <MergerWordmark />
        <div className="account-auth-content">{children}</div>
        <footer>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/support">Support</Link>
          <SocialLinks className="auth-footer-social" />
        </footer>
      </section>
      <aside className="account-auth-story" aria-label="About Merger">
        <div className="account-auth-art">
          <MergeHero />
        </div>
        <div className="account-auth-story-copy">
          <p className="account-auth-kicker">
            A place for your next opportunity
          </p>
          <h2>Bring it all together.</h2>
          <p>
            Your conversations, your people, and your deals.
            <br />
            One workspace. One account.
          </p>
          <span>Drag to explore the Merger singularity</span>
        </div>
      </aside>
    </div>
  );
}
