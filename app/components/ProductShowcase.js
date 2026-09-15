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
 *
 * THE DESKTOP SLOTS NOW HOLD REAL RECORDINGS; the phone does not. There is no
 * iOS footage, and putting a desktop capture inside a phone frame would be a
 * claim about an app that does not exist yet, so the iOS view keeps its
 * labelled placeholder.
 *
 * `/showcase/bonus_deal-desk-detail.mp4` (+ .jpg) is a fourth capture — the
 * Edit-deal depth — held in reserve. It is deliberately unplaced: every slot
 * has footage, and a spare shown twice is worse than a spare kept.
 *
 * THE POSTERS POINT AT .webp, NOT THE .jpg BESIDE IT. A poster is fetched
 * eagerly — there is no lazy loading for one — and three 1080p JPEGs came to
 * 290KB competing with the hero for bandwidth, which pushed LCP from ~520ms
 * to ~780ms. Re-encoded at the 1200px the slot can actually use, the same
 * three are 78KB. The operator's JPEGs stay in the repo as the masters to
 * re-derive from, exactly like hand-phone.png beside hand-phone.webp.
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
    mac: { src: '/showcase/section1_cross-channel.mp4', poster: '/showcase/section1_cross-channel.webp',
           alt: 'Replying to a WhatsApp thread and then a Telegram thread from one inbox' },
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
    mac: { src: '/showcase/section2_ai-deal-detection.mp4', poster: '/showcase/section2_ai-deal-detection.webp',
           alt: 'Detected deals arriving on the Deal Desk with File as deal and Dismiss' },
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
    mac: { src: '/showcase/section3_docusign-in-deal.mp4', poster: '/showcase/section3_docusign-in-deal.webp',
           alt: 'DocuSign opening inside a deal, with the deal’s people beside it' },
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
                ? <DeviceSwitcher id={s.id} title={s.title_mac} note={s.note} mac={s.mac}
                                  tilt={s.side === 'right' ? 'left' : 'right'} />
                : <MacWindow title={s.title_mac} note={s.note} media={s.mac}
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

      {/* THE ONE THING CSS CANNOT DO IS STOP A VIDEO AUTOPLAYING, so this is
          the only script on the page — and it is an inline tag in the HTML,
          not a module in the page chunk. That distinction is the whole reason
          it is written this way: this page evaluates a ~620ms Three.js bundle
          and sits on the threshold where adding to that chunk tips its
          evaluation into one long task. Four lines parsed inline cost nothing
          and touch no bundle.

          `autoplay` stays in the markup so the normal path works with no
          JavaScript at all; this only ever takes it AWAY, from someone who
          asked for less movement. It runs after the videos in document order,
          so they exist, and before they have buffered enough to start. */}
      <script
        dangerouslySetInnerHTML={{ __html: "(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)return;var v=document.querySelectorAll('video[data-motion]');for(var i=0;i<v.length;i++){v[i].autoplay=false;v[i].loop=false;v[i].removeAttribute('autoplay');v[i].pause();v[i].currentTime=0;}}catch(e){}})();" }}
      />

      <div className="mk-wrap">
        <p className="mk-show-disclaimer">
          Desktop screens are real recordings of the Windows alpha. The phone screens are
          placeholders — there is no iOS build yet.
        </p>
      </div>
    </section>
  );
}
