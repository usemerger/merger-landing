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
            <p className="sf-eyebrow"><span className="sf-live-dot" /> IN DEVELOPMENT · WINDOWS ALPHA</p>
            <h1 id="hero-title">Your messages.<br />Your deals.<br /><span>One orbit.</span></h1>
            <p className="sf-intro">Bring your messaging channels into one app. Find the opportunities in your conversations, and give every deal a place to move forward.</p>
            <div className="sf-hero-actions"><SingularityButton href="#waitlist">Join the waitlist</SingularityButton><a className="sf-watch-link" href="#workflow"><span aria-hidden="true">↘</span> See it in motion</a></div>
            <p className="sf-hero-note">Early access by invitation. No card to join.</p>
          </div>
          <div className="sf-hero-art"><MergeHero /><span className="sf-art-index" aria-hidden="true">FRAGMENTED. CONNECTED. MERGED.</span></div>
        </div>
        <div className="mk-wrap sf-hero-footer"><span>Everything you need, drawn together.</span><a href="#workflow">Explore the workspace <span aria-hidden="true">↓</span></a></div>
      </section>

      <div className="sf-chapters mk-wrap" aria-label="The Merger workflow">
        <a href="#workflow"><span>01</span><div>Connect your channels<small>One place for every conversation</small></div><span aria-hidden="true">↗</span></a>
        <a href="#deal-desk"><span>02</span><div>Find the opportunity<small>Messages become meaningful next steps</small></div><span aria-hidden="true">↗</span></a>
        <a href="#documents"><span>03</span><div>Move the deal forward<small>People, context, and paperwork together</small></div><span aria-hidden="true">↗</span></a>
      </div>

      <section id="workflow" className="sf-section sf-channels mk-wrap" aria-labelledby="channels-title">
        <div className="sf-section-heading"><div><SectionLabel number="01">CONNECTED CONVERSATIONS</SectionLabel><h2 id="channels-title">Different channels.<br /><span>The same center.</span></h2></div><p>Your network lives in different places. Your work doesn’t have to. Read and reply to connected conversations from one Merger workspace.</p></div>
        <ChannelOrbit />
        <div className="sf-section-foot"><span>YOUR ACCOUNTS. YOUR CONVERSATIONS.</span><p>Available connections, message history, and actions vary by service during alpha. SMS and iMessage are not included.</p></div>
      </section>

      <section id="deal-desk" className="sf-section sf-deal-section" aria-labelledby="deal-title"><div className="mk-wrap">
        <div className="sf-section-heading"><div><SectionLabel number="02">FROM MESSAGE TO MOMENTUM</SectionLabel><h2 id="deal-title">A message is the start.<br /><span>Give the deal a home.</span></h2></div><p>Claude can recognize a possible deal in your connected messages. You review it. Deal Desk keeps the conversations, terms, people, and next step together.</p></div>
        <div className="sf-product-film"><DealFilm /></div>
        <div className="sf-value-row"><div><span>CONTEXT</span><h3>Keep the original conversation.</h3><p>Go back to where the opportunity began, with its channel and participants attached.</p></div><div><span>CLARITY</span><h3>Know what happens next.</h3><p>Bring the terms, timeline, and people into the same view as the work.</p></div><div><span>CONTROL</span><h3>Your judgment stays central.</h3><p>Accept a suggestion or create a deal yourself. You decide what belongs on the desk.</p></div></div>
        <p className="sf-detail-note">AI features use your own Anthropic API key. API usage is billed separately.</p>
      </div></section>

      <section id="documents" className="sf-section sf-document-section mk-wrap" aria-labelledby="documents-title">
        <div className="sf-section-heading"><div><SectionLabel number="03">THE PEOPLE BEHIND THE PAPERWORK</SectionLabel><h2 id="documents-title">From introduction<br /><span>to the dotted line.</span></h2></div><p>Your Rolodex keeps the details people share. Open DocuSign inside Merger, with the right names and emails beside the document.</p></div>
        <div className="sf-product-film"><DocumentFilm /></div>
        <p className="sf-detail-note">Illustrative workflows with sample data. Select a video to pause or resume. DocuSign access and charges are separate.</p>
      </section>

      <section id="pricing" className="sf-section sf-access-section"><div className="mk-wrap sf-access-grid">
        <div className="sf-access-copy"><SectionLabel number="04">AN EARLY SEAT AT THE DESK</SectionLabel><h2>Help shape<br /><span>what comes next.</span></h2><p>Merger is in development. We’re opening the Windows alpha in groups so we can build around the people who use it.</p><div className="sf-price"><strong>{ALPHA_OFFER.priceLabel}</strong><span>/ month<small>After your invitation and 14-day free trial.</small></span></div><p className="sf-rate">Join during alpha. Keep the $50 monthly rate for as long as your membership stays active.</p><ul className="sf-access-benefits"><li>Connected messaging, Deal Desk, and Rolodex</li><li>Claude assistance with your own API key</li><li>DocuSign beside your deal contacts</li></ul><details className="sf-billing-details"><summary>How invitations and billing work <span>+</span></summary><p>{invitationTerms} Anthropic API usage and your DocuSign account are separate.</p></details></div>
        <div id="waitlist" className="sf-waitlist-card"><div className="sf-waitlist-heading"><span className="sf-live-dot" /><p>EARLY ACCESS / WAITLIST</p><MarketingMark size={25} /></div><h3>Your place in the orbit.</h3><p className="sf-waitlist-intro">Join the list. We’ll email you when a seat opens.</p><WaitlistForm /><div className="sf-waitlist-bottom"><span>01 JOIN</span><i /><span>02 GET INVITED</span><i /><span>03 BUILD WITH US</span></div></div>
      </div></section>

      <section id="faq" className="mk-faq mk-wrap sf-section" aria-labelledby="faq-title"><div className="mk-faq-heading"><SectionLabel number="05">A LITTLE MORE CLARITY</SectionLabel><h2 id="faq-title">Before you<br /><span>enter the orbit.</span></h2><Link className="sf-watch-link" href="/support">Have a question? Get in touch ↗</Link></div><div className="mk-faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><div><p>{faq.offer ? `${invitationTerms} ${ALPHA_OFFER.rateNotice} Anthropic API usage and DocuSign are separate.` : faq.answer}</p>{faq.link && <Link className="mk-text-link" href={faq.link.href}>{faq.link.label}</Link>}</div></details>)}</div></section>

      <section className="sf-final"><div className="sf-final-orbits" aria-hidden="true"><i /><i /><i /></div><div className="mk-wrap"><MarketingMark size={48} /><p className="sf-eyebrow">MESSAGES INTO MOMENTUM</p><h2>Your next deal is<br /><span>already a conversation.</span></h2><SingularityButton href="#waitlist">Find your place in Merger</SingularityButton><p>Join the waitlist. Be part of what comes next.</p></div></section>
    </main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>Everything, drawn together.</p><nav aria-label="Footer navigation"><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><span>Windows alpha · In development</span></div></div></footer>
  </div>;
}
