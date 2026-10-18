import Link from 'next/link';
import PlaybooksChrome from '../playbooks/PlaybooksChrome';
import { getArticle } from '../playbooks/content';
import '../playbooks/playbooks.css';
import './book.css';
import { bookingTarget } from './booking';

/**
 * Book a 15-minute setup call with Owen.
 *
 * Bookings go to the hello@usemerger.com Google Calendar through a Google
 * appointment schedule, and every booking gets a Google Meet link from
 * Google. Set NEXT_PUBLIC_BOOKING_URL to the schedule's booking page:
 *
 *   https://calendar.google.com/calendar/appointments/schedules/<id>
 *
 * That form is embedded (with ?gv=true). Any other https link, such as a
 * calendar.app.google short link or Calendly, is shown as a button instead,
 * because only the full Google URL can be framed. Unset, the page offers an
 * email to hello@usemerger.com, so a link in an email never dead-ends.
 *
 * ?v=<vertical> comes from the nurture emails (backend nurture.py) and only
 * picks the wording and the Playbook shown beside the calendar.
 */

export const metadata = {
  title: 'Book a 15-minute setup with Owen',
  description: 'Fifteen minutes on Google Meet with Merger’s founder: connect your messaging accounts and see the Deal Desk on a deal like yours.',
  alternates: { canonical: 'https://usemerger.com/book' },
  robots: { index: false, follow: true },
};

const VERTICALS = {
  secondaries: ['secondaries brokers', 'secondaries-broker-counterparties-across-messaging-apps'],
  search_fund: ['searchers', 'search-fund-broker-outreach-without-a-crm'],
  business_broker: ['business brokers', 'business-broker-sell-side-buyer-conversations'],
  real_estate: ['real estate syndicators and investors', 'real-estate-syndicator-capital-raise-from-intro-to-signature'],
  family_office: ['family office principals', 'family-office-co-investment-deal-flow'],
  private_equity: ['private equity dealmakers', 'private-equity-add-on-sourcing-for-a-roll-up'],
  venture: ['venture investors', 'venture-investor-founder-intros-from-x-and-linkedin'],
  ecommerce: ['ecommerce acquirers', 'ecommerce-brand-acquisition-from-founder-dms'],
  general: ['dealmakers', 'your-deal-flow-lives-in-your-dms'],
};

const HELLO = 'hello@usemerger.com';

export default async function BookPage({ searchParams }) {
  const params = (await searchParams) || {};
  const key = Object.hasOwn(VERTICALS, params.v) ? params.v : 'general';
  const [audience, slug] = VERTICALS[key];
  const playbook = getArticle(slug);
  const target = bookingTarget(process.env.NEXT_PUBLIC_BOOKING_URL);
  const mailto = `mailto:${HELLO}?subject=${encodeURIComponent('15-minute Merger setup')}&body=${encodeURIComponent('Hi Owen, I’d like to book a 15-minute setup. A few times that work for me:\n\n')}`;

  return <PlaybooksChrome>
    <section className="bk-wrap" aria-labelledby="bk-title">
      <div className="bk-copy">
        <p className="pb-eyebrow"><span className="pb-dot" /> 15 minutes · Google Meet</p>
        <h1 id="bk-title">Set up Merger with Owen.</h1>
        <p className="bk-lead">Owen is Merger’s founder. He sets up a small group of {audience} personally, on a short call around a deal like yours.</p>
        <ol className="bk-steps">
          <li><strong>Connect your accounts.</strong> The messaging apps you actually use for deals. Available networks vary by service.</li>
          <li><strong>See the Deal Desk.</strong> A walkthrough on a deal like yours: conversations, contacts and paperwork in one place.</li>
          <li><strong>Ask anything.</strong> Including whether it’s a fit at all.</li>
        </ol>
        <p className="bk-note">You’ll get a calendar invitation with a Google Meet link by email. Need a different time? Email <a href={`mailto:${HELLO}`}>{HELLO}</a>.</p>
        {playbook && <p className="bk-note">Before the call: <Link href={`/playbooks/${playbook.slug}`}>{playbook.title}</Link></p>}
      </div>

      <div className="bk-panel">
        {target.kind === 'embed' && <>
          <iframe className="bk-frame" src={target.src} title="Pick a time with Owen" loading="lazy" />
          <p className="bk-fallback">Calendar not loading? <a href={target.href} rel="noopener">Open the booking page</a>.</p>
        </>}
        {target.kind === 'link' && <div className="bk-cta">
          <p>Pick a time that works for you.</p>
          <a className="pb-button pb-button-primary" href={target.href} rel="noopener">Pick a time with Owen</a>
        </div>}
        {target.kind === 'email' && <div className="bk-cta">
          <p>Send Owen a couple of times that work for you, and you’ll get a Google Meet invitation back.</p>
          <a className="pb-button pb-button-primary" href={mailto}>Email Owen to book</a>
        </div>}
      </div>
    </section>
  </PlaybooksChrome>;
}
