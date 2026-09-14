'use client';

import { useRef, useState } from 'react';
import MarketingMark from './MarketingMark';

const intro = 'Hi, I’m Morgan Ellis at Oak Street Partners. You can reach me at morgan@example.com.';
const proposal = 'We have a $500,000 allocation for the Oak Street acquisition. Can you send the terms this week?';

export default function ProductDemo({ steps }) {
  const [active, setActive] = useState(0);
  const [review, setReview] = useState('pending');
  const [copied, setCopied] = useState('');
  const tabs = useRef([]);
  const step = steps[active];
  function moveTab(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % steps.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + steps.length) % steps.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = steps.length - 1;
    if (next !== undefined) { event.preventDefault(); setActive(next); tabs.current[next]?.focus(); }
  }
  async function copy(value) {
    try { await navigator.clipboard.writeText(value); setCopied('Sample email copied.'); }
    catch { setCopied('Select the sample email below and copy it with your keyboard.'); }
  }
  return <div className="mk-demo">
    <div className="mk-demo-top"><span className="mk-demo-brand"><MarketingMark size={20} /> Inside Merger</span><span className="mk-demo-label"><span className="mk-status-dot" /> Interactive illustration</span></div>
    <div className="mk-demo-tabs" role="tablist" aria-label="Explore the Merger workflow">
      {steps.map((item, index) => <button key={item.id} ref={element => { tabs.current[index] = element; }} type="button" id={`workflow-tab-${item.id}`} role="tab" aria-selected={index === active} aria-controls="workflow-panel" tabIndex={index === active ? 0 : -1} className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} onKeyDown={event => moveTab(event, index)}><span>0{index + 1}</span>{item.label}</button>)}
    </div>
    <div id="workflow-panel" role="tabpanel" tabIndex={0} aria-labelledby={`workflow-tab-${step.id}`} className="mk-demo-panel">
      <div className="mk-demo-explanation"><span className="mk-kicker">{step.detail}</span><h3>{step.title}</h3><p>{step.description}</p><span className="mk-demo-step">0{active + 1} <span>/ 04</span></span></div>
      <div className="mk-demo-scene">
        {active === 0 && <div className="mk-conversation">
          <div className="mk-person-row"><span className="mk-avatar">ME</span><div><strong>Morgan Ellis</strong><span>Oak Street Partners · sample contact</span></div><span className="mk-tiny-tag">Messages</span></div>
          <div className="mk-chat-date">Today · sample conversation</div>
          <p className="mk-chat-bubble">{intro}<span>9:41 AM</span></p>
          <p className="mk-chat-bubble">{proposal}<span>9:42 AM</span></p>
          <button type="button" className="mk-demo-action" onClick={() => setActive(1)}>Review the sample suggestion</button>
        </div>}
        {active === 1 && <div className="mk-suggestion">
          <div className="mk-scene-heading"><span className="mk-tiny-tag">{review === 'pending' ? 'Suggested deal' : review === 'filed' ? 'Filed in this demo' : 'Dismissed in this demo'}</span><span className="mk-scene-muted">Claude · example</span></div>
          <h4>Oak Street acquisition</h4><p className="mk-deal-amount">$500,000 <span>allocation</span></p>
          <div className="mk-source-quote"><span>Source message · Morgan Ellis</span><p>“{proposal}”</p></div>
          <div className="mk-review-status" aria-live="polite">{review === 'filed' ? 'You chose to put this deal on the desk.' : review === 'dismissed' ? 'You chose to leave this suggestion out.' : 'Review the context before making it a deal.'}</div>
          {review === 'pending' ? <div className="mk-demo-actions"><button type="button" className="mk-button mk-button-small" onClick={() => setReview('filed')}>File sample deal</button><button type="button" className="mk-button mk-button-small mk-button-quiet" onClick={() => setReview('dismissed')}>Dismiss</button></div> : <button className="mk-demo-action" type="button" onClick={() => setReview('pending')}>Reset the example</button>}
        </div>}
        {active === 2 && <div className="mk-contact-card">
          <div className="mk-person-row"><span className="mk-avatar mk-avatar-large">ME</span><div><strong>Morgan Ellis</strong><span>Details shared in an introduction</span></div></div>
          <dl><div><dt>Company</dt><dd>Oak Street Partners</dd></div><div><dt>Email</dt><dd>morgan@example.com</dd></div></dl>
          <details className="mk-source-details"><summary>See the source message <span aria-hidden="true">+</span></summary><p>“{intro}”</p></details>
          <p className="mk-scene-note">Review the source and edit contact details in your Rolodex.</p>
        </div>}
        {active === 3 && <div className="mk-documents-scene">
          <div className="mk-document-contacts"><span className="mk-kicker">Recipient details</span><strong>Morgan Ellis</strong><span>Oak Street Partners</span><label>Sample email<input readOnly value="morgan@example.com" onFocus={event => event.currentTarget.select()} /></label><button className="mk-demo-action" type="button" onClick={() => copy('morgan@example.com')}>Copy sample email <span aria-hidden="true">⧉</span></button><p className="mk-copy-status" role="status">{copied || 'Your available contact details, ready to use.'}</p></div>
          <div className="mk-document-preview" aria-label="Illustration of document preparation"><div className="mk-document-app">DocuSign <span>Your account</span></div><div className="mk-paper"><span className="mk-paper-label">INVESTMENT TERMS</span><div className="mk-paper-title">Oak Street<br />Partners</div><div className="mk-paper-rule" /><div className="mk-paper-line" /><div className="mk-paper-line" /><div className="mk-paper-line mk-paper-line-short" /><div className="mk-paper-signature">Recipient name</div><span className="mk-paper-footer">Illustrative document</span></div></div>
        </div>}
      </div>
    </div>
    <p className="mk-demo-caption">Sample data for illustration. This demo does not connect accounts, file real deals, or open a DocuSign session.</p>
  </div>;
}
