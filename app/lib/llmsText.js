// Plain-markdown views of the site for AI assistants: /llms.txt (the index,
// per llmstxt.org) and /llms-full.txt (every Playbook in full).
//
// Built from the same sources as the pages, so they cannot drift: product
// facts from lib/seo.js, prices from lib/billingOffer.js, the FAQ from
// landingContent.js and articles from playbooks/content.js.

import { faqs } from '../landingContent';
import { articles } from '../playbooks/content';
import { ALPHA_OFFER, ANNUAL_OFFER } from './billingOffer';
import { APP_STORE_URL, AUDIENCES, DEFINITION, NETWORKS, SITE } from './seo';

const abs = (text) => text.replace(/\]\((\/[^)]*)\)/g, `](${SITE}$1)`);

function faqAnswer(faq) {
  if (!faq.offer) return faq.answer;
  return `${ALPHA_OFFER.billingNotice} Annual billing: ${ANNUAL_OFFER.billingNotice} ${ALPHA_OFFER.rateNotice} Anthropic API usage and DocuSign are billed separately.`;
}

function facts() {
  return [
    '## Key facts',
    '',
    `- What it is: a unified inbox and deal desk for dealmakers.`,
    `- Who it is for: ${AUDIENCES.join(', ')}.`,
    `- Messaging networks: ${NETWORKS.join(', ')}. Availability and actions vary by service. SMS and iMessage are not supported.`,
    '- AI: Claude flags messages that look like deals, using the member\'s own Anthropic API key (billed by Anthropic). Nothing is filed until the member approves it.',
    '- Deal Desk: each approved deal keeps its source conversation, people, terms and next step.',
    '- Rolodex: contact details from introductions, linked to the message they came from.',
    '- Documents: the member\'s own DocuSign account opens inside Merger with deal contacts beside templates. The member reviews and sends.',
    `- Platforms: Windows desktop app and iPhone app (${APP_STORE_URL}). Mac and Android are not available yet.`,
    `- Price: ${ALPHA_OFFER.priceLabel} USD/month or ${ANNUAL_OFFER.priceLabel} USD/year, paid at checkout, with a ${ALPHA_OFFER.refundDays}-day money-back guarantee. Alpha members keep their rate while their membership stays active.`,
    `- Get started: ${SITE}/signup · Book a 15-minute setup call: ${SITE}/book · Support: support@usemerger.com`,
    '- Company: Merger, founded by Owen Van Holtz. Operated by Void Ecom LLC (Florida, USA).',
  ].join('\n');
}

export function llmsIndex() {
  const groups = new Map();
  for (const article of articles) {
    if (!groups.has(article.type)) groups.set(article.type, []);
    groups.get(article.type).push(article);
  }
  const sections = [...groups].map(([type, items]) => [
    `## Playbooks: ${type}s`,
    '',
    ...items.map((a) => `- [${a.title}](${SITE}/playbooks/${a.slug}): ${a.description}`),
  ].join('\n'));

  return [
    '# Merger',
    '',
    `> ${DEFINITION}`,
    '',
    facts(),
    '',
    '## Product',
    '',
    `- [Homepage](${SITE}/): features, pricing and FAQ`,
    `- [Pricing](${SITE}/#pricing): monthly and annual plans`,
    `- [Help & support](${SITE}/support): account, billing, downloads and bug reports`,
    `- [API & MCP documentation](${SITE}/developers): connect ChatGPT or Claude to your Merger contacts and deals`,
    `- [Alpha terms](${SITE}/terms) and [Privacy policy](${SITE}/privacy)`,
    '',
    ...sections.flatMap((s) => [s, '']),
    '## Optional',
    '',
    `- [Full text of every Playbook](${SITE}/llms-full.txt)`,
    '',
  ].join('\n');
}

function blockMd(block) {
  if (typeof block === 'string') return abs(block);
  if (block.type === 'list') return block.items.map((item) => `- ${abs(item)}`).join('\n');
  if (block.type === 'steps') return block.items.map((item, i) => `${i + 1}. **${item.title}.** ${abs(item.text)}`).join('\n');
  if (block.type === 'callout') return `> **${block.title}.** ${abs(block.text)}`;
  if (block.type === 'table') {
    const row = (cells) => `| ${cells.map((c) => abs(c).replace(/\|/g, '\\|')).join(' | ')} |`;
    return [row(block.head), row(block.head.map(() => '---')), ...block.rows.map(row)].join('\n');
  }
  return '';
}

export function llmsFull(illustrativeNote) {
  const parts = [
    '# Merger: full reference',
    '',
    `> ${DEFINITION}`,
    '',
    facts(),
    '',
    '## FAQ',
    '',
    ...faqs.flatMap((faq) => [`### ${faq.question}`, '', faqAnswer(faq), '']),
  ];
  for (const article of articles) {
    parts.push(
      '---', '',
      `# ${article.title}`, '',
      `URL: ${SITE}/playbooks/${article.slug}`,
      `Type: ${article.type} · Audience: ${article.audience} · Published: ${article.published}${article.updated ? ` · Updated: ${article.updated}` : ''}`,
      '',
      `${article.dek}`, '',
    );
    if (article.illustrative) parts.push(`_${illustrativeNote}_`, '');
    for (const section of article.sections) {
      parts.push(`## ${section.heading}`, '');
      for (const block of section.blocks) parts.push(blockMd(block), '');
    }
    if (article.sources?.length) {
      parts.push('## Sources', '', ...article.sources.map((s) => `- [${s.label}](${s.href}) (accessed ${s.accessed})`), '');
    }
  }
  return parts.join('\n');
}
