import Link from 'next/link';
import { notFound } from 'next/navigation';
import PlaybooksChrome, { JoinPanel } from '../PlaybooksChrome';
import Inline from '../Inline';
import { articles, articleText, formatDate, getArticle, ILLUSTRATIVE_NOTE, relatedArticles } from '../content';
import '../playbooks.css';

const SITE = 'https://usemerger.com';

// Every article is known at build time; anything else is a 404, not a render.
export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `${SITE}/playbooks/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: { title: article.title, description: article.description, url, type: 'article', siteName: 'Merger', publishedTime: article.published, modifiedTime: article.updated || article.published, section: article.type, tags: [article.audience] },
    twitter: { card: 'summary_large_image', title: article.title, description: article.description },
  };
}

const anchor = (heading) => heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Block({ block }) {
  if (typeof block === 'string') return <p><Inline text={block} /></p>;
  if (block.type === 'list') return <ul className="pb-list">{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ul>;
  if (block.type === 'steps') return <ol className="pb-steps">{block.items.map((item, i) => <li key={i}><h3>{item.title}</h3><p><Inline text={item.text} /></p></li>)}</ol>;
  if (block.type === 'callout') return <aside className="pb-callout"><strong>{block.title}</strong><p><Inline text={block.text} /></p></aside>;
  if (block.type === 'table') return <div className="pb-table" role="region" aria-label="Comparison table" tabIndex={0}><table><thead><tr>{block.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>;
  return null;
}

export default async function PlaybookArticle({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE}/playbooks/${article.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.published,
        dateModified: article.updated || article.published,
        mainEntityOfPage: url,
        url,
        image: `${SITE}/opengraph-image`,
        articleSection: article.type,
        about: article.audience,
        wordCount: articleText(article).split(/\s+/).length,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        author: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Merger', url: SITE },
        publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Merger', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/merger-logo-gold.svg` } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Merger', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Playbooks', item: `${SITE}/playbooks` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };

  return <PlaybooksChrome>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <article className="pb-article">
      <nav className="pb-crumbs" aria-label="Breadcrumb"><Link href="/playbooks">Playbooks</Link><span aria-hidden="true">/</span><span>{article.type}</span></nav>
      <header className="pb-article-head">
        <p className="pb-card-meta"><span>{article.type}</span><span>{article.audience}</span></p>
        <h1>{article.title}</h1>
        <p className="pb-dek">{article.dek}</p>
        <p className="pb-byline">By Merger · <time dateTime={article.published}>{formatDate(article.published)}</time> · {article.readMinutes} min read</p>
        {article.illustrative && <p className="pb-illustrative">{ILLUSTRATIVE_NOTE}</p>}
      </header>

      <div className="pb-body">
        {article.sections.map((section) => <section key={section.heading} id={anchor(section.heading)} aria-labelledby={`${anchor(section.heading)}-h`}>
          <h2 id={`${anchor(section.heading)}-h`}>{section.heading}</h2>
          {section.blocks.map((block, i) => <Block key={i} block={block} />)}
        </section>)}

        {article.sources?.length > 0 && <section className="pb-sources" aria-labelledby="sources-h"><h2 id="sources-h">Sources</h2><ul>{article.sources.map((source) => <li key={source.href}><a href={source.href} rel="noopener">{source.label}</a> <span>· accessed {formatDate(source.accessed)}</span></li>)}</ul></section>}
      </div>
    </article>

    <JoinPanel />

    <section className="pb-group pb-related" aria-labelledby="related-h">
      <div className="pb-group-head"><h2 id="related-h">Keep reading</h2></div>
      <div className="pb-grid">{relatedArticles(article.slug).map((related) => <Link key={related.slug} className="pb-card" href={`/playbooks/${related.slug}`}>
        <span className="pb-card-meta"><span>{related.type}</span><span>{related.audience}</span></span>
        <h3>{related.title}</h3>
        <span className="pb-card-foot">{related.readMinutes} min read <span aria-hidden="true">→</span></span>
      </Link>)}</div>
    </section>
  </PlaybooksChrome>;
}
