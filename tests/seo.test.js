import { describe, expect, it } from 'vitest';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { faqs } from '../app/landingContent';
import { llmsFull, llmsIndex } from '../app/lib/llmsText';
import { homeJsonLd, DEFINITION, SHORT_DESCRIPTION } from '../app/lib/seo';
import { articles, ILLUSTRATIVE_NOTE } from '../app/playbooks/content';
import { ALPHA_OFFER, ANNUAL_OFFER } from '../app/lib/billingOffer';

const BANNED = [/end-to-end/i, /\bencrypt/i, /automatically (files|sends)/i, /\bmac(os)?\b app/i, /free trial/i, /14-day/i];

describe('robots.txt', () => {
  const r = robots();
  it('points at the sitemap and keeps private routes out', () => {
    expect(r.sitemap).toBe('https://usemerger.com/sitemap.xml');
    for (const rule of r.rules) {
      expect(rule.allow).toBe('/');
      expect(rule.disallow).toEqual(expect.arrayContaining(['/api/', '/admin', '/dashboard']));
      // Must stay crawlable so their noindex header is seen.
      expect(rule.disallow).not.toContain('/signup');
    }
  });
  it('names the AI answer engines explicitly', () => {
    const agents = r.rules.flatMap((rule) => [].concat(rule.userAgent));
    for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'GPTBot', 'ClaudeBot']) expect(agents).toContain(bot);
  });
});

describe('sitemap', () => {
  it('lists every Playbook and no account page', () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const a of articles) expect(urls).toContain(`https://usemerger.com/playbooks/${a.slug}`);
    expect(urls.some((u) => /\.com\/(signup|login|dashboard|admin|book)\b/.test(u))).toBe(false);
  });
});

describe('llms.txt', () => {
  const index = llmsIndex();
  const full = llmsFull(ILLUSTRATIVE_NOTE);
  it('opens with the name and the definition, per llmstxt.org', () => {
    expect(index.startsWith(`# Merger\n\n> ${DEFINITION}`)).toBe(true);
  });
  it('links every Playbook with an absolute URL', () => {
    for (const a of articles) expect(index).toContain(`(https://usemerger.com/playbooks/${a.slug})`);
    expect(full).not.toMatch(/\]\(\//);
  });
  it('quotes the live prices and nothing retired', () => {
    for (const text of [index, full]) {
      expect(text).toContain(`${ALPHA_OFFER.priceLabel} USD/month`);
      expect(text).toContain(ANNUAL_OFFER.priceLabel);
      for (const pattern of BANNED) expect(text).not.toMatch(pattern);
      expect(text).toMatch(/iMessage are not supported/);
    }
  });
  it('labels illustrative walkthroughs', () => {
    const illustrative = articles.filter((a) => a.illustrative).length;
    expect(full.split(ILLUSTRATIVE_NOTE).length - 1).toBe(illustrative);
  });
});

describe('homepage structured data', () => {
  const graph = homeJsonLd(faqs.map((f) => ({ ...f, answer: f.answer || 'price' })))['@graph'];
  it('describes the organisation, the app and the FAQ', () => {
    expect(graph.map((n) => n['@type'])).toEqual(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']);
    const app = graph[2];
    expect(app.operatingSystem).toBe('Windows, iOS');
    expect(app.offers.map((o) => o.price)).toEqual([ALPHA_OFFER.priceLabel.slice(1), ANNUAL_OFFER.priceLabel.slice(1)]);
    expect(graph[3].mainEntity).toHaveLength(faqs.length);
  });
  it('keeps descriptions inside the claim rules', () => {
    for (const text of [DEFINITION, SHORT_DESCRIPTION, JSON.stringify(graph)]) {
      for (const pattern of BANNED) expect(text).not.toMatch(pattern);
    }
    expect(SHORT_DESCRIPTION.length).toBeLessThanOrEqual(170);
  });
});
