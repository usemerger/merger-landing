import Link from 'next/link';
import { notFound } from 'next/navigation';
import PlaybooksChrome, { JoinPanel } from '../../playbooks/PlaybooksChrome';
import Inline from '../../playbooks/Inline';
import { getArticle } from '../../playbooks/content';
import { getVertical, verticals } from '../verticals';
import { jsonLdScript, SITE } from '../../lib/seo';
import '../../playbooks/playbooks.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return verticals.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) return {};
  const url = `${SITE}/for/${v.slug}`;
  return {
    title: { absolute: v.title },
    description: v.description,
    alternates: { canonical: url },
    openGraph: { title: v.title, description: v.description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title: v.title, description: v.description },
  };
}

const plain = (text) => text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

export default async function VerticalPage({ params }) {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) notFound();
  const url = `${SITE}/for/${v.slug}`;
  const playbook = getArticle(v.playbook);
  const related = v.related.map(getArticle).filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#page`, url, name: v.title, description: v.description, about: { '@id': `${SITE}/#app` }, audience: { '@type': 'BusinessAudience', audienceType: v.name }, publisher: { '@id': `${SITE}/#organization` }, inLanguage: 'en-US' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Merger', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Who it’s for', item: `${SITE}/for` },
        { '@type': 'ListItem', position: 3, name: v.name, item: url },
      ] },
      { '@type': 'FAQPage', mainEntity: v.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: plain(a) } })) },
    ],
  };

  return <PlaybooksChrome>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
    <article className="pb-article">
      <nav className="pb-crumbs" aria-label="Breadcrumb"><Link href="/for">Who it’s for</Link><span aria-hidden="true">/</span><span>{v.name}</span></nav>
      <header className="pb-article-head">
        <p className="pb-card-meta"><span>Merger for</span><span>{v.name}</span></p>
        <h1>{v.headline}</h1>
        <p className="pb-dek">{v.intro}</p>
      </header>
      <div className="pb-body">
        <section aria-labelledby="pains-h">
          <h2 id="pains-h">Where it breaks today</h2>
          <ol className="pb-steps">{v.pains.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol>
        </section>
        <section aria-labelledby="fit-h">
          <h2 id="fit-h">How Merger helps</h2>
          <ul className="pb-list">{v.fit.map((item) => <li key={item}><Inline text={item} /></li>)}</ul>
          <aside className="pb-callout"><strong>Worth knowing</strong><p>Available networks, history and messaging actions vary by service. Claude features use your own Anthropic API key, billed by Anthropic. DocuSign access is through your own account.</p></aside>
        </section>
        {playbook && <section aria-labelledby="walk-h">
          <h2 id="walk-h">See a deal end to end</h2>
          <p><Link href={`/playbooks/${playbook.slug}`}>{playbook.title}</Link>: {playbook.dek}</p>
        </section>}
        <section aria-labelledby="faq-h">
          <h2 id="faq-h">Questions {v.name.toLowerCase()} ask</h2>
          {v.faqs.map(([q, a]) => <div key={q} className="pb-faq"><h3>{q}</h3><p><Inline text={a} /></p></div>)}
        </section>
      </div>
    </article>
    <JoinPanel />
    {related.length > 0 && <section className="pb-group pb-related" aria-labelledby="related-h">
      <div className="pb-group-head"><h2 id="related-h">Keep reading</h2></div>
      <div className="pb-grid">{related.map((a) => <Link key={a.slug} className="pb-card" href={`/playbooks/${a.slug}`}>
        <span className="pb-card-meta"><span>{a.type}</span><span>{a.audience}</span></span>
        <h3>{a.title}</h3>
        <span className="pb-card-foot">{a.readMinutes} min read <span aria-hidden="true">→</span></span>
      </Link>)}</div>
    </section>}
  </PlaybooksChrome>;
}
