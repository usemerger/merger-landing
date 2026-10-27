import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { articles, articleText, getArticle, relatedArticles, TYPES } from '../app/playbooks/content';
import Inline from '../app/playbooks/Inline';
import sitemap from '../app/sitemap';

vi.mock('../app/lib/api', () => ({ meOrNull: vi.fn().mockResolvedValue(null), logout: vi.fn() }));

describe('playbook content', () => {
  it('has unique, URL-safe slugs and the fields every page renders', () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const a of articles) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(Object.values(TYPES)).toContain(a.type);
      expect(a.title.length).toBeGreaterThan(10);
      // Search engines cut descriptions around 160 characters.
      expect(a.description.length).toBeLessThanOrEqual(200);
      expect(a.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.sections.length).toBeGreaterThan(0);
    }
  });

  it('marks every use case as illustrative until real members agree to be named', () => {
    for (const a of articles.filter((x) => x.type === TYPES.useCase)) expect(a.illustrative).toBe(true);
  });

  it('never makes claims the product page does not', () => {
    const banned = [
      /end-to-end/i, /\bencrypt/i,                        // no security claims
      /\bi ?message\b/i, /\bSMS\b/,                       // not supported
      /\b12 (networks|platforms|apps)\b/i,               // not a promise the site makes
      /automatically (file|send|sign)/i,                 // you review and send
      /\$\d/,                                            // prices live in billingOffer.js
      /\bcustomer(s)? (say|said|told)\b/i, /testimonial/i, // no invented social proof
      /\bmacOS\b|\bMac app\b|\bAndroid\b/,             // Windows and iPhone only today
    ];
    for (const a of articles) {
      const text = articleText(a);
      // The comparison quotes a competitor's published prices with a source.
      const checked = a.sources?.length ? text.replace(/\$9\.99|\$30/g, '') : text;
      for (const pattern of banned) expect(checked, `${a.slug} matched ${pattern}`).not.toMatch(pattern);
    }
  });

  it('sources every article that names another company', () => {
    for (const a of articles) {
      if (/Beeper|Texts\.com/.test(articleText(a))) {
        expect(a.sources?.length, a.slug).toBeGreaterThan(0);
        for (const s of a.sources) expect(s.href).toMatch(/^https:\/\//);
      }
    }
  });

  it('only links internally to pages that exist', () => {
    const internal = [...articles.map(articleText).join('\n').matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    const known = ['/developers', '/support', '/signup', '/playbooks', ...articles.map((a) => `/playbooks/${a.slug}`)];
    for (const href of internal) expect(known).toContain(href.split('#')[0]);
  });

  it('finds articles and related reads', () => {
    expect(getArticle(articles[0].slug)).toBe(articles[0]);
    expect(getArticle('nope')).toBeNull();
    const related = relatedArticles(articles[0].slug);
    expect(related).toHaveLength(3);
    expect(related.map((a) => a.slug)).not.toContain(articles[0].slug);
  });
});

describe('inline markup', () => {
  it('renders bold and both kinds of link, and nothing else', () => {
    render(<p><Inline text="**Fix:** see [the API](/developers) or [Beeper](https://example.com). <b>raw</b>" /></p>);
    expect(screen.getByText('Fix:').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: 'the API' })).toHaveAttribute('href', '/developers');
    expect(screen.getByRole('link', { name: /Beeper/ })).toHaveAttribute('href', 'https://example.com');
    // HTML in content is text, never markup.
    expect(screen.getByText(/<b>raw<\/b>/)).toBeInTheDocument();
  });
});

describe('sitemap', () => {
  it('lists the hub and every article, and no account pages', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain('https://usemerger.com/playbooks');
    for (const a of articles) expect(urls).toContain(`https://usemerger.com/playbooks/${a.slug}`);
    expect(urls.some((u) => /admin|login|signup|invite|billing|dashboard/.test(u))).toBe(false);
  });
});
