// "Merger for …" pages: one per kind of dealmaker, at /for/<slug>.
//
// These target the searches buyers type ("CRM for business brokers",
// "deal flow software for family offices") and give AI assistants a clear,
// quotable answer for each audience. Same claim rules as the Playbooks
// (playbooks/content.js): no encryption, nothing automatic, no SMS/iMessage,
// no Mac or Android, no prices (those come from lib/billingOffer.js), and the
// scenarios are typical workflows, not customer stories.
//
// Inline markup inside strings: **bold** and [text](href), same as Playbooks.

export const verticals = [
  {
    slug: 'business-brokers',
    name: 'Business brokers',
    title: 'Merger for business brokers: every buyer conversation on one deal',
    description: 'Business brokers get buyer inquiries on WhatsApp, LinkedIn and Telegram. Merger puts them in one inbox and keeps every buyer, NDA and next step on the listing.',
    headline: 'Every buyer, every app, one listing.',
    intro: 'A listing goes live and the inquiries come from everywhere: a WhatsApp message from a searcher, a LinkedIn note from a PE associate, a Telegram thread from an independent sponsor. Merger keeps all of them in one inbox and on the listing they belong to.',
    pains: [
      ['Buyers pick the app, not you', 'Each buyer replies where they are comfortable, so one listing ends up spread across four or five apps.'],
      ['NDAs eat the afternoon', 'Every serious buyer needs an NDA, and every NDA means retyping a name, an entity and an email from a chat.'],
      ['The seller wants a status update', 'Answering “where are we?” means scrolling every thread to remember who said what.'],
    ],
    fit: [
      '**One inbox for buyer inquiries.** Read and reply on each buyer’s own network from Merger.',
      '**The listing as a deal.** File it on your Deal Desk and keep each buyer’s conversation, contact details and next step on it.',
      '**NDAs without retyping.** Open your own DocuSign account inside Merger with buyer details from your Rolodex beside the template. You review and send.',
      '**A seller update in minutes.** The deal shows every buyer and where each one stands.',
    ],
    playbook: 'business-broker-sell-side-buyer-conversations',
    related: ['signs-your-deal-pipeline-has-outgrown-your-phone', 'spreadsheet-vs-crm-vs-deal-workspace-for-solo-brokers'],
    faqs: [
      ['Is Merger a CRM for business brokers?', 'It covers the part of a CRM brokers actually use day to day: deals, the people on them, and the next step, built from the conversations instead of typed in afterwards. If your firm reports from an existing CRM, Merger can sit beside it as the place the buyer conversations happen.'],
      ['Can buyers message me on WhatsApp and LinkedIn at the same time?', 'Yes. Connect the accounts you use and every conversation appears in one list. You reply on the buyer’s network. Available networks and actions vary by service.'],
      ['Does Merger send NDAs for me?', 'No. Your own DocuSign account opens inside Merger with the buyer’s details beside it. You insert them into the fields you choose, review, and send from DocuSign.'],
    ],
  },
  {
    slug: 'search-funds',
    name: 'Search funds',
    title: 'Merger for search funds: run broker outreach without a CRM habit',
    description: 'Searchers work dozens of brokers across email, LinkedIn and WhatsApp. Merger keeps the brokers, the listings and the next steps on one desk, built from the conversations.',
    headline: 'Brokers, listings and next steps, without the CRM homework.',
    intro: 'A search lives on volume: dozens of brokers, hundreds of teasers, and a few owners worth a second call. Merger keeps the broker relationships and the listings in one place without asking you to log every touch by hand.',
    pains: [
      ['The broker matters more than the listing', 'The listing you pass on today is from the broker who brings the right one next quarter. Their details get lost in the thread.'],
      ['Teasers arrive everywhere', 'Some come by email, some by LinkedIn, some as a WhatsApp forward from a friend of a friend.'],
      ['Investor updates need a pipeline', 'Your investors want to know what you looked at and why you passed. That record rarely exists.'],
    ],
    fit: [
      '**Connect the channels brokers use.** LinkedIn, WhatsApp, Telegram and more in one list.',
      '**File listings from the conversation.** Claude, with your own Anthropic API key, can suggest a deal when a broker sends one. You review it before it is filed.',
      '**Keep the broker, not just the deal.** Broker details go into your Rolodex with the message they came from.',
      '**A record of passes.** Deals you pass on stay on the desk with their source, ready for the next investor update.',
    ],
    playbook: 'search-fund-broker-outreach-without-a-crm',
    related: ['run-a-weekly-deal-review-from-your-messages', 'turn-introductions-into-contact-records'],
    faqs: [
      ['What is the best way for a searcher to track brokers and listings?', 'Keep two records: the broker as a contact, and each listing as a deal linked to the broker who sent it. Merger builds both from the conversations themselves, so the record exists even on the weeks you do not update anything.'],
      ['Do I need a Claude subscription?', 'Claude features use your own Anthropic API key, billed separately by Anthropic. A Claude chat subscription is not an API key. You can file deals by hand without Claude.'],
      ['Does Merger work on my phone?', 'Merger runs on Windows and iPhone. Mac and Android are not available yet.'],
    ],
  },
  {
    slug: 'secondaries',
    name: 'Secondaries brokers',
    title: 'Merger for secondaries brokers: 40 counterparties, one desk',
    description: 'Pre-IPO secondaries run on WhatsApp, Telegram, Signal and LinkedIn. Merger keeps every buyer, seller, price and next step on one desk, with the conversation attached.',
    headline: 'Forty counterparties. Five apps. One desk.',
    intro: 'A secondary block can have one seller, dozens of interested buyers, and a price that moves across three threads in a day. Merger puts those conversations in one inbox and keeps the deal, the counterparties and the paperwork together.',
    pains: [
      ['Prices drift across threads', 'The latest number is in a Telegram group, the previous one in WhatsApp, and the seller’s floor is in a Signal message from last week.'],
      ['The quiet buyer disappears', 'Inboxes sort by whoever messaged last, so a serious buyer who goes silent sinks out of sight.'],
      ['Counterparty details live in screenshots', 'Entity names, emails and signatories arrive as images and forwards, then get retyped into documents.'],
    ],
    fit: [
      '**Every counterparty in one inbox.** Read and reply on WhatsApp, Telegram, Signal, LinkedIn and more from one place.',
      '**Possible deals flagged for review.** Claude, with your own Anthropic API key, flags messages that mention a block, a price or a request to talk. Nothing is filed until you approve it.',
      '**The block on one desk.** Buyers, seller, terms and next step on one deal, with each conversation attached.',
      '**Paperwork beside the people.** Your own DocuSign account inside Merger, with counterparty details from your Rolodex.',
    ],
    playbook: 'secondaries-broker-counterparties-across-messaging-apps',
    related: ['seven-ways-deals-die-in-messaging-apps', 'ai-deal-triage-without-giving-up-judgment'],
    faqs: [
      ['How do secondaries brokers keep track of buyers across chat apps?', 'Most use a spreadsheet beside their chats and copy updates by hand. Merger replaces the copying: the deal, the buyers and the next steps sit next to the conversations they came from.'],
      ['Does Claude decide which buyers to pursue?', 'No. Claude flags messages that look like deal activity and shows the source. You decide what goes on the desk.'],
      ['Do my counterparties need Merger?', 'No. Buyers and sellers keep using WhatsApp, Telegram, Signal or LinkedIn. You reply to each of them on their own network from Merger.'],
    ],
  },
  {
    slug: 'real-estate',
    name: 'Real estate investors and syndicators',
    title: 'Merger for real estate syndicators: from WhatsApp intro to signed docs',
    description: 'Real estate raises start with WhatsApp intros and LinkedIn messages. Merger keeps investors, the raise and the documents in one workspace, with your own DocuSign account.',
    headline: 'From the first intro to the signed subscription.',
    intro: 'A raise starts with introductions: an investor forwarded by a friend on WhatsApp, a LinkedIn connection asking for the deck, a group chat of past LPs. Merger keeps those conversations, the investors and the documents in one place.',
    pains: [
      ['Investor intros scatter', 'The warm introductions that fund a raise arrive in whichever app the introducer prefers.'],
      ['Soft commits are hard to track', 'A “put me down for 100” in a chat is easy to lose by the time the docs go out.'],
      ['Docs mean retyping', 'Every subscription document starts by copying names and emails out of a conversation.'],
    ],
    fit: [
      '**One inbox for the raise.** Investor conversations from every network in one list.',
      '**The raise as a deal.** Keep the investors, their status and the next step on one deal, with each conversation attached.',
      '**An investor Rolodex from introductions.** Details shared in intros become contact fields, linked to the message they came from.',
      '**Documents without retyping.** Your own DocuSign account inside Merger, with investor details beside the template.',
    ],
    playbook: 'real-estate-syndicator-capital-raise-from-intro-to-signature',
    related: ['turn-introductions-into-contact-records', 'habits-of-dealmakers-who-never-lose-a-thread'],
    faqs: [
      ['Is Merger an investor CRM for syndicators?', 'It covers the working part: investors as contacts, the raise as a deal, and the conversations attached. It does not replace investor portals, distributions or fund administration.'],
      ['Can I use my existing DocuSign templates?', 'Yes. Sign in to your own DocuSign account inside Merger. Your Rolodex sits beside it for names and emails. DocuSign access and charges are separate from Merger.'],
      ['Which messaging apps does Merger connect?', 'WhatsApp, Telegram, LinkedIn, Slack, Signal, Instagram, Messenger, Discord, X and LINE. Availability and actions vary by service.'],
    ],
  },
  {
    slug: 'family-offices',
    name: 'Family offices',
    title: 'Merger for family offices: screen co-investment deal flow from group chats',
    description: 'Family office principals get co-investment offers in a dozen WhatsApp and Telegram groups. Merger flags them for review and keeps sponsors and passes on one desk.',
    headline: 'Deal flow from a dozen group chats, screened on one desk.',
    intro: 'Co-investment offers arrive in sponsor group chats, forwarded decks and one-line WhatsApp messages. Merger brings those channels into one inbox and gives every offer worth a look a place on your desk.',
    pains: [
      ['Offers hide in group chats', 'The interesting deal is message 40 in a group you muted last month.'],
      ['Sponsors come back', 'When a sponsor returns with a new deal, the history of the last one is somewhere in a thread.'],
      ['Passes are not recorded', 'The same company appears through a second sponsor, and nobody remembers it was already reviewed.'],
    ],
    fit: [
      '**Every channel in one list.** Group chats, channels and direct messages together.',
      '**Offers reviewed, not hoarded.** Claude, with your own Anthropic API key, flags messages that look like an offer. You file the ones worth a look and dismiss the rest.',
      '**Sponsors remembered.** Sponsor details sit in your Rolodex with the conversation they came from.',
      '**A clear record of passes.** Passed deals stay on the desk with their source.',
    ],
    playbook: 'family-office-co-investment-deal-flow',
    related: ['ai-deal-triage-without-giving-up-judgment', 'run-a-weekly-deal-review-from-your-messages'],
    faqs: [
      ['How can a family office track deal flow that arrives in WhatsApp groups?', 'Bring the groups into one inbox, flag the messages that look like offers, and file only the ones worth a look as deals with the source attached. That is the workflow Merger is built around.'],
      ['Does AI make investment decisions in Merger?', 'No. Claude flags possible deals and links each one to its source message. Every decision, including what gets filed, is yours.'],
      ['Can my team use it?', 'Team plans are not part of this launch. Each person uses their own Merger membership today.'],
    ],
  },
  {
    slug: 'private-equity',
    name: 'Private equity',
    title: 'Merger for private equity: add-on sourcing when owners answer LinkedIn',
    description: 'Owners and intermediaries reply on LinkedIn and WhatsApp, not email. Merger keeps add-on targets, owners and the people who introduced them on one desk.',
    headline: 'Add-on sourcing where owners actually reply.',
    intro: 'Owner outreach for a roll-up gets answered on LinkedIn, and the best introductions come over WhatsApp from suppliers and advisers. Merger keeps those conversations, the targets and the introducers in one workspace.',
    pains: [
      ['Replies land outside email', 'The CRM sees the sequence you sent, not the LinkedIn reply that said “happy to talk in Q1.”'],
      ['Introducers get forgotten', 'The supplier who connected you to the owner is the most valuable contact in the process, and the least recorded.'],
      ['IC needs a pipeline', 'Before investment committee you rebuild the list of who is talking from memory.'],
    ],
    fit: [
      '**Outreach replies in one list.** LinkedIn messages and WhatsApp intros together.',
      '**Every interested owner becomes a deal.** Claude can suggest one when an owner agrees to a call. You file it with the message attached.',
      '**Introducers in the Rolodex.** Intro details go in with their source, including who made the connection.',
      '**LOI paperwork beside the people.** Your own DocuSign account in Merger, with owner details from the Rolodex.',
    ],
    playbook: 'private-equity-add-on-sourcing-for-a-roll-up',
    related: ['unified-inbox-vs-crm-vs-shared-inbox-for-dealmakers', 'turn-introductions-into-contact-records'],
    faqs: [
      ['Does Merger replace our firm’s CRM?', 'No. Firms that report from a CRM can keep it. Merger is where the messaging-app conversations happen and become deals, and the Merger API lets an AI assistant read your saved contacts and deals.'],
      ['Which networks can I connect?', 'WhatsApp, Telegram, LinkedIn, Slack, Signal, Instagram, Messenger, Discord, X and LINE. Availability and actions vary by service.'],
      ['Where does it run?', 'Windows and iPhone.'],
    ],
  },
  {
    slug: 'venture',
    name: 'Venture investors',
    title: 'Merger for venture investors: founder intros from X, LinkedIn and Telegram',
    description: 'Seed and angel investors get founder intros on X, LinkedIn, Telegram and Slack. Merger puts them in one inbox and turns the ones worth a meeting into deals.',
    headline: 'Founder intros from every app, on one desk.',
    intro: 'Founders reach you where they found you: an X DM, a LinkedIn note, a scout’s Telegram message, a Slack community thread. Merger keeps those conversations together and gives the companies worth a meeting a place on your desk.',
    pains: [
      ['Intros come from everywhere', 'Scouts, founders and co-investors each use a different app.'],
      ['The founder from March is gone by September', 'Emails and numbers shared in an intro never make it into a contact list.'],
      ['Rounds move in Slack', 'Terms for the round you are leading get discussed in a thread nobody can find later.'],
    ],
    fit: [
      '**One list for every founder thread.** X, LinkedIn, Telegram and Slack together; reply on each founder’s network.',
      '**Intros become companies on the desk.** Claude suggests a deal when a scout introduces a company. You file the ones you want to meet.',
      '**Founders and scouts in the Rolodex.** Details from intros become contact fields with their source.',
      '**The round in one view.** Founder, co-investors and next step on one deal, next to the conversation.',
    ],
    playbook: 'venture-investor-founder-intros-from-x-and-linkedin',
    related: ['ai-deal-triage-without-giving-up-judgment', 'habits-of-dealmakers-who-never-lose-a-thread'],
    faqs: [
      ['How do angels and seed investors track deal flow from DMs?', 'Usually with a notes app and memory. Merger keeps the DMs in one inbox and turns the companies you want to meet into deals with the intro attached.'],
      ['Does Merger read all my messages with AI?', 'Only if you turn on Claude features with your own Anthropic API key. You can use the inbox and file deals by hand without them.'],
      ['Is there an Android app?', 'Not yet. Merger runs on Windows and iPhone.'],
    ],
  },
];

export function getVertical(slug) {
  return verticals.find((v) => v.slug === slug) || null;
}

/** Every string on a vertical page, for the claim checks in tests. */
export function verticalText(v) {
  return [v.title, v.description, v.headline, v.intro, ...v.pains.flat(), ...v.fit, ...v.faqs.flat()].join('\n');
}
