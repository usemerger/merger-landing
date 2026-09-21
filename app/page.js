import Link from 'next/link';
import { faqs } from './landingContent';
import { ALPHA_OFFER, WAITLIST } from './lib/billingOffer';
import MarketingNav from './components/MarketingNav';
import MarketingMark from './components/MarketingMark';
import { DealFilm, DocumentFilm } from './components/FeatureFilms';
import MergeHero from './components/MergeHero';
import WaitlistForm from './components/WaitlistForm';
import SingularityButton from './components/SingularityButton';
import ChannelOrbit from './components/ChannelOrbit';
import './singularity-funnel.css';

const invitationTerms = 'Joining the waitlist is free. When you receive and accept an invitation, you can start a 14-day free trial with a card. After the trial, Merger is $50 USD/month plus applicable tax. Cancel before the trial ends to avoid a charge.';

function SectionLabel({ number, children }) {
  return <p className="sf-label"><span>{number}</span>{children}</p>;
}

export default function LandingPage() {
  return <div className="marketing-page sf-page">
    <a className="mk-skip-link" href="#main-content">Skip to content</a>
    <MarketingNav signupHref={WAITLIST.href} checkoutLabel={WAITLIST.ctaShort} singularity />
    <main id="main-content">
      <section className="sf-hero" aria-labelledby="hero-title">
        <div className="sf-hero-atmosphere" aria-hidden="true" />
        <div className="mk-wrap sf-hero-grid">
          <div className="sf-hero-copy">
            <p className="sf-eyebrow"><span className="sf-live-dot" /> Built for the way deals happen</p>
            <h1 id="hero-title">Your messages.<br />Your deals.<br /><span>One orbit.</span></h1>
            <p className="sf-intro">One workspace for your conversations, your contacts, and the deals taking shape between them.</p>
            <div className="sf-hero-actions"><SingularityButton href="#waitlist">Join the waitlist</SingularityButton><a className="sf-secondary-button" href="#workflow">Explore Merger</a></div>
            <p className="sf-hero-note">Windows alpha · Early access by invitation · No card to join</p>
          </div>
          <div className="sf-hero-art"><MergeHero /></div>
        </div>
      </section>

      <section id="workflow" className="sf-section sf-channels mk-wrap" aria-labelledby="channels-title">
        <div className="sf-section-heading"><div><SectionLabel number="01">Connected messaging</SectionLabel><h2 id="channels-title">Your network is everywhere.<br /><span>Your workspace isn’t.</span></h2></div><p>Bring your messaging accounts together. Read and reply across connected channels without losing the thread.</p></div>
        <ChannelOrbit />
        <div className="sf-section-foot"><p>Connections, history, and actions vary by service during alpha. SMS and iMessage are not included.</p></div>
      </section>

      <section id="deal-desk" className="sf-section sf-deal-section" aria-labelledby="deal-title"><div className="mk-wrap">
        <div className="sf-section-heading"><div><SectionLabel number="02">Deal intelligence</SectionLabel><h2 id="deal-title">From “let’s talk”<br /><span>to a deal in motion.</span></h2></div><p>Claude recognizes potential deals in your messages. Review the suggestion, then bring the conversation, terms, and people into Deal Desk.</p></div>
        <div className="sf-product-film"><DealFilm /></div>
        <div className="sf-value-row"><div><h3>The conversation stays attached.</h3><p>Keep the source, participants, and context.</p></div><div><h3>The next step stays clear.</h3><p>See the terms, people, and timeline together.</p></div><div><h3>You make the call.</h3><p>Review suggestions before they become deals.</p></div></div>
      </div></section>

      <section id="documents" className="sf-section sf-document-section mk-wrap" aria-labelledby="documents-title">
        <div className="sf-section-heading"><div><SectionLabel number="03">People & paperwork</SectionLabel><h2 id="documents-title">The right people.<br /><span>Right beside the document.</span></h2></div><p>Keep contact details in your Rolodex. Use them alongside DocuSign inside Merger to prepare the next document with less back-and-forth.</p></div>
        <div className="sf-product-film"><DocumentFilm /></div>
        <p className="sf-detail-note">Product previews use sample data. Select a video to pause or resume.</p>
      </section>

      <section id="pricing" className="sf-section sf-access-section"><div className="mk-wrap sf-access-grid">
        <div className="sf-access-copy"><SectionLabel number="04">Early access</SectionLabel><h2>Build your next chapter<br /><span>with Merger.</span></h2><p>We’re opening the Windows alpha in small groups. Join the waitlist and help shape the workspace around the way you work.</p><div className="sf-price"><strong>{ALPHA_OFFER.priceLabel}</strong><span>/ month<small>After your invitation and 14-day free trial.</small></span></div><p className="sf-rate">Keep the alpha rate while your membership stays active.</p><ul className="sf-access-benefits"><li>Connected messaging, Deal Desk, and Rolodex</li><li>Claude assistance with your own API key</li><li>DocuSign beside your deal contacts</li></ul><details className="sf-billing-details"><summary>How invitations and billing work <span>+</span></summary><p>{invitationTerms} Anthropic API usage and your DocuSign account are separate.</p></details></div>
        <div id="waitlist" className="sf-waitlist-card"><div className="sf-waitlist-heading"><span className="sf-live-dot" /><p>Join the waitlist</p><MarketingMark size={25} /></div><h3>Your next workspace<br />starts here.</h3><p className="sf-waitlist-intro">Create your Merger account. We’ll let you know when your invitation is ready.</p><WaitlistForm /><div className="sf-waitlist-bottom"><span>Create account</span><i /><span>Get invited</span><i /><span>Get started</span></div></div>
      </div></section>

      <section id="faq" className="mk-faq mk-wrap sf-section" aria-labelledby="faq-title"><div className="mk-faq-heading"><SectionLabel number="05">A few more details</SectionLabel><h2 id="faq-title">Good questions.<br /><span>Clear answers.</span></h2><Link className="sf-secondary-button" href="/support">Talk to us</Link></div><div className="mk-faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><div><p>{faq.offer ? `${invitationTerms} ${ALPHA_OFFER.rateNotice} Anthropic API usage and DocuSign are separate.` : faq.answer}</p>{faq.link && <Link className="mk-text-link" href={faq.link.href}>{faq.link.label}</Link>}</div></details>)}</div></section>

      <section className="sf-final"><div className="mk-wrap"><MarketingMark size={42} /><h2>Bring it all together.</h2><p>Your messages. Your people. Your next opportunity.</p><SingularityButton href="#waitlist">Join the waitlist</SingularityButton></div></section>
    </main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>Everything, drawn together.</p><nav aria-label="Footer navigation"><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><span>Windows alpha · In development</span></div></div></footer>
  </div>;
}
