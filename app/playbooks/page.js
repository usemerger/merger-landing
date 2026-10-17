import Link from 'next/link';
import PlaybooksChrome, { JoinPanel } from './PlaybooksChrome';
import { articles, TYPES } from './content';
import './playbooks.css';

export const metadata = {
  title: 'Playbooks for dealmakers',
  description:
    'Workflows, guides and comparisons for brokers, syndicators, searchers and investors whose deals start in WhatsApp, Telegram, LinkedIn and Slack.',
  alternates: { canonical: 'https://usemerger.com/playbooks' },
  openGraph: {
    title: 'Merger Playbooks',
    description: 'How dealmakers run deals that start in messaging apps.',
    url: 'https://usemerger.com/playbooks',
    type: 'website',
  },
};

const GROUPS = [
  { types: [TYPES.useCase], id: 'use-cases', title: 'Use cases', blurb: 'One deal, start to finish, by the kind of dealmaker running it.' },
  { types: [TYPES.guide], id: 'guides', title: 'Guides', blurb: 'Practical methods for deals that live in messaging apps.' },
  { types: [TYPES.list], id: 'lists', title: 'Lists', blurb: 'Quick, practical fixes you can use today.' },
  { types: [TYPES.comparison], id: 'comparisons', title: 'Comparisons', blurb: 'How Merger sits next to the tools you already know.' },
];

function Card({ article }) {
  return <Link className="pb-card" href={`/playbooks/${article.slug}`}>
    <span className="pb-card-meta"><span>{article.type}</span><span>{article.audience}</span></span>
    <h3>{article.title}</h3>
    <p>{article.dek}</p>
    <span className="pb-card-foot">{article.readMinutes} min read <span aria-hidden="true">→</span></span>
  </Link>;
}

export default function PlaybooksPage() {
  const [lead, ...rest] = articles;
  return <PlaybooksChrome>
    <header className="pb-hero">
      <p className="pb-eyebrow"><span className="pb-dot" /> Playbooks</p>
      <h1>Deals start in conversations.<br /><span>Here is how to run them there.</span></h1>
      <p>Workflows, guides and comparisons for brokers, syndicators, searchers and investors whose deals begin in WhatsApp, Telegram, LinkedIn and Slack.</p>
    </header>

    <section className="pb-lead" aria-label="Featured">
      <Link className="pb-card pb-card-lead" href={`/playbooks/${lead.slug}`}>
        <span className="pb-card-meta"><span>{lead.type}</span><span>{lead.audience}</span></span>
        <h2>{lead.title}</h2>
        <p>{lead.dek}</p>
        <span className="pb-card-foot">{lead.readMinutes} min read <span aria-hidden="true">→</span></span>
      </Link>
    </section>

    {GROUPS.map((group) => {
      const items = rest.filter((article) => group.types.includes(article.type));
      if (!items.length) return null;
      return <section key={group.id} className="pb-group" aria-labelledby={`pb-${group.id}`}>
        <div className="pb-group-head"><h2 id={`pb-${group.id}`}>{group.title}</h2><p>{group.blurb}</p></div>
        <div className="pb-grid">{items.map((article) => <Card key={article.slug} article={article} />)}</div>
      </section>;
    })}

    <p className="pb-disclosure">Playbooks are published by Merger. Use-case walkthroughs are illustrative composites with invented names and figures, not customer stories.</p>
    <JoinPanel />
  </PlaybooksChrome>;
}
