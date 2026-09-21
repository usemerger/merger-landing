'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './channel-orbit.css';

export const CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', color: '#76cfa2', person: 'Mia Chen', initials: 'MC', message: 'The owner is ready to talk. Can I send the details?', reply: 'Absolutely. Let’s keep the next steps together.', preview: 'The owner is ready to talk.' },
  { id: 'instagram', name: 'Instagram', color: '#d9a1b9', person: 'Alex Rivera', initials: 'AR', message: 'I have an introduction that could be a good fit.', reply: 'Send it through. I’ll take a look.', preview: 'An introduction for you.' },
  { id: 'telegram', name: 'Telegram', color: '#8bbcdf', person: 'Sam Parker', initials: 'SP', message: 'The acquisition brief is ready for your review.', reply: 'Received. I’ll add it to the deal.', preview: 'The acquisition brief is ready.' },
  { id: 'discord', name: 'Discord', color: '#a2a8ee', person: 'Jordan Lee', initials: 'JL', message: 'Let’s get everyone involved in the same discussion.', reply: 'I have the conversation right here.', preview: 'Let’s bring everyone in.' },
  { id: 'slack', name: 'Slack', color: '#c5a4cc', person: 'Casey Morgan', initials: 'CM', message: 'The team has finished reviewing the proposal.', reply: 'Great. I’ll keep the next step on the desk.', preview: 'The proposal has been reviewed.' },
  { id: 'linkedin', name: 'LinkedIn', color: '#94b8da', person: 'Theo James', initials: 'TJ', message: 'Would you be open to an introduction to the founder?', reply: 'Yes, that sounds like a useful conversation.', preview: 'An introduction to the founder.' },
  { id: 'x', name: 'X', color: '#d4d8df', person: 'Taylor Reed', initials: 'TR', message: 'Following up on the opportunity we discussed.', reply: 'Thanks. I have our conversation in view.', preview: 'Following up on our conversation.' },
  { id: 'line', name: 'LINE', color: '#a2ce9c', person: 'Jamie Kim', initials: 'JK', message: 'We can share the supplier details this afternoon.', reply: 'Perfect. I’ll keep them with the deal.', preview: 'Supplier details this afternoon.' },
  { id: 'signal', name: 'Signal', color: '#a5b9ed', person: 'Riley Ellis', initials: 'RE', message: 'The terms are ready. Is tomorrow a good time?', reply: 'Tomorrow works. Let’s review them together.', preview: 'The terms are ready to review.' },
  { id: 'messenger', name: 'Messenger', color: '#aaacec', person: 'Drew Brooks', initials: 'DB', message: 'Can we pick up where we left off on the proposal?', reply: 'Of course. Everything is still here.', preview: 'Picking up on the proposal.' },
];

const MARK = 'm40 4-17 48 17 4 17-4L40 4Zm-4 2L4 42l16 10L36 6Zm8 0 32 36-16 10L44 6ZM6 46l14 10 16 36L6 46Zm17 11 15 3v36L23 57Zm19 3 15-3-15 39V60Zm18-4 14-10-30 46 16-36Z';

