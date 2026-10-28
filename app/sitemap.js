import { articles } from './playbooks/content';
import { verticals } from './for/verticals';

const SITE = 'https://usemerger.com';

// Bump when homepage, pricing or legal copy changes, so crawlers recheck.
const SITE_UPDATED = '2026-10-27';

// Public, indexable pages only. Account, auth, admin, invite and desktop pages
// are deliberately absent; several of them also send noindex headers.
export default function sitemap() {
  const pages = [
    { path: '/', priority: 1 },
    { path: '/for', priority: 0.8 },
    { path: '/playbooks', priority: 0.8 },
    { path: '/developers', priority: 0.5 },
    { path: '/support', priority: 0.4 },
    { path: '/privacy', priority: 0.2 },
    { path: '/terms', priority: 0.2 },
  ].map(({ path, priority }) => ({ url: `${SITE}${path}`, lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority }));

  const posts = articles.map((article) => ({
    url: `${SITE}/playbooks/${article.slug}`,
    lastModified: article.updated || article.published,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const audiences = verticals.map((v) => ({
    url: `${SITE}/for/${v.slug}`,
    lastModified: SITE_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...pages, ...audiences, ...posts];
}
