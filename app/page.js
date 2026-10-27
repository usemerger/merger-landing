import Link from 'next/link';
import { faqs } from './landingContent';
import { ALPHA_OFFER, ANNUAL_OFFER, WAITLIST } from './lib/billingOffer';
import MarketingNav from './components/MarketingNav';
import MarketingMark from './components/MarketingMark';
import SocialLinks from './components/SocialLinks';
import { DealFilm, DocumentFilm } from './components/FeatureFilms';
import MergeHero from './components/MergeHero';
import DownloadCTA from './components/DownloadCTA';
import SingularityButton from './components/SingularityButton';
import ChannelOrbit from './components/ChannelOrbit';
import PricePreview from './components/PricePreview';
import { homeJsonLd, jsonLdScript, SHORT_DESCRIPTION, SITE } from './lib/seo';
import './singularity-funnel.css';

export const metadata = {
  title: { absolute: 'Merger: one inbox and deal desk for dealmakers' },
  description: SHORT_DESCRIPTION,
  alternates: { canonical: SITE },
  openGraph: { url: SITE, title: 'Merger: one inbox and deal desk for dealmakers', description: SHORT_DESCRIPTION },
};

const invitationTerms = `Creating an account is free. Choose a plan from your account and pay at checkout, then download Merger for Windows or iPhone. Merger is ${ALPHA_OFFER.priceLabel} USD/month, or ${ANNUAL_OFFER.priceLabel} USD/year with annual billing (${ANNUAL_OFFER.savingsLabel.toLowerCase()}), plus applicable tax, charged at checkout. Not for you? Email support within 30 days of your first payment for a full refund. Cancel any time from your billing page.`;

const offerAnswer = `${invitationTerms} ${ALPHA_OFFER.rateNotice} Anthropic API usage and DocuSign are separate.`;
const faqAnswers = faqs.map((faq) => ({ ...faq, answer: faq.offer ? offerAnswer : faq.answer }));

function SectionLabel({ number, children }) {
  return <p className="sf-label"><span>{number}</span>{children}</p>;
}

export default function LandingPage() {
  return <div className="marketing-page sf-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd(faqAnswers)) }} />
    <a className="mk-skip-link" href="#main-content">Skip to content</a>
    <MarketingNav signupHref={WAITLIST.href} checkoutLabel={WAITLIST.ctaShort} singularity />
    <main id="main-content">
      <section className="sf-hero" aria-labelledby="hero-title">
        <div className="sf-hero-atmosphere" aria-hidden="true" />
        <div className="mk-wrap sf-hero-grid">
          <div className="sf-hero-copy">
            <p className="sf-eyebrow"><span className="sf-live-dot" /> Built for the way deals happen</p>
            <h1 id="hero-title">Your messages.<br />Your deals.<br /><span>One orbit.</span></h1>
            <p className="sf-intro">One workspace for your WhatsApp, Telegram, LinkedIn and Slack conversations, your contacts, and the deals taking shape between them.</p>
            <div className="sf-hero-actions"><SingularityButton href="/signup">Download Merger</SingularityButton><a className="sf-secondary-button" href="#workflow">Explore Merger</a></div>
            <p className="sf-hero-note">Windows · iPhone · 30-day money-back guarantee</p>
          </div>
          <div className="sf-hero-art"><MergeHero /></div>
        </div>
      </section>

      <section id="workflow" className="sf-section sf-channels mk-wrap" aria-labelledby="channels-title">
        <div className="sf-section-heading"><div><SectionLabel number="01">Connected messaging</SectionLabel><h2 id="channels-title">Your network is everywhere.<br /><span>Your workspace isn’t.</span></h2></div><p>Bring your messaging accounts together. Read and reply across connected channels without losing the thread.</p></div>
        <ChannelOrbit />
        <div className="sf-section-foot"><p>Connections, history, and actions vary by service. SMS and iMessage are not included.</p></div>
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
        <div className="sf-access-copy"><SectionLabel number="04">Get started</SectionLabel><h2>Build your next chapter<br /><span>with Merger.</span></h2><p>Create your account, choose monthly or annual, and install Merger on Windows, iPhone or both. Early members help shape the workspace around the way they work.</p><PricePreview /><p className="sf-rate">Keep your rate while your membership stays active.</p><ul className="sf-access-benefits"><li>Connected messaging, Deal Desk, and Rolodex</li><li>Claude assistance with your own API key</li><li>DocuSign beside your deal contacts</li><li>Meeting scheduling with Google Calendar and Google Meet, rolling out during early access</li></ul><details className="sf-billing-details"><summary>How billing and refunds work <span>+</span></summary><p>{invitationTerms} Anthropic API usage and your DocuSign account are separate.</p></details></div>
        <div id="download" className="sf-waitlist-card"><span id="waitlist" aria-hidden="true" /><div className="sf-waitlist-heading"><span className="sf-live-dot" /><p>Download Merger</p><MarketingMark size={25} /></div><h3>Your next workspace<br />starts here.</h3><p className="sf-waitlist-intro">Get Merger for Windows and iPhone. Create your account and get started in a few minutes. 30-day money-back guarantee.</p><DownloadCTA /><div className="sf-waitlist-bottom"><span>Create account</span><i /><span>Choose a plan</span><i /><span>Download</span></div></div>
      </div></section>

      <section id="faq" className="mk-faq mk-wrap sf-section" aria-labelledby="faq-title"><div className="mk-faq-heading"><SectionLabel number="05">A few more details</SectionLabel><h2 id="faq-title">Good questions.<br /><span>Clear answers.</span></h2><Link className="sf-secondary-button" href="/support">Talk to us</Link></div><div className="mk-faq-list">{faqAnswers.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><div><p>{faq.answer}</p>{faq.link && <Link className="mk-text-link" href={faq.link.href}>{faq.link.label}</Link>}</div></details>)}</div></section>

      <section className="sf-final"><div className="mk-wrap"><MarketingMark size={42} /><h2>Bring it all together.</h2><p>Your messages. Your people. Your next opportunity.</p><SingularityButton href="/signup">Download Merger</SingularityButton></div></section>
    </main>
    <footer className="mk-footer"><div className="mk-wrap"><div className="mk-footer-top"><Link className="mk-brand" href="/" aria-label="Merger home"><MarketingMark /><span>merger</span></Link><p>Everything, drawn together.</p><nav aria-label="Footer navigation"><Link href="/playbooks">Playbooks</Link><Link href="/developers">API & documentation</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member sign in</Link></nav></div><div className="mk-footer-bottom"><span>© 2026 Merger</span><SocialLinks className="mk-footer-social" /><span>Windows · iPhone</span></div></div></footer>
  </div>;
}