/** Small inline marks: no icon font, remote image, or second rendering engine. */
export function ChannelIcon({ channel, size = 24 }) {
  if (channel === 'merger') return <svg width={size} height={size} viewBox="0 0 80 100" aria-hidden="true" focusable="false"><path d={MARK} fill="currentColor" /></svg>;
  let shape;
  switch (channel) {
    case 'whatsapp': shape = <><path d="M5.1 19.2 3 21l.7-4.4a9 9 0 1 1 3.1 3.3Z" /><path d="M8.4 6.6c-.6 0-1.4 1-1.4 2.1 0 3.6 4.9 7.9 7.7 7.9 1.1 0 2.3-1 2.4-1.7l-2.6-1.4-1.3 1c-1.9-.8-3.1-2-3.9-3.8l.9-1.2-1.2-2.9Z" /></>; break;
    case 'instagram': shape = <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" /></>; break;
    case 'telegram': shape = <path fill="currentColor" stroke="none" d="m21.1 4.3-3.2 15.1c-.2 1.1-.9 1.4-1.7.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.5 13.2.7 11.7c-1-.3-1-1 .2-1.5L19.6 3c.9-.3 1.7.2 1.5 1.3Z" />; break;
    case 'discord': shape = <><path d="m7.1 5.7.6-1.2m8.6 0 .6 1.2M7.1 5.7c-1.4.4-2.6 1-3.3 1.5C2.2 10.7 1.7 13.7 2 17c1.6 1.2 3.4 2 5.2 2.4l1.2-1.8m8.5-11.9c1.4.4 2.6 1 3.3 1.5 1.6 3.5 2.1 6.5 1.8 9.8-1.6 1.2-3.4 2-5.2 2.4l-1.2-1.8M7.1 5.7a19.8 19.8 0 0 1 9.8 0M6.5 16.7a12.5 12.5 0 0 0 11 0" /><ellipse cx="8" cy="12.5" rx="1.5" ry="1.8" fill="currentColor" stroke="none" /><ellipse cx="16" cy="12.5" rx="1.5" ry="1.8" fill="currentColor" stroke="none" /></>; break;
    case 'slack': shape = <g strokeWidth="3.5"><path d="M9 3v7M3 9h2M15 3v2M14 9h7M21 15h-2M15 14v7M9 21v-2M10 15H3" /></g>; break;
    case 'linkedin': shape = <><rect x="2.5" y="2.5" width="19" height="19" rx="2.5" /><path d="M7.1 10v7.5M11.5 17.5V10m0 3.2c0-4.5 6-4.5 6 0v4.3" strokeWidth="2" /><circle cx="7.1" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></>; break;
    case 'x': shape = <><path d="m4 3 12.4 18H21L8.6 3H4Z" /><path d="M20.5 3 3.5 21" /></>; break;
    case 'line': shape = <><path d="M21.5 10.2c0 5.1-5.5 9.2-10.8 11.1l.7-3.3C6 18 2.5 14.6 2.5 10.2c0-4.4 4.2-7.7 9.5-7.7s9.5 3.3 9.5 7.7Z" /><path d="M6 8v4h2M10 8v4m2 0V8l2 4V8m4 0h-2v4h2m-2-2h1.5" strokeWidth=".9" /></>; break;
    case 'signal': shape = <><circle cx="12" cy="11.3" r="9.7" strokeDasharray="1.7 2" /><path d="M7 19.5 2.8 21l1-4.1M18.9 11.3a6.9 6.9 0 0 1-10.4 6l-2.8.8.7-2.8a6.9 6.9 0 1 1 12.5-4Z" /></>; break;
    case 'messenger': shape = <><path d="M21.8 11.1c0 5-4.4 8.8-9.8 8.8-1 0-2-.1-2.9-.4L5.7 22v-4.1A8.4 8.4 0 0 1 2.2 11C2.2 6.1 6.6 2.2 12 2.2s9.8 3.9 9.8 8.9Z" /><path fill="currentColor" stroke="none" d="m5.4 14.3 5.2-5.6 3.2 2.4 4.8-2.4-5.2 5.6-3.2-2.4-4.8 2.4Z" /></>; break;
    default: shape = <circle cx="12" cy="12" r="8" />;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shape}</svg>;
}

const formation = [[340, 60], [462, 156], [584, 252], [505, 320], [422, 388], [340, 455], [258, 388], [175, 320], [96, 252], [218, 156]];
const smooth = (a, b, value) => { const x = Math.max(0, Math.min(1, (value - a) / (b - a))); return x * x * (3 - 2 * x); };
// Math.sin/cos may differ in their final bits between Node and browser engines.
// Stable serialized coordinates keep the server-rendered first frame hydratable.
const coordinate = (value) => value.toFixed(3);

