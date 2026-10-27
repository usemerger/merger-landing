// Search and AI-assistant visibility, in one place.
//
// Google, Bing (which feeds ChatGPT search and Copilot), Perplexity and Claude
// all read the same three things: the page text, the structured data, and
// /llms.txt. Every one of them is built from the constants below so the
// homepage, the JSON-LD and llms.txt can never describe Merger differently.
//
// Claim rules are the same as the Playbooks (see playbooks/content.js): no
// encryption claims, nothing "automatic", no SMS/iMessage, no Mac or Android,
// and prices come from lib/billingOffer.js only.

import { ALPHA_OFFER, ANNUAL_OFFER } from './billingOffer';

export const SITE = 'https://usemerger.com';

export const SITE_NAME = 'Merger';

/** The one-sentence definition an answer engine should repeat. */
export const DEFINITION =
  'Merger is a unified inbox and deal desk for dealmakers. It brings WhatsApp, Telegram, '
  + 'LinkedIn, Slack and other messaging accounts into one workspace, uses Claude (with your own '
  + 'Anthropic API key) to flag messages that look like deals for you to review, and keeps the '
  + 'conversation, contacts and your own DocuSign account beside each deal.';

export const SHORT_DESCRIPTION =
  'One inbox for WhatsApp, Telegram, LinkedIn and Slack, built for dealmakers. '
  + 'Claude flags possible deals and you approve them onto your Deal Desk. Windows and iPhone.';

/** Networks shown in the homepage channel orbit. Availability varies by service. */
export const NETWORKS = Object.freeze([
  'WhatsApp', 'Telegram', 'LinkedIn', 'Slack', 'Signal', 'Instagram', 'Messenger', 'Discord', 'X', 'LINE',
]);

export const AUDIENCES = Object.freeze([
  'secondaries brokers', 'business brokers', 'search funders', 'real estate syndicators and investors',
  'family offices', 'private equity', 'venture investors', 'ecommerce acquirers',
]);

export const APP_STORE_URL = 'https://apps.apple.com/us/app/merger-inbox-for-dealmakers/id6817136478';

export const SOCIAL_PROFILES = Object.freeze([
  'https://www.instagram.com/usemerger',
  'https://x.com/usemerger',
  'https://www.linkedin.com/company/143952300',
  'https://www.facebook.com/1271710229366025',
  'https://www.tiktok.com/@usemerger',
  'https://www.youtube.com/channel/UC_aAiX9Ha6jTd9qho8qduqw',
  'https://www.threads.net/@usemerger',
  APP_STORE_URL,
]);

export const KEYWORDS = Object.freeze([
  'unified inbox for dealmakers', 'deal desk', 'deal flow management', 'WhatsApp CRM',
  'Telegram CRM', 'LinkedIn messages inbox', 'messaging app deal tracking',
  'business broker software', 'secondaries broker', 'search fund', 'family office deal flow',
  'AI deal triage', 'Claude', 'DocuSign',
]);

const amount = (label) => label.replace(/[^0-9.]/g, '');

const organization = {
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: SITE_NAME,
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/merger-logo-gold.svg` },
  email: 'support@usemerger.com',
  sameAs: SOCIAL_PROFILES,
  founder: { '@type': 'Person', name: 'Owen Van Holtz', jobTitle: 'Founder' },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'support@usemerger.com', url: `${SITE}/support` }],
};

/** JSON-LD graph for the homepage: who we are, what the product is, and the FAQ. */
export function homeJsonLd(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: SITE_NAME,
        description: SHORT_DESCRIPTION,
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE}/#app`,
        name: SITE_NAME,
        alternateName: 'Merger: Inbox for Dealmakers',
        description: DEFINITION,
        url: SITE,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Unified inbox and deal management',
        operatingSystem: 'Windows, iOS',
        downloadUrl: `${SITE}/signup`,
        installUrl: APP_STORE_URL,
        publisher: { '@id': `${SITE}/#organization` },
        audience: { '@type': 'BusinessAudience', audienceType: AUDIENCES.join(', ') },
        featureList: [
          `Read and reply to connected messaging accounts in one inbox (${NETWORKS.join(', ')}; availability varies by service)`,
          'Claude flags possible deals in your messages using your own Anthropic API key; you review each one before it is filed',
          'Deal Desk with the source conversation, people, terms and next step on each deal',
          'Rolodex of contact details picked up from introductions, linked to the message they came from',
          'Your own DocuSign account inside the app, with deal contacts beside your templates',
        ],
        offers: [
          {
            '@type': 'Offer', name: 'Monthly', price: amount(ALPHA_OFFER.priceLabel), priceCurrency: 'USD',
            description: ALPHA_OFFER.billingNotice,
            url: `${SITE}/#pricing`, availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer', name: 'Annual', price: amount(ANNUAL_OFFER.priceLabel), priceCurrency: 'USD',
            description: ANNUAL_OFFER.billingNotice,
            url: `${SITE}/#pricing`, availability: 'https://schema.org/InStock',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/#faq`,
        mainEntity: faqItems.map(({ question, answer }) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
}

export { organization as organizationJsonLd };

/** Safe to drop inside <script type="application/ld+json">. */
export function jsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
