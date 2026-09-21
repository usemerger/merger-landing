'use client';

import { useEffect, useId, useRef, useState } from 'react';
import MarketingMark from './MarketingMark';
import './deal-story.css';

const STAGES = [
  { name: 'Message', title: 'It starts with a conversation.', description: 'An opportunity arrives in WhatsApp. Read and reply from the same inbox as your other channels.' },
  { name: 'Recognize', title: 'A signal, with the source attached.', description: 'Claude spots a possible deal and surfaces the terms. You review the suggestion and decide what gets filed.' },
  { name: 'Organize', title: 'Give the opportunity a place to move.', description: 'Keep the terms, people, original conversation, and next step together in Deal Desk.' },
  { name: 'Move forward', title: 'From conversation to the next step.', description: 'Open DocuSign beside the Rolodex. Use the contact details you have reviewed to prepare your document.' },
];

function Icon({ name, size = 18, ...props }) {
  const paths = {
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    replay: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
    link: <><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 1-1a4 4 0 1 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.chat}</svg>;
}

function WhatsApp({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8A8.5 8.5 0 1 1 20.5 11.6Z" stroke="currentColor" strokeWidth="1.5" /><path d="M8.5 7.5c-.7.1-1 1.1-.7 2.1.7 2.5 2.8 4.7 5.3 5.5 1 .3 2 .1 2.3-.7l.4-1-2-1-.8.8c-1.5-.6-2.7-1.8-3.2-3.1l.7-.9-1-1.8-.9.1Z" fill="currentColor" /></svg>;
}

function Avatar({ small = false }) {
  return <span className={`ds-avatar${small ? ' ds-avatar-small' : ''}`} aria-hidden="true">AM</span>;
}

function SourceMessage({ condensed = false }) {
  return <div className={`ds-source-message${condensed ? ' ds-source-condensed' : ''}`}>
    <div className="ds-message-meta"><Avatar small /><strong>Alex Morgan</strong><span>10:42 AM</span></div>
    <div className="ds-message-bubble">We have a <mark>$2M allocation</mark> available in Riverside. Can you send over an <mark>NDA</mark> so we can share the details?</div>
    <span className="ds-source-channel"><WhatsApp /> WhatsApp · Original message</span>
  </div>;
}

export default function DealStory() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [workspaceHovered, setWorkspaceHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [recipientReady, setRecipientReady] = useState(false);
  const root = useRef(null);
  const uid = useId();
  const active = playing && visible && pageVisible && !reducedMotion && !workspaceHovered;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    updatePreference();
    media.addEventListener('change', updatePreference);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    if (root.current) observer.observe(root.current);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setTimeout(() => setStage(value => (value + 1) % STAGES.length), 6800);
    return () => window.clearTimeout(timer);
  }, [active, stage]);

  useEffect(() => {
    setRecipientReady(false);
  }, [stage]);

  useEffect(() => {
    if (stage !== 3 || !active) return undefined;
    const timer = window.setTimeout(() => setRecipientReady(true), 2200);
    return () => window.clearTimeout(timer);
  }, [stage, active]);

  function chooseStage(next) {
    setStage(next);
    setPlaying(false);
    setAnnouncement(`Step ${next + 1}: ${STAGES[next].title}`);
  }

  function replay() {
    setStage(0);
    setPlaying(!reducedMotion);
    setAnnouncement('Demo restarted. Step 1: Message.');
  }

  return (
    <div ref={root} className={`ds-story${active ? ' ds-running' : ''}`} data-stage={stage}>
      <div className="ds-controls">
        <div className="ds-stages" role="group" aria-label="Explore the Deal Desk workflow">
          {STAGES.map((item, index) => <button key={item.name} type="button" onClick={() => chooseStage(index)} className={`ds-stage${stage === index ? ' ds-stage-active' : ''}`} aria-pressed={stage === index} aria-controls={`${uid}-demo`}>
            <span className="ds-stage-index">0{index + 1}</span><span>{item.name}</span>
            {stage === index && <span className="ds-stage-progress" key={`${stage}-${playing}`} aria-hidden="true" />}
          </button>)}
        </div>
        <div className="ds-playback">
          {!reducedMotion && <button type="button" className="ds-icon-button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause workflow animation' : 'Play workflow animation'} title={playing ? 'Pause animation' : 'Play animation'}><Icon name={playing ? 'pause' : 'play'} size={14} /></button>}
          <button type="button" className="ds-icon-button" onClick={replay} aria-label="Replay workflow from the beginning" title="Replay"><Icon name="replay" size={14} /></button>
        </div>
      </div>

      <div
        className="ds-app"
        id={`${uid}-demo`}
        aria-label="Illustrative Merger Deal Desk demo"
        onFocusCapture={() => setPlaying(false)}
        onPointerEnter={event => {
          if (event.pointerType !== 'touch') setWorkspaceHovered(true);
        }}
        onPointerLeave={() => setWorkspaceHovered(false)}
      >
        <div className="ds-titlebar"><span className="ds-app-brand"><MarketingMark size={16} />Merger</span><span className="ds-demo-label"><span />Interactive demo · Sample data</span><span className="ds-window-dots" aria-hidden="true"><i /><i /><i /></span></div>
        <div className="ds-workspace">
          <div className="ds-rail" aria-hidden="true">
            <span className={stage >= 2 ? 'ds-rail-selected' : ''}><Icon name="grid" /></span>
            <span className={stage < 2 ? 'ds-rail-selected' : ''}><Icon name="chat" /></span>
            <i />
            <span className="ds-whatsapp"><WhatsApp size={19} /></span>
            <span className="ds-rail-monogram">D</span>
            <span className="ds-rail-monogram">in</span>
            <span className="ds-rail-bottom"><MarketingMark size={21} /></span>
          </div>

          <aside className="ds-list" aria-label={stage < 2 ? 'Demo conversations' : 'Demo deals'}>
            <div className="ds-list-heading">{stage < 2 ? 'Messages' : 'Deal Desk'}<span>{stage < 2 ? '3' : '1'}</span></div>
            <span className="ds-list-kicker">{stage < 2 ? 'ALL CONVERSATIONS' : 'YOUR OPPORTUNITIES'}</span>
            {stage < 2 ? <>
              <div className="ds-list-item ds-list-item-active"><Avatar small /><div><strong>Alex Morgan</strong><small>We have a $2M allocation…</small></div><WhatsApp size={13} /></div>
              <div className="ds-list-item ds-list-item-muted"><span className="ds-initials">ST</span><div><strong>Studio team</strong><small>The revised deck is ready.</small></div></div>
              <div className="ds-list-item ds-list-item-muted"><span className="ds-initials">JL</span><div><strong>Jordan Lee</strong><small>Thanks, speak tomorrow.</small></div></div>
            </> : <>
              <div className="ds-deal-list-card"><span><Icon name="sparkle" size={12} /> JUST FILED</span><strong>Riverside allocation</strong><p>$2M · Review NDA</p><small><WhatsApp size={12} /> 1 conversation</small></div>
              <div className="ds-list-empty">Every deal.<br />Its own space.</div>
            </>}
            <div className="ds-list-bottom"><span />{stage < 2 ? 'Your channels, connected' : 'Source context, preserved'}</div>
          </aside>

          <div className="ds-main">
            <div className="ds-main-header">
              <div>{stage < 2 ? <><Avatar /><span><strong>Alex Morgan</strong><small><WhatsApp size={12} />WhatsApp</small></span></> : <><span className="ds-deal-icon"><Icon name={stage === 3 ? 'document' : 'grid'} /></span><span><strong>Riverside allocation</strong><small>{stage === 3 ? 'Documents / NDA' : 'Deal Desk / Opportunity'}</small></span></>}</div>
              <span className={`ds-header-status${stage >= 2 ? ' ds-header-status-gold' : ''}`}>{stage < 2 ? 'Direct message' : 'PENDING'}</span>
            </div>

            <div className="ds-scene" key={stage}>
              {stage < 2 ? <div className="ds-conversation">
                <div className="ds-date"><span />TODAY<span /></div>
                <SourceMessage />
                {stage === 0 ? <>
                  <div className="ds-reply"><p>Absolutely. Let me get that organized.</p><span>You · Merger</span></div>
                  <div className="ds-incoming-signal"><Icon name="sparkle" size={14} /><span>A conversation can become an opportunity.</span></div>
                </> : <div className="ds-recognition">
                  <div className="ds-recognition-heading"><span className="ds-ai-orbit"><Icon name="sparkle" size={17} /></span><div><strong>Possible deal found</strong><small>Detected with Claude · Review required</small></div></div>
                  <div className="ds-extracted"><span>Opportunity<strong>Riverside allocation</strong></span><span>Value<strong>$2,000,000</strong></span><span>Next step<strong>Prepare an NDA</strong></span></div>
                  <div className="ds-recognition-actions"><button type="button" className="ds-action" onClick={() => chooseStage(2)}>Review &amp; file as deal<Icon name="arrow" size={14} /></button><button type="button" className="ds-text-action" onClick={() => chooseStage(0)}>Dismiss</button></div>
                </div>}
                <div className="ds-composer" aria-hidden="true"><span>Message Alex Morgan…</span><span className="ds-composer-send"><Icon name="arrow" size={13} /></span></div>
              </div> : stage === 2 ? <div className="ds-organized">
                <div className="ds-deal-fields"><span>TERMS<strong>$2M allocation</strong></span><span>NEXT STEP<strong>Prepare NDA</strong></span><span>PARTIES<strong>Alex Morgan</strong></span></div>
                <div className="ds-context-title"><Icon name="link" size={13} />THE CONVERSATION STAYS WITH THE DEAL</div>
                <SourceMessage condensed />
                <div className="ds-next-step"><span className="ds-next-step-icon"><Icon name="document" size={19} /></span><div><small>NEXT STEP</small><strong>Get the NDA ready</strong><p>Keep the document and the right people together.</p></div><button className="ds-action" type="button" onClick={() => chooseStage(3)}>Open documents<Icon name="arrow" size={14} /></button></div>
                <div className="ds-filed-note"><Icon name="check" size={13} /> Filed after review. Linked to the original message.</div>
              </div> : <div className="ds-documents">
                <div className="ds-document-toolbar"><span><span className="ds-docusign-mark" aria-hidden="true">d</span>DocuSign</span><small>Prepare document</small></div>
                <div className="ds-document-sheet"><div className="ds-document-paper"><Icon name="document" size={23} /><span>NON-DISCLOSURE AGREEMENT</span><strong>Riverside</strong><i /><i /><i /></div><span className="ds-document-filename">Riverside_NDA.pdf<span>Ready to prepare</span></span></div>
                <div className={`ds-recipient${recipientReady ? ' ds-recipient-ready' : ''}`}><span className="ds-recipient-label">01 / RECIPIENT</span><div><span>Name<strong>{recipientReady ? 'Alex Morgan' : 'Add a recipient'}</strong></span><span>Email<strong>{recipientReady ? 'alex@example.com' : 'Use a contact from Rolodex'}</strong></span></div><button type="button" className="ds-contact-use" onClick={() => { setRecipientReady(true); setAnnouncement('Sample contact added: Alex Morgan, alex@example.com.'); }} disabled={recipientReady}>{recipientReady ? <><Icon name="check" size={13} /> Recipient ready</> : <>Use Rolodex contact<Icon name="arrow" size={13} /></>}</button></div>
                <div className="ds-document-note"><Icon name="link" size={12} />Your people beside the document. You review and send.</div>
              </div>}
            </div>
          </div>

          <aside className={`ds-rolodex${stage >= 2 ? ' ds-rolodex-active' : ''}`} aria-label="Sample Rolodex contact">
            <div className="ds-rolodex-heading">Rolodex<span>↗</span></div><p>People in this deal</p>
            {stage >= 2 ? <><div className="ds-contact"><Avatar /><strong>Alex Morgan</strong><small>Deal contact</small></div><div className="ds-contact-fields"><span>NAME<strong>Alex Morgan</strong></span><span>EMAIL<strong>alex@example.com</strong></span></div><div className="ds-contact-source"><WhatsApp size={13} /><span>Connected on WhatsApp</span></div>{stage === 3 && <button type="button" className="ds-rolodex-button" onClick={() => { setRecipientReady(true); setAnnouncement('Sample contact added to the document recipient.'); }} disabled={recipientReady}>{recipientReady ? <><Icon name="check" size={13} /> Added to recipient</> : <>Use for document<Icon name="arrow" size={13} /></>}</button>}<div className="ds-contact-review"><Icon name="check" size={12} />Contact details reviewed</div></> : <div className="ds-rolodex-wait"><span className="ds-orbit-small"><i /><i /><i /></span><strong>Context comes together.</strong><p>File a deal to keep its people close.</p></div>}
          </aside>
        </div>
        <div className="ds-app-footer"><span><span className="ds-connection-dot" />{stage < 2 ? 'One inbox. Every opportunity.' : stage === 2 ? 'One deal. All the context.' : 'One workspace. The next step.'}</span><span>Illustrative workflow · No messages or documents are sent</span></div>
      </div>

      <div className="ds-caption"><span className="ds-caption-number">0{stage + 1}<span>/04</span></span><div><h3>{STAGES[stage].title}</h3><p>{STAGES[stage].description}</p></div><button className="ds-next-stage" type="button" onClick={() => chooseStage((stage + 1) % 4)} aria-label={stage === 3 ? 'Back to step 1' : `Go to step ${stage + 2}`}><Icon name={stage === 3 ? 'replay' : 'arrow'} size={20} /></button></div>
      <p className="ds-sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
