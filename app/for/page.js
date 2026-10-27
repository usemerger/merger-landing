import Link from 'next/link';
import PlaybooksChrome, { JoinPanel } from '../playbooks/PlaybooksChrome';
import { verticals } from './verticals';
import { jsonLdScript, SITE } from '../lib/seo';
import '../playbooks/playbooks.css';

export const metadata = {
  title: 'Who Merger is for',
  description: 'Merger is built for dealmakers whose deals start in messaging apps: business brokers, searchers, secondaries brokers, syndicators, family offices, PE and venture investors.',
  alternates: { canonical: `${SITE}/for` },
  openGraph: { title: 'Who Merger is for', description: 'Dealmakers whose deals start in WhatsApp, Telegram, LinkedIn and Slack.', url: `${SITE}/for`, type: 'website' },
};

export default function ForHub() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Who Merger is for',
    url: `${SITE}/for`,
    description: metadata.description,
    publisher: { '@id': `${SITE}/#organization` },
    mainEntity: { '@type': 'ItemList', itemListElement: verticals.map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/for/${v.slug}`, name: v.title })) },
  };
  return <PlaybooksChrome>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
    <header className="pb-hero">
      <p className="pb-eyebrow"><span className="pb-dot" /> Who it’s for</p>
      <h1>Built for deals that start<br /><span>in a conversation.</span></h1>
      <p>Merger is a unified inbox and deal desk for dealmakers whose deals begin in WhatsApp, Telegram, LinkedIn and Slack. Pick the one closest to how you work.</p>
    </header>
    <section className="pb-group" aria-label="Dealmakers">
      <div className="pb-grid">{verticals.map((v) => <Link key={v.slug} className="pb-card" href={`/for/${v.slug}`}>
        <span className="pb-card-meta"><span>Merger for</span><span>{v.name}</span></span>
        <h3>{v.headline}</h3>
        <p>{v.description}</p>
        <span className="pb-card-foot">Read more <span aria-hidden="true">→</span></span>
      </Link>)}</div>
    </section>
    <JoinPanel />
  </PlaybooksChrome>;
}
