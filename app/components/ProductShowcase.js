import Reveal from './Reveal';
import './showcase.css';
import { DeviceSwitcher, MacWindow } from './DeviceMockup';
import HandPhone from './HandPhone';

/**
 * Three sections, three claims, one device each.
 *
 * The copy is deliberately short. Real footage is going into these frames
 * later and it will carry the argument; a paragraph written to fill the gap
 * now is a paragraph someone has to delete then. Each section says what the
 * thing is and what it saves you, and stops.
 *
 * Sections alternate sides so the eye zig-zags down the page rather than
 * reading three identical rows. The tilt follows the side — a device on the
 * right leans left, toward the copy, so the two read as one object.
 */

const SECTIONS = [
  {
    id: 'inbox',
    kicker: 'Every channel, one inbox',
    title: <>Nine apps for one<br /><span>conversation.</span></>,
    body: 'WhatsApp, Instagram, Messenger, Slack, LinkedIn, Telegram, Discord, X, LINE — all of it in a single desktop inbox. Reply to anyone on any network from the same composer, and never wonder which window a thread was in.',
    points: ['One inbox across every connected account', 'Reply from one composer, on any network', 'Your own accounts, your own history'],
    side: 'right',
    device: 'both',
    title_mac: 'Merger — Inbox',
    note: 'Unified inbox',
  },
  {
    id: 'desk',
    kicker: 'The Deal Desk',
    title: <>The deal is in there.<br /><span>Somewhere.</span></>,
    body: 'Instead of a deal spread across a dozen threads on six networks, Claude reads conversations as they arrive and files what looks like a deal — with the message it came from attached. You review every suggestion before it becomes anything.',
    points: ['Detected as messages arrive, not on a nightly batch', 'Filed by vertical, status and channel', 'Every suggestion shows its source message'],
    side: 'left',
    device: 'mac',
    title_mac: 'Merger — Deal Desk',
    note: 'Deal Desk',
  },
  {
    id: 'sign',
    kicker: 'DocuSign, in the deal',
    title: <>Sign it without<br /><span>leaving the room.</span></>,
    body: 'Your own DocuSign account opens inside the deal, with that deal’s people beside it. Select a field, insert a name or an address from the Rolodex, and send — without a second window or a third copy of someone’s email.',
    points: ['Your DocuSign account and your templates', 'Recipient details a click from the field', 'Merger never sends or signs for you'],
    side: 'right',
    device: 'mac',
    title_mac: 'Merger — Fee agreement',
    note: 'DocuSign in a deal',
  },
];

export default function ProductShowcase() {
  return (
    <section className="mk-showcase" aria-labelledby="showcase-title">
      <div className="mk-wrap">
        <div className="mk-section-heading">
          <div>
            <p className="mk-kicker">Inside the app</p>
            <h2 id="showcase-title">One desk for the work<br /><span>between the messages.</span></h2>
          </div>
          <p>Merger is a Windows desktop app. Here is what the three surfaces do.</p>
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div className="mk-wrap" key={s.id}>
          <article className={`mk-show mk-show-${s.side}`} aria-labelledby={`show-${s.id}`}>
            <Reveal className="mk-show-copy" delay={0}>
              <p className="mk-kicker">{s.kicker}</p>
              <h3 id={`show-${s.id}`}>{s.title}</h3>
              <p className="mk-show-body">{s.body}</p>
              <ul className="mk-show-points">
                {s.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </Reveal>

            {/* delay, not stagger: the device settles a beat after the words,
                so the eye reads the claim and then finds the thing. */}
            <Reveal className="mk-show-device" delay={0.08} y={24}>
              {s.device === 'both'
                ? <DeviceSwitcher id={s.id} title={s.title_mac} note={s.note}
                                  tilt={s.side === 'right' ? 'left' : 'right'} />
                : <MacWindow title={s.title_mac} note={s.note}
                             tilt={s.side === 'right' ? 'left' : 'right'} />}
            </Reveal>
          </article>
        </div>
      ))}

      {/* THE MOBILE SECTION. Separate from the toggle above on purpose: the
          toggle answers "does it have a phone app", this answers "what is it
          for". It is also the one section built around a photograph rather
          than a drawn frame — see HandPhone for the two swap seams. */}
      <div className="mk-wrap">
        <article className="mk-show mk-show-hand" aria-labelledby="show-mobile">
          <Reveal className="mk-show-copy" delay={0}>
            <p className="mk-kicker">Merger on your phone</p>
            <h3 id="show-mobile">The desk fits<br /><span>in a pocket.</span></h3>
            <p className="mk-show-body">Every channel and every deal, on the phone you already answer.
            Reply from the train, check what Claude filed while you were in a meeting, and let the
            desktop be where the paperwork happens.</p>
            <ul className="mk-show-points">
              <li>The same inbox, the same deals</li>
              <li>Reply on any network from your phone</li>
              <li>Coming after the Windows alpha</li>
            </ul>
          </Reveal>
          <Reveal className="mk-show-hand-media" delay={0.08} y={24}>
            <HandPhone />
          </Reveal>
        </article>
      </div>

      <div className="mk-wrap">
        <p className="mk-show-disclaimer">
          Screens above are placeholders while the app footage is captured. Nothing in them
          is a representation of the product.
        </p>
      </div>
    </section>
  );
}