function geometry(time, index) {
  const cycle = time % 28;
  const gathering = smooth(11, 16, cycle) * (1 - smooth(19, 25, cycle));
  // A shared angular velocity keeps the controls separated as they orbit.
  // Counter-orbiting buttons collide at the intersections and become unclickable.
  const angle = index * Math.PI * .2 + time * .066 - 1.1;
  const radius = index % 2 ? 253 : 240;
  const orbitX = Math.cos(angle) * radius;
  const orbitY = Math.sin(angle) * 177;
  const tilt = .1;
  const x = 340 + orbitX * Math.cos(tilt) - orbitY * Math.sin(tilt);
  const y = 252 + orbitX * Math.sin(tilt) + orbitY * Math.cos(tilt);
  // Choose the nearest ordered diamond slot for this cycle, keeping the
  // channels from flying through one another on their way to the mark.
  const phaseAtGather = (Math.floor(time / 28) * 28 + 14) * .066 - 1.1;
  const slotShift = Math.round((phaseAtGather + Math.PI / 2) / (Math.PI * .2));
  const target = formation[((index + slotShift) % 10 + 10) % 10];
  return { x: x + (target[0] - x) * gathering, y: y + (target[1] - y) * gathering, gathering, depth: (Math.sin(angle) + 1) / 2 };
}

function orbitLayout(time) {
  const points = CHANNELS.map((_, index) => geometry(time, index));
  // Interpolating an ellipse into a diamond can bring adjacent labels close.
  // A small deterministic separation keeps symbols and tap targets legible.
  for (let pass = 0; pass < 4; pass += 1) {
    points.forEach((point, index) => {
      for (let j = 0; j < index; j += 1) {
        const other = points[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 102) {
          const push = (102 - distance) / distance / 2;
          point.x += dx * push; point.y += dy * push;
          other.x -= dx * push; other.y -= dy * push;
        }
      }
    });
  }
  return points;
}

function PreviewInbox({ selected }) {
  const active = CHANNELS.find((channel) => channel.id === selected) || CHANNELS[0];
  const rows = selected === 'all' ? [CHANNELS[0], CHANNELS[5], CHANNELS[2]] : [active];
  return <div className="co-inbox" aria-label="Sample unified inbox">
    <div className="co-inbox-bar"><span className="co-window-dots" aria-hidden="true"><i /><i /><i /></span><span>MERGER / MESSAGES</span><span className="co-demo-badge">Demo</span></div>
    <div className="co-inbox-heading"><div><p>ONE SHARED WORKSPACE</p><h3>{selected === 'all' ? 'All conversations' : active.name}</h3></div><span className="co-inbox-symbol"><ChannelIcon channel={selected === 'all' ? 'merger' : active.id} size={24} /></span></div>
    <div className="co-conversation-list" key={`rows-${selected}`}>
      {rows.map((row, index) => <div className={`co-conversation-row${index === 0 ? ' is-active' : ''}`} key={row.id}>
        <span className="co-avatar" style={{ '--channel-color': row.color }}>{row.initials}<span className="co-avatar-channel"><ChannelIcon channel={row.id} size={11} /></span></span>
        <div><strong>{row.person}</strong><span>{row.preview}</span></div><span className="co-row-time">{index ? `${index + 1}m` : 'now'}</span>
      </div>)}
      {selected !== 'all' && <p className="co-filter-note">One channel in focus. All your context stays here.</p>}
    </div>
    <div className="co-thread" key={`thread-${selected}`}>
      <div className="co-thread-label"><span style={{ color: active.color }}><ChannelIcon channel={active.id} size={14} /></span>{active.person}<span>· {active.name}</span></div>
      <p className="co-bubble co-bubble-in">{active.message}</p>
      <p className="co-bubble co-bubble-out">{active.reply}</p>
      <span className="co-sent-label">You · in Merger</span>
      <div className="co-composer" aria-hidden="true"><span>+</span><span>Reply on {active.name}…</span><span className="co-composer-send"><svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="m4 15 12-5L4 5l2.5 5L4 15Zm2.5-5H16" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg></span></div>
    </div>
    <div className="co-inbox-foot"><span className="co-tiny-diamond" />One place to read, reply, and move forward.</div>
  </div>;
}

