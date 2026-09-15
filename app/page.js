import Link from 'next/link';
import { features, faqs, workflowSteps } from './landingContent';
import { ALPHA_OFFER } from './lib/billingOffer';
import MarketingNav from './components/MarketingNav';
import MarketingMark from './components/MarketingMark';
import ProductDemo from './components/ProductDemo';
import MergeHero from './components/MergeHero';
import ProductShowcase from './components/ProductShowcase';
import Reveal from './components/Reveal';

function FeatureIcon({ name }) {
  const paths = {
    messages: 'M4 5h16v11H9l-5 4V5Zm4 4h8M8 12h5',
    review: 'M5 3h10l4 4v14H5V3Zm10 0v5h4M8 14l3 3 6-6',
    contact: 'M5 4h15v17H5V4ZM2 8h5M2 13h5M2 18h5M10 16c0-3 6-3 6 0M15 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
    document: 'M5 3h9l5 5v13H5V3Zm9 0v6h5M8 13h8M8 17h5',
  };
  return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[name]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function LandingPage() {
  return <div className="marketing-page">
    <a className="mk-skip-link" href="#main-content">Skip to content</a>
    <MarketingNav signupHref={ALPHA_OFFER.signupHref} checkoutLabel={ALPHA_OFFER.navLabel} />
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

      <section id="product" className="mk-section mk-wrap" aria-labelledby="product-title">
        <div className="mk-section-heading"><div><p className="mk-kicker">Built around the conversation</p><h2 id="product-title">Less copying things around.<br /><span>More keeping things together.</span></h2></div><p>Your chats contain the opportunity, the introduction, and the next step. Merger gives each one somewhere useful to live.</p></div>
        <div className="mk-feature-grid">{features.map((feature, i) => <Reveal as="article" delay={i * 0.06} className="mk-feature" key={feature.number}><div className="mk-feature-top"><FeatureIcon name={feature.icon} /><span>{feature.number}</span></div><p className="mk-kicker">{feature.label}</p><h3>{feature.title}</h3><p>{feature.description}</p><div className="mk-feature-note">{feature.note}</div></Reveal>)}</div>
        <a className="mk-text-link mk-feature-link" href="#workflow">Follow a sample conversation through Merger</a>
      </section>

      <section id="workflow" className="mk-workflow mk-section" aria-labelledby="workflow-title"><div className="mk-wrap">
        <div className="mk-section-heading"><div><p className="mk-kicker">From hello to next steps</p><h2 id="workflow-title">The conversation is<br /><span>only the beginning.</span></h2></div><p>Explore a simple example. Follow the message, review the suggestion, keep the introduction, and prepare the paperwork.</p></div>
        <ProductDemo steps={workflowSteps} />
      </div></section>

      <ProductShowcase />

      <section className="mk-setup mk-wrap mk-section" aria-labelledby="setup-title"><div className="mk-setup-heading"><p className="mk-kicker">Make it your desk</p><h2 id="setup-title">Your accounts.<br /><span>Your way of working.</span></h2><p>Start with the Windows app. Add the integrations you want as you build your workflow.</p><Link className="mk-text-link" href="/download">Windows download information</Link></div><ol className="mk-setup-steps"><li><span>01</span><div><h3>Connect your conversations</h3><p>Sign in to Merger and use the account connections available in the desktop app.</p></div></li><li><span>02</span><div><h3>Bring your Anthropic API key</h3><p>Enable Claude features to review potential deals and introduction details. Anthropic bills API usage separately.</p></div></li><li><span>03</span><div><h3>Keep the work moving</h3><p>File the deals you choose. Open your own DocuSign account with recipient details beside your templates.</p></div></li></ol></section>

      <section id="pricing" className="mk-pricing mk-section" aria-labelledby="pricing-title"><div className="mk-wrap">
        <div className="mk-section-heading"><div><p className="mk-kicker">An early seat at the desk</p><h2 id="pricing-title">{ALPHA_OFFER.priceLabel} a month.<br /><span>Locked in for life.</span></h2></div><p>Your first two weeks are free. Join during the alpha and {ALPHA_OFFER.priceLabel} stays your rate after the price rises. Your Anthropic API usage and DocuSign account are separate.</p></div>
        <div className="mk-pricing-grid"><article className="mk-alpha-plan"><div className="mk-plan-heading"><div><span className="mk-kicker">Windows desktop</span><h3>{ALPHA_OFFER.name}</h3></div><span className="mk-plan-badge">Early access</span></div><p className="mk-plan-free">{ALPHA_OFFER.freeHeadline}</p><p className="mk-plan-terms">{ALPHA_OFFER.trialTerms}</p><p className="mk-plan-rate">{ALPHA_OFFER.rateNotice}</p><ul className="mk-plan-features"><li>Connected messages in one workspace</li><li>Deal Desk and Rolodex</li><li>Claude features with your Anthropic API key</li><li>DocuSign in the app with your own account</li></ul><p className="mk-plan-cta-terms">{ALPHA_OFFER.ctaTerms}</p><Link className="mk-button" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.checkoutLabel}</Link><p className="mk-plan-billing">{ALPHA_OFFER.billingNotice}</p><p className="mk-plan-extras">Anthropic API usage and DocuSign charges are not included.</p></article>
          <div className="mk-plan-aside"><div className="mk-alpha-note"><span className="mk-kicker">Help shape what comes next</span><h3>For people who work through conversations.</h3><p>The alpha is for trying Merger in your day-to-day workflow and telling us where it needs to improve.</p><Link className="mk-text-link" href="/support">Talk to us before joining</Link></div><div className="mk-team-interest"><span className="mk-kicker">Teams · future interest</span><h3>Building a desk for your team?</h3><p>Team plans are not available to purchase yet. Tell us what your team needs.</p><a className="mk-text-link" href="mailto:support@usemerger.com?subject=Merger%20team%20interest">Email team interest</a></div></div></div>
      </div></section>

      <section id="faq" className="mk-faq mk-wrap mk-section" aria-labelledby="faq-title"><div className="mk-faq-heading"><p className="mk-kicker">Before you join</p><h2 id="faq-title">A few useful<br /> <span>details.</span></h2><p>Have something else in mind?</p><Link className="mk-text-link" href="/support">Get in touch</Link></div><div className="mk-faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><div><p>{faq.offer ? `${ALPHA_OFFER.billingNotice} ${ALPHA_OFFER.rateNotice}` : faq.answer}</p>{faq.link && <Link className="mk-text-link" href={faq.link.href}>{faq.link.label}</Link>}</div></details>)}</div></section>

      <section className="mk-final"><div className="mk-wrap"><MarketingMark size={42} /><p className="mk-kicker">Messages into momentum</p><h2>Your next deal<br />is already a <span>conversation.</span></h2><p>Give it a home in Merger.</p><Link className="mk-button" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.checkoutLabel}</Link><span className="mk-final-price">{ALPHA_OFFER.summary}</span></div></section>
    </main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>A place for the work in your conversations.</p><nav aria-label="Footer navigation"><Link href="/download">Download</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><span>Windows alpha · Built with feedback</span></div></div></footer>
  </div>;
}
