import { SITE } from './lib/seo';

// /robots.txt
//
// Search engines and AI assistants are welcome on every public page. The
// training-only crawlers are listed by name so the choice is explicit and
// easy to flip; the ones that fetch pages to answer a user's question
// (ChatGPT search, Claude, Perplexity) are what put Merger into answers, so
// they stay allowed either way.
//
// Account, admin and API routes are disallowed. Sign-up, sign-in and the
// other thin account pages stay crawlable on purpose: they send a noindex
// header (next.config.js), and a crawler can only see that header if it is
// allowed to fetch the page.

const PRIVATE = ['/api/', '/admin', '/dashboard', '/billing', '/profile', '/desktop/', '/auth/', '/invite', '/reset-password', '/verify-email'];

const AI_AGENTS = [
  // Fetch pages to answer a person's question. Allowing these is how Merger
  // gets cited in ChatGPT, Claude, Perplexity and Copilot answers.
  'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User',
  // Model training and Google's AI features. Allowed so models learn what
  // Merger is; remove any of these to opt out.
  'GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
