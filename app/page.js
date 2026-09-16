import Link from 'next/link';
import { faqs } from './landingContent';
import { ALPHA_OFFER } from './lib/billingOffer';
import MarketingNav from './components/MarketingNav';
import MarketingMark from './components/MarketingMark';
import FeatureFilms from './components/FeatureFilms';
import MergeHero from './components/MergeHero';

export default function LandingPage() {
  return <div className="marketing-page">
    <a className="mk-skip-link" href="#main-content">Skip to content</a>
    <MarketingNav signupHref={ALPHA_OFFER.signupHref} checkoutLabel={ALPHA_OFFER.checkoutLabel} />
    <main id="main-content">
      <section className="mk-hero" aria-labelledby="hero-title">
        {/* §5 THE HERO REACTS TO THE PRIMARY ACTION.
            Two light layers sit behind everything: an always-on floor sweep
            (the reference's page is not flat black — it has a floor), and a
            gold bloom that only rises when the CTA is hovered.

            Driven by :has() rather than React state on purpose. The hover has
            no business re-rendering the hero, and a CSS-only path keeps working
            with JS still loading — which is exactly when a first visitor is
            most likely to be moving the mouse toward the button. */}
        <div className="mk-hero-floor" aria-hidden="true" />
        <div className="mk-hero-bloom" aria-hidden="true" />
        <div className="mk-wrap mk-hero-grid">
          <div className="mk-hero-copy">
            <p className="mk-pill"><span className="mk-status-dot" /> Now opening · Windows alpha</p>
            <h1 id="hero-title">Good deals start in a <span>conversation.</span></h1>
            <p className="mk-hero-description">Bring your connected messages, deal context, and contacts into one desktop workspace.</p>
            <div className="mk-hero-actions">
              <Link className="mk-button" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.checkoutLabel}</Link>
              <a className="mk-text-link" href="#workflow">How it works</a>
            </div>
            <p className="mk-hero-price"><strong>{ALPHA_OFFER.priceLabel}{ALPHA_OFFER.intervalLabel}</strong> <span>·</span> First 2 weeks free · Card required, {ALPHA_OFFER.todayLabel} today</p>
          </div>
          <div className="mk-hero-visual">
            <MergeHero />
          </div>
        </div>
      </section>

      <div className="mk-foundations"><div className="mk-wrap"><span>One workspace for the work between messages.</span><ul><li>Messages</li><li>Deal Desk</li><li>Rolodex</li><li>DocuSign</li></ul></div></div>

      <section id="workflow" className="mk-workflow mk-section" aria-labelledby="workflow-title"><div className="mk-wrap">
        <div className="mk-section-heading"><div><p className="mk-kicker">From hello to next steps</p><h2 id="workflow-title">The conversation is<br /><span>only the beginning.</span></h2></div><p>Watch connected messages become a clearer next step. Explore one inbox, AI deal detection, and the people beside the paperwork.</p></div>
        <FeatureFilms />
      </div></section>

      <section id="pricing" className="mk-pricing mk-section" aria-labelledby="pricing-title"><div className="mk-wrap">
        <div className="mk-section-heading"><div><p className="mk-kicker">An early seat at the desk</p><h2 id="pricing-title">{ALPHA_OFFER.priceLabel} a month.<br /><span>Locked in for life.</span></h2></div><p>Your first two weeks are free. Join during the alpha and {ALPHA_OFFER.priceLabel} stays your rate after the price rises. Your Anthropic API usage and DocuSign account are separate.</p></div>
        <div className="mk-pricing-grid"><article className="mk-alpha-plan"><div className="mk-plan-heading"><div><span className="mk-kicker">Windows desktop</span><h3>{ALPHA_OFFER.name}</h3></div><span className="mk-plan-badge">Early access</span></div><div className="mk-plan-price"><strong>{ALPHA_OFFER.priceLabel}</strong><span>{ALPHA_OFFER.intervalLabel}<small>{ALPHA_OFFER.trialLabel} · {ALPHA_OFFER.todayLabel} today</small></span></div><p className="mk-plan-rate">{ALPHA_OFFER.rateNotice}</p><ul className="mk-plan-features"><li>Connected messages in one workspace</li><li>Deal Desk and Rolodex</li><li>Claude features with your Anthropic API key</li><li>DocuSign in the app with your own account</li></ul><Link className="mk-button" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.checkoutLabel}</Link><p className="mk-plan-billing">{ALPHA_OFFER.billingNotice}</p><p className="mk-plan-extras">Anthropic API usage and DocuSign charges are not included.</p></article>
          <div className="mk-plan-aside"><div className="mk-alpha-note"><span className="mk-kicker">Help shape what comes next</span><h3>For people who work through conversations.</h3><p>The alpha is for trying Merger in your day-to-day workflow and telling us where it needs to improve.</p><Link className="mk-text-link" href="/support">Talk to us before joining</Link></div><div className="mk-team-interest"><span className="mk-kicker">Teams · future interest</span><h3>Building a desk for your team?</h3><p>Team plans are not available to purchase yet. Tell us what your team needs.</p><a className="mk-text-link" href="mailto:support@usemerger.com?subject=Merger%20team%20interest">Email team interest</a></div></div></div>
      </div></section>

      <section id="faq" className="mk-faq mk-wrap mk-section" aria-labelledby="faq-title"><div className="mk-faq-heading"><p className="mk-kicker">Before you join</p><h2 id="faq-title">A few useful<br /> <span>details.</span></h2><p>Have something else in mind?</p><Link className="mk-text-link" href="/support">Get in touch</Link></div><div className="mk-faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><div><p>{faq.offer ? `${ALPHA_OFFER.billingNotice} ${ALPHA_OFFER.rateNotice}` : faq.answer}</p>{faq.link && <Link className="mk-text-link" href={faq.link.href}>{faq.link.label}</Link>}</div></details>)}</div></section>

      <section className="mk-final"><div className="mk-wrap"><MarketingMark size={42} /><p className="mk-kicker">Messages into momentum</p><h2>Your next deal<br />is already a <span>conversation.</span></h2><p>Give it a home in Merger.</p><Link className="mk-button" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.checkoutLabel}</Link><span className="mk-final-price">{ALPHA_OFFER.summary}</span></div></section>
    </main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>A place for the work in your conversations.</p><nav aria-label="Footer navigation"><Link href="/download">Download</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><span>Windows alpha · Built with feedback</span></div></div></footer>
  </div>;
}
