// RSS 2.0 for /playbooks/rss.xml. Pure so tests can parse exactly what ships.
//
// Social schedulers (Metricool's RSS autolist) read each item's link, title,
// description and image. The <merger:share> block carries per-network copy
// for our own pipeline; readers that do not know the namespace ignore it.

export const SITE = 'https://usemerger.com';
export const FEED_PATH = '/playbooks/rss.xml';
export const SHARE_NS = 'https://usemerger.com/ns/playbooks-share/1.0';
const SHARE_FIELDS = ['hook', 'x', 'threads', 'linkedin'];

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

export const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Site-relative paths ("/playbooks/x.png") become absolute; absolute URLs pass through. */
export const absoluteUrl = (href) => (/^https?:\/\//.test(href) ? href : `${SITE}${href.startsWith('/') ? '' : '/'}${href}`);

export const articleUrl = (article) => `${SITE}/playbooks/${article.slug}`;

/** RFC 822 date for pubDate. ISO dates without a time are read as UTC midnight. */
function rfc822(iso) {
  const date = new Date(/T/.test(iso) ? iso : `${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

const imageType = (href) => MIME[href.split('?')[0].split('.').pop().toLowerCase()] || 'image/jpeg';

function item(article) {
  const url = articleUrl(article);
  const lines = [
    `<title>${escapeXml(article.title)}</title>`,
    `<link>${escapeXml(url)}</link>`,
    `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
  ];
  const pubDate = article.published && rfc822(article.published);
  if (pubDate) lines.push(`<pubDate>${pubDate}</pubDate>`);
  lines.push(`<description>${escapeXml(article.dek || article.description)}</description>`);
  if (article.type) lines.push(`<category>${escapeXml(article.type)}</category>`);
  if (article.image) {
    const src = escapeXml(absoluteUrl(article.image));
    const type = imageType(article.image);
    // enclosure requires a length; 0 means "unknown" and is what most feeds send.
    lines.push(`<enclosure url="${src}" length="0" type="${type}"/>`);
    lines.push(`<media:content url="${src}" medium="image" type="${type}"/>`);
  }
  const share = article.share && SHARE_FIELDS.filter((key) => typeof article.share[key] === 'string' && article.share[key]);
  if (share?.length) {
    lines.push(`<merger:share>${share.map((key) => `<merger:${key}>${escapeXml(article.share[key])}</merger:${key}>`).join('')}</merger:share>`);
  }
  return `<item>${lines.join('')}</item>`;
}

/** Newest first; articles published the same day keep file order. */
export function feedArticles(list) {
  return list.map((article, index) => ({ article, index }))
    .sort((a, b) => (b.article.published || '').localeCompare(a.article.published || '') || a.index - b.index)
    .map(({ article }) => article);
}

export function buildFeed(list) {
  const items = feedArticles(list);
  const latest = items.find((article) => article.published);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:merger="${SHARE_NS}">`,
    '<channel>',
    '<title>Merger Playbooks</title>',
    `<link>${SITE}/playbooks</link>`,
    '<description>How dealmakers run deals that start in messaging apps.</description>',
    '<language>en-us</language>',
    `<atom:link href="${SITE}${FEED_PATH}" rel="self" type="application/rss+xml"/>`,
    latest ? `<lastBuildDate>${rfc822(latest.updated || latest.published)}</lastBuildDate>` : '',
    ...items.map(item),
    '</channel>',
    '</rss>',
    '',
  ].filter(Boolean).join('\n');
}