/** A self-contained, local-only product illustration. `paused` can be driven by a page-level motion switch. */
export default function ChannelOrbit({ paused = false }) {
  const uid = useId().replace(/:/g, '');
  const root = useRef(null);
  const nodes = useRef([]);
  const tethers = useRef([]);
  const motes = useRef([]);
  const core = useRef(null);
  const phaseLabel = useRef(null);
  const clock = useRef(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const [selected, setSelected] = useState('all');
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let last = 0;
    const draw = () => {
      const time = clock.current;
      let gathering = 0;
      orbitLayout(time).forEach((point, i) => {
        gathering = point.gathering;
        const node = nodes.current[i];
        if (node) {
          node.style.left = `${coordinate(point.x / 6.8)}%`;
          node.style.top = `${coordinate(point.y / 5.2)}%`;
          node.style.zIndex = `${3 + Math.round(point.depth * 5)}`;
          node.style.setProperty('--node-depth', `${.93 + point.depth * .08}`);
        }
        const line = tethers.current[i];
        if (line) { line.setAttribute('x2', coordinate(point.x)); line.setAttribute('y2', coordinate(point.y)); line.setAttribute('opacity', .07 + gathering * .23); }
        const particle = motes.current[i];
        if (particle) {
          const progress = (time * .17 + i * .137) % 1;
          particle.setAttribute('cx', point.x + (340 - point.x) * progress);
          particle.setAttribute('cy', point.y + (252 - point.y) * progress);
          particle.setAttribute('opacity', Math.sin(progress * Math.PI) * (.4 + gathering * .5));
        }
      });
      if (core.current) { core.current.setAttribute('transform', `rotate(${time * 5} 340 252)`); core.current.style.opacity = `${.3 + gathering * .55}`; }
      if (phaseLabel.current) phaseLabel.current.textContent = gathering > .75 ? 'Different channels. One center of gravity.' : gathering > .2 ? 'Everything finds its way together.' : 'Your conversations, in one orbit.';
    };
    const tick = (stamp) => {
      const running = visible && !document.hidden && !preference.matches && !paused && !userPaused && !hovered.current && !focused.current;
      if (running && last) clock.current += Math.min((stamp - last) / 1000, .05);
      last = stamp;
      if (running) draw();
      if (visible && !document.hidden && !preference.matches && !paused && !userPaused) frame = requestAnimationFrame(tick);
      else frame = 0;
    };
    const sync = () => {
      host.dataset.motion = paused || userPaused || preference.matches || !visible || document.hidden ? 'paused' : 'playing';
      cancelAnimationFrame(frame);
      last = 0;
      frame = 0;
      if (visible && !document.hidden && !preference.matches && !paused && !userPaused) frame = requestAnimationFrame(tick);
    };
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .08 }) : null;
    if (observer) observer.observe(host); else { visible = true; }
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    draw();
    sync();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, [paused, userPaused]);

  const active = CHANNELS.find((channel) => channel.id === selected);

  return <div className="channel-orbit" ref={root}>
    <div className="co-layout">
      <div className="co-system">
        <div className="co-universe" role="group" tabIndex={0} aria-label="Connected messaging animation" aria-description="Select a channel to preview it. Press Space on the animation to pause or resume its motion." onKeyDown={(event) => { if (event.target === event.currentTarget && event.key === ' ') { event.preventDefault(); setUserPaused(value => !value); } }} onPointerEnter={() => { hovered.current = true; }} onPointerLeave={() => { hovered.current = false; }} onFocusCapture={() => { focused.current = true; }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}>
          <svg className="co-orbit-lines" viewBox="0 0 680 520" aria-hidden="true">
            <defs><radialGradient id={`${uid}-aura`}><stop stopColor="#b38638" stopOpacity=".18" /><stop offset=".35" stopColor="#92631b" stopOpacity=".08" /><stop offset="1" stopColor="#92631b" stopOpacity="0" /></radialGradient><linearGradient id={`${uid}-ring`}><stop stopColor="#d4b779" stopOpacity=".08" /><stop offset=".5" stopColor="#d4b779" stopOpacity=".48" /><stop offset="1" stopColor="#d4b779" stopOpacity=".04" /></linearGradient></defs>
            <ellipse cx="340" cy="252" rx="270" ry="224" fill={`url(#${uid}-aura)`} />
            <g fill="none" stroke={`url(#${uid}-ring)`} strokeWidth=".75"><ellipse cx="340" cy="252" rx="247" ry="159" transform="rotate(14 340 252)" /><ellipse cx="340" cy="252" rx="247" ry="159" transform="rotate(-14 340 252)" /><ellipse cx="340" cy="252" rx="295" ry="202" strokeDasharray="2 9" opacity=".4" /></g>
            <g stroke="#d6b574" strokeWidth=".65">{CHANNELS.map((channel, i) => { const point = geometry(0, i); return <line key={channel.id} ref={(el) => { tethers.current[i] = el; }} x1="340" y1="252" x2={coordinate(point.x)} y2={coordinate(point.y)} opacity=".07" />; })}</g>
            <g fill="#ebcb8c">{CHANNELS.map((channel, i) => <circle key={channel.id} ref={(el) => { motes.current[i] = el; }} cx="340" cy="252" r={i % 3 ? 1.2 : 1.7} opacity="0" />)}</g>
            <g ref={core} fill="none" stroke="#e2be70" strokeWidth=".65" opacity=".4"><ellipse cx="340" cy="252" rx="94" ry="28" transform="rotate(-28 340 252)" /><ellipse cx="340" cy="252" rx="84" ry="35" transform="rotate(42 340 252)" /><circle cx="340" cy="252" r="54" strokeDasharray="1 7" /></g>
          </svg>
          <button className={`co-center${selected === 'all' ? ' is-selected' : ''}`} type="button" onClick={() => setSelected('all')} aria-label="Show all channels in Merger" aria-pressed={selected === 'all'}><span className="co-center-glow" /><ChannelIcon channel="merger" size={93} /><strong>merger</strong><span>All channels</span></button>
          {CHANNELS.map((channel, i) => { const point = geometry(0, i); return <button type="button" key={channel.id} className={`co-channel${selected === channel.id ? ' is-selected' : ''}`} ref={(el) => { nodes.current[i] = el; }} style={{ left: `${coordinate(point.x / 6.8)}%`, top: `${coordinate(point.y / 5.2)}%`, '--channel-color': channel.color }} aria-label={`Preview ${channel.name} in Merger`} aria-pressed={selected === channel.id} onClick={() => setSelected(channel.id)}><span className="co-channel-symbol"><ChannelIcon channel={channel.id} size={24} /></span><span className="co-channel-name">{channel.name}</span></button>; })}
          <span className="co-axis-label co-axis-label-top">INDEPENDENT CHANNELS</span><span className="co-axis-label co-axis-label-bottom">SHARED MOMENTUM</span>
        </div>
        <div className="co-system-caption"><span ref={phaseLabel}>Your conversations, in one orbit.</span><p>Choose a channel to see it in Merger.</p></div>
      </div>
      <div className="co-preview-column"><span className="co-preview-connector" aria-hidden="true" /><PreviewInbox selected={selected} /><p className="co-selection-note" role="status">{active ? `Showing a sample ${active.name} conversation.` : 'Sample conversations from connected channels.'} <button type="button" onClick={() => setSelected('all')} disabled={selected === 'all'}>Show all channels</button></p></div>
    </div>
    <p className="co-availability">Illustrative preview. Network availability and messaging actions vary by service during alpha.</p>
  </div>;
}
