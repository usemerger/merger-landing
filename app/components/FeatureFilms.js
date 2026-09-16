'use client';

import { useEffect, useRef, useState } from 'react';
import './feature-films.css';

const films = [
  {
    id: 'channels', label: 'One inbox', title: 'Every channel. One workspace.', duration: '16 seconds',
    description: 'See connected channels come together, reply to a conversation, and keep its deal context beside it.',
    steps: ['Connect your messaging accounts.', 'Read and reply from one workspace.', 'Keep the conversation linked to its deal.'],
    note: 'Available networks and messaging actions vary by service during alpha.',
  },
  {
    id: 'deals', label: 'AI deal detection', title: 'Turn a conversation into a next step.', duration: '18 seconds',
    description: 'Claude finds a potential deal in the conversation and shows the source. You decide what belongs on the Deal Desk.',
    steps: ['Claude scans connected messages for opportunities.', 'Review the suggestion and its source message.', 'Approve the deal to add it to your desk.'],
    note: 'Requires your own Anthropic API key. Anthropic bills API usage separately.',
  },
  {
    id: 'documents', label: 'People & paperwork', title: 'Keep the people beside the paperwork.', duration: '20 seconds',
    description: 'Use the deal’s contact details beside your own DocuSign account, prepare the recipients, and review before sending.',
    steps: ['See who is involved in the deal.', 'Copy recipient details from the Rolodex into DocuSign.', 'Review and send from your own DocuSign account.'],
    note: 'Your DocuSign account is separate. You control sending and signing.',
  },
];

function Film({ film }) {
  const video = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = video.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let pausedByUser = false;
    const sync = () => {
      if (!inView || document.hidden || reducedMotion.matches) element.pause();
      else if (!pausedByUser) element.play().catch(() => {});
    };
    const onPause = () => {
      if (inView && !document.hidden && !reducedMotion.matches) pausedByUser = true;
    };
    const onPlay = () => { pausedByUser = false; };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0.3 });
    observer.observe(element);
    element.addEventListener('pause', onPause);
    element.addEventListener('play', onPlay);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      element.removeEventListener('pause', onPause);
      element.removeEventListener('play', onPlay);
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      element.pause();
    };
  }, []);

  return <>
    <div className="mk-film-screen">
      <video ref={video} controls muted playsInline loop preload="none"
        width="1440" height="900" poster={`/feature-films/${film.id}-poster.webp`}
        aria-label={`${film.title} Animated product illustration, ${film.duration}.`}
        aria-describedby={`film-steps-${film.id}`} onError={() => setUnavailable(true)}>
        <source src={`/feature-films/${film.id}.mp4`} type="video/mp4" />
        <p>Your browser cannot play this video. <a href={`/feature-films/${film.id}.mp4`}>Open the animation</a>.</p>
      </video>
    </div>
    {unavailable && <p role="status" className="mk-film-note">The animation could not load. <a href={`/feature-films/${film.id}.mp4`}>Try opening the video directly</a>, or follow the steps below.</p>}
    <div className="mk-film-context">
      <div><h3>{film.title}</h3><p>{film.description}</p></div>
      <ol id={`film-steps-${film.id}`}>{film.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </div>
    <p className="mk-film-note">{film.note}</p>
  </>;
}

export default function FeatureFilms() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  function moveTab(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % films.length;
    if (event.key === 'ArrowLeft') next = (index + films.length - 1) % films.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = films.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  }
  const film = films[active];
  return <div className="mk-films">
    <div className="mk-film-tabs" role="tablist" aria-label="Watch Merger in action">
      {films.map((item, index) => <button key={item.id} type="button" role="tab"
        id={`film-tab-${item.id}`} aria-controls="film-panel" aria-selected={index === active}
        tabIndex={index === active ? 0 : -1} ref={element => { tabs.current[index] = element; }}
        onClick={() => setActive(index)} onKeyDown={event => moveTab(event, index)}>
        <span>0{index + 1}</span>{item.label}
      </button>)}
    </div>
    <div id="film-panel" role="tabpanel" aria-labelledby={`film-tab-${film.id}`} tabIndex={0}>
      <Film key={film.id} film={film} />
    </div>
    <p className="mk-film-disclosure">Illustrative workflows with sample data. Use the video controls to pause, replay, or watch full screen.</p>
  </div>;
}
