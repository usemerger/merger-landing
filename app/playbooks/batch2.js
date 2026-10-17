// Playbooks batch 2. Same rules as content.js: claims stay inside what the
// homepage says, use cases are illustrative composites, no prices, and any
// other company named carries a source. tests/playbooks.test.jsx checks both
// files through the combined `articles` list.

const T = { useCase: 'Use case', guide: 'Guide', list: 'List', comparison: 'Comparison' };
const PUBLISHED = '2026-10-16';

const BEEPER_SOURCE = {
  label: 'Beeper help center: how legacy Beeper and Texts users are transitioning to the new Beeper',
  href: 'https://help.beeper.com/en_US/beeper-plus/subscriptions-how-legacy-beeper-and-texts-users-are-transitioning-to-the-new-beeper',
  accessed: '2026-10-16',
};

const WORTH_KNOWING = {
  type: 'callout',
  title: 'Worth knowing',
  text: 'Available networks, history and messaging actions vary by service. Claude features use your own Anthropic API key, billed by Anthropic. DocuSign access is through your own account.',
};

export const batch2 = [
  // ── Use cases ────────────────────────────────────────────────────────────
  {
    slug: 'family-office-co-investment-deal-flow',
    type: T.useCase,
    audience: 'Family offices',
    title: 'How a family office principal screens co-investment deal flow from a dozen group chats',
    description:
      'A family office walkthrough: co-investment offers arrive in WhatsApp groups, Telegram channels and LinkedIn DMs. One workspace keeps the sponsors, terms and decisions together.',
    dek: 'Sponsors pitch co-investments wherever the principal will answer. A walkthrough of keeping the good ones and saying no to the rest without losing track.',
    published: PUBLISHED,
    readMinutes: 6,
    illustrative: true,
    sections: [
      {
        heading: 'The flow',
        blocks: [
          'Elena runs investments for a single-family office. She has no deal team, one analyst, and a reputation that brings in more co-investment offers than she can read. Most arrive as messages: a sponsor’s WhatsApp group, a Telegram channel run by a placement agent, a LinkedIn DM from a fund she met once.',
          'Her problem is not finding deals. It is remembering which sponsor sent what, what she already passed on, and which conversation holds the terms she asked for.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**Group chats bury the offer.** A teaser posted to a forty-person group is gone by lunch.',
              '**Passes are forgotten.** The same deal comes back through a second sponsor and nobody remembers the first look.',
              '**The analyst works blind.** Elena forwards screenshots, and context goes missing in the hand-off.',
            ],
          },
        ],
      },
      {
        heading: 'Running it in Merger',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Every channel in one list', text: 'Elena connects the messaging accounts sponsors use to reach her. Group chats, channels and direct messages sit in one list, and she replies on each network from Merger.' },
              { title: 'Offers reviewed, not hoarded', text: 'With her own Anthropic API key connected, Claude flags messages that look like an offer and shows where they came from. She files the ones worth a look on her Deal Desk and dismisses the rest.' },
              { title: 'Sponsors remembered', text: 'Each sponsor’s contact details, picked up from introductions, sit in her Rolodex with the conversation they came from. When a sponsor returns with a new deal, the history is one click away.' },
              { title: 'A clear record of passes', text: 'Deals she passes on stay on the desk with their source, so when the same company appears through another sponsor, she can see it was already reviewed.' },
            ],
          },
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'venture-investor-founder-intros-from-x-and-linkedin',
    type: T.useCase,
    audience: 'Venture capital',
    title: 'A seed investor’s week: founder intros from X, LinkedIn and Telegram on one desk',
    description:
      'How an early-stage investor can keep founder introductions, follow-ups and diligence threads from X, LinkedIn and Telegram on one Deal Desk, with the source always attached.',
    dek: 'Founders cold-DM on X, scouts intro on Telegram, co-investors coordinate on Slack. A walkthrough of a seed investor keeping every thread warm.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: true,
    sections: [
      {
        heading: 'The week',
        blocks: [
          'Sam writes small first checks into B2B software companies. In a typical week he gets founder DMs on X, scout intros on Telegram, warm intros on LinkedIn, and a Slack Connect channel with two co-investors on a round he is leading.',
          'The best founders move fast. A reply that takes four days because the thread got buried can cost the allocation.',
        ],
      },
      {
        heading: 'The same week, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'One list for every founder thread', text: 'X, LinkedIn, Telegram and Slack conversations sit in one list. Sam replies to each founder on the network they chose.' },
              { title: 'Intros become companies on the desk', text: 'Claude suggests a deal when a scout introduces a company, with the intro attached. Sam files the ones he wants to meet. The rest he dismisses in a second.' },
              { title: 'Founders and scouts in the Rolodex', text: 'Emails and phone numbers shared in intros become Rolodex fields, so the founder he meets in March is still findable in September.' },
              { title: 'The round in one view', text: 'For the round he is leading, the deal holds the founder, the co-investors and the next step, next to the Slack thread where terms are being discussed.' },
            ],
          },
        ],
      },
      {
        heading: 'Alongside the tools he already uses',
        blocks: [
          'Sam still keeps his fund’s portfolio records elsewhere. Merger is where the conversations happen. An AI assistant can read his saved contacts and deals through the [Merger API](/developers) when he wants a summary before partner meeting.',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'business-broker-sell-side-buyer-conversations',
    type: T.useCase,
    audience: 'Business brokers',
    title: 'Selling a business when every buyer prefers a different app',
    description:
      'A sell-side business broker walkthrough: buyer inquiries on WhatsApp, LinkedIn and Messenger, NDAs in DocuSign, and every buyer conversation kept on one deal.',
    dek: 'One listing, thirty buyer inquiries, four messaging apps and an NDA for each. How a sell-side broker keeps the process orderly.',
    published: PUBLISHED,
    readMinutes: 6,
    illustrative: true,
    sections: [
      {
        heading: 'The listing',
        blocks: [
          'Tom is a business broker listing a regional HVAC services company. Within a week of the teaser going out he has inquiries from searchers, private equity associates and two strategic buyers. Some email. Most message him on WhatsApp, LinkedIn or Facebook Messenger.',
          'Every serious buyer needs an NDA before they see the confidential information memorandum. Every NDA needs the right name, entity and email.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              'Buyer details arrive in fragments across apps, and the NDA gets the wrong entity name.',
              'The broker cannot see at a glance which buyers have signed, which are waiting, and which went quiet.',
              'The seller asks for a buyer update and the broker spends an evening scrolling.',
            ],
          },
        ],
      },
      {
        heading: 'Running the process in Merger',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buyer inquiries in one list', text: 'Tom connects the messaging accounts buyers use. Every inquiry about the listing sits in one list, and he replies on each buyer’s network.' },
              { title: 'One deal, every buyer attached', text: 'He files the listing on his Deal Desk and keeps each buyer’s conversation, contact details and next step on it.' },
              { title: 'NDAs without retyping', text: 'He opens his own DocuSign account inside Merger, with buyer details from the Rolodex beside his NDA template. He inserts each buyer’s name and email into the field he selects, then reviews and sends from DocuSign.' },
              { title: 'A seller update in minutes', text: 'When the seller asks where things stand, the deal shows every buyer and their next step in one place.' },
            ],
          },
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'private-equity-add-on-sourcing-for-a-roll-up',
    type: T.useCase,
    audience: 'Private equity',
    title: 'Sourcing add-ons for a roll-up when owners answer LinkedIn, not email',
    description:
      'How a PE operating team can run owner outreach for roll-up add-ons across LinkedIn and WhatsApp, keep every owner conversation on one desk, and move to LOI with contacts in hand.',
    dek: 'Owner-operators rarely answer cold email. They do answer LinkedIn and WhatsApp. A walkthrough of an add-on pipeline built from conversations.',
    published: PUBLISHED,
    readMinutes: 6,
    illustrative: true,
    sections: [
      {
        heading: 'The thesis',
        blocks: [
          'A lower-middle-market fund owns a platform company in commercial landscaping and wants six add-ons in two years. Jordan, the operating partner, is running owner outreach himself.',
          'The owners he wants are fifty-something founders who have never hired a banker. They ignore email from strangers. A short LinkedIn message, or a WhatsApp intro from a mutual supplier, gets a reply.',
        ],
      },
      {
        heading: 'From first message to LOI',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Outreach and replies in one list', text: 'Jordan’s LinkedIn messages and the WhatsApp intros from suppliers sit together. He answers each owner on the network they replied on.' },
              { title: 'Every interested owner becomes a deal', text: 'When an owner says they would take a call, Claude can suggest a deal with that message attached. Jordan files it so the target, the owner and the next step live in one place.' },
              { title: 'The supplier who made the intro is not forgotten', text: 'Intros carry the most useful contact details in the process. They go into the Rolodex with their source, including the supplier who made the connection.' },
              { title: 'A pipeline the investment committee can follow', text: 'Before IC, Jordan reviews the desk: which owners are talking, what they said about timing, and what comes next for each.' },
              { title: 'LOI paperwork beside the people', text: 'When an owner agrees to terms, Jordan opens his own DocuSign account in Merger and inserts the owner’s details into the LOI template rather than retyping them.' },
            ],
          },
          'Merger does not replace the fund’s CRM or its reporting. It is where the owner conversations live day to day, which is the part the CRM was never going to capture.',
        ],
      },
    ],
  },

  {
    slug: 'ecommerce-brand-acquisition-from-founder-dms',
    type: T.useCase,
    audience: 'Ecommerce acquisitions',
    title: 'Buying an ecommerce brand when the deal starts in a founder’s Instagram DMs',
    description:
      'A walkthrough for ecommerce acquirers: founder conversations on Instagram, X and Telegram, broker listings in group chats, and diligence threads kept on one deal.',
    dek: 'Ecommerce founders live on Instagram and X. Brokers post listings in Telegram groups. How an acquirer keeps a brand acquisition from scattering.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: true,
    sections: [
      {
        heading: 'The target',
        blocks: [
          'Maya acquires small direct-to-consumer brands. Her best deal this year started with an Instagram DM to a founder whose product she had bought twice. Others come from brokers posting listings in Telegram groups, and from operators on X.',
          'Diligence brings its own threads: the founder on Instagram, their accountant on WhatsApp, the broker on Telegram.',
        ],
      },
      {
        heading: 'Keeping the acquisition together',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Founder, broker and advisers in one list', text: 'Every conversation about the brand sits in one list, whichever app each person uses.' },
              { title: 'The brand on the Deal Desk', text: 'Maya files the brand as a deal and attaches the founder conversation that started it. Listings from broker groups can be suggested by Claude and filed or dismissed after review.' },
              { title: 'Advisers in the Rolodex', text: 'The founder’s accountant and lawyer, introduced over WhatsApp, go into the Rolodex with the message they came from.' },
              { title: 'Documents with the right names', text: 'The NDA and LOI go out from her own DocuSign account inside Merger, with founder and entity details inserted from the Rolodex.' },
            ],
          },
          WORTH_KNOWING,
        ],
      },
    ],
  },

  // ── Guides ───────────────────────────────────────────────────────────────
  {
    slug: 'turn-introductions-into-contact-records',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to turn every introduction into a contact record you can actually use',
    description:
      'Introductions carry the best contact data a dealmaker ever gets. A practical method for capturing it from WhatsApp, LinkedIn and Telegram intros before it scrolls away.',
    dek: 'The intro message has the name, title, email, phone and context. Most of it never leaves the chat. Here is a simple habit that fixes that.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: false,
    sections: [
      {
        heading: 'Why introductions matter most',
        blocks: [
          'A good introduction answers every question a contact record should: who the person is, where they work, how to reach them, who vouched for them and why you should talk. No database you buy will be as accurate.',
          'Yet most dealmakers leave that information in the chat. Six months later, finding the email means remembering which app the intro came through.',
        ],
      },
      {
        heading: 'A five-minute habit',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Capture on the day', text: 'Record the details the day the intro arrives, while you still know which message it was.' },
              { title: 'Keep the source', text: 'Save a link to the introduction itself. When a detail looks wrong later, the source settles it.' },
              { title: 'Record who made the intro', text: 'The introducer is often the most valuable contact in the chain. Note them on the record.' },
              { title: 'Correct in place', text: 'People change firms and numbers. Fix the field when you learn something new rather than starting a second record.' },
            ],
          },
        ],
      },
      {
        heading: 'How Merger handles it',
        blocks: [
          'In Merger, names, emails, phone numbers and company details shared in an introduction can become Rolodex fields, with the message they came from available to check. You can correct any field, and the Rolodex sits beside your DocuSign templates when the paperwork starts.',
        ],
      },
    ],
  },

  {
    slug: 'run-a-weekly-deal-review-from-your-messages',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to run a 30-minute weekly deal review when your pipeline lives in chat',
    description:
      'A simple weekly review for dealmakers whose deals live in WhatsApp, Telegram and LinkedIn: what to check, in what order, and how to keep each deal’s next step honest.',
    dek: 'A weekly review is the cheapest insurance a dealmaker can buy. Here is a version that works when the deals live in messaging apps.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: false,
    sections: [
      {
        heading: 'Why weekly',
        blocks: [
          'Daily inbox triage catches what is loud. A weekly review catches what is quiet: the counterparty who stopped replying, the LOI that never came back, the intro you meant to follow up.',
        ],
      },
      {
        heading: 'The review, step by step',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Start from deals, not inboxes', text: 'List every live deal. For each, write one next step and who owns it. If you cannot name one, the deal is stalled.' },
              { title: 'Find the silent threads', text: 'For each deal, check when the other side last replied. Anything quiet for over a week gets a nudge today.' },
              { title: 'Clear the maybes', text: 'Opportunities you have not decided on either become deals or get dismissed. A pipeline full of maybes hides the real ones.' },
              { title: 'Update the people', text: 'Add anyone new you met this week to your contacts, with the conversation that introduced them.' },
              { title: 'Look one week ahead', text: 'Which documents need to go out? Prepare them now, with the right names and emails ready.' },
            ],
          },
        ],
      },
      {
        heading: 'Doing it in Merger',
        blocks: [
          'Merger’s Deal Desk holds each deal with its people, terms, next step and the conversation it came from, so the review starts from the desk instead of five apps. Suggested deals from Claude wait for your review, which makes clearing the maybes part of the same pass.',
        ],
      },
    ],
  },

  {
    slug: 'ai-deal-triage-without-giving-up-judgment',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'Using AI to triage deal flow without handing it your judgment',
    description:
      'How dealmakers can use AI to surface potential deals from messaging apps while keeping every decision with a person: review before filing, keep the source, and control the key.',
    dek: 'AI is good at noticing that a message looks like a deal. It should not be the one deciding. A practical way to split the work.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: false,
    sections: [
      {
        heading: 'What AI is good at here',
        blocks: [
          'Reading hundreds of messages and noticing which ones mention a company, a price, a raise or a request to talk. That is tedious for a person and quick for a model.',
        ],
      },
      {
        heading: 'What it should not do',
        blocks: [
          {
            type: 'list',
            items: [
              '**Decide what is a deal.** A model cannot know that the founder is a friend, or that you passed last year for a reason.',
              '**Act on your behalf.** Filing, replying and sending documents should stay with you.',
              '**Hide its source.** A suggestion without the message it came from cannot be checked.',
            ],
          },
        ],
      },
      {
        heading: 'Three rules that keep it useful',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Review before anything is filed', text: 'Treat every suggestion as a draft. Nothing reaches your pipeline until you accept it.' },
              { title: 'Always keep the source', text: 'Every suggestion should link to the conversation it came from, so you can judge it in context.' },
              { title: 'Know whose key it is', text: 'Know which AI provider processes your messages and under whose account. Using your own key keeps that relationship yours.' },
            ],
          },
        ],
      },
      {
        heading: 'How Merger does it',
        blocks: [
          'Claude features in Merger use your own Anthropic API key, billed by Anthropic separately from Merger. Claude surfaces potential deals with their source, and you review each one before it is filed on your Deal Desk or dismissed. You can use messaging and organize deals by hand without enabling Claude features at all.',
        ],
      },
    ],
  },

  // ── Lists ────────────────────────────────────────────────────────────────
  {
    slug: 'signs-your-deal-pipeline-has-outgrown-your-phone',
    type: T.list,
    audience: 'All dealmakers',
    title: '8 signs your deal pipeline has outgrown your phone',
    description:
      'Searching three apps for one price, retyping names into NDAs, forgetting who made the intro: eight signs a dealmaker’s messaging setup is costing deals.',
    dek: 'Your phone got you here. These are the signs it will not get you to the next ten deals.',
    published: PUBLISHED,
    readMinutes: 4,
    illustrative: false,
    sections: [
      { heading: '1. You search more than one app to find a price', blocks: ['If confirming a number means opening WhatsApp, then Telegram, then LinkedIn, the record is in the wrong place.'] },
      { heading: '2. You have answered from the wrong account', blocks: ['Personal and work numbers, two LinkedIn profiles, mixed group chats. One wrong reply is enough to notice.'] },
      { heading: '3. Introductions live only in chat', blocks: ['If the email someone was introduced with is still only in the intro message, it will be gone when you need it.'] },
      { heading: '4. Screenshots are your filing system', blocks: ['A camera roll of term screenshots is a sign the deal record does not exist anywhere else.'] },
      { heading: '5. NDAs start with retyping', blocks: ['Copying names and emails by hand into documents is where wrong-recipient mistakes happen.'] },
      { heading: '6. You cannot list your live deals from memory', blocks: ['If someone asked for your live deals and their next steps right now, could you answer without scrolling?'] },
      { heading: '7. The quiet counterparty surprises you', blocks: ['Finding out a buyer went cold two weeks ago means nothing was watching the thread for you.'] },
      {
        heading: '8. Your CRM is always behind',
        blocks: [
          'If your CRM is updated on Friday afternoons from memory, it is a reporting tool, not a working one.',
          'Each of these has the same fix: keep the deal record where the conversation already is. That is the idea behind Merger’s connected messaging, Deal Desk and Rolodex. [See how it works](/playbooks/your-deal-flow-lives-in-your-dms).',
        ],
      },
    ],
  },

  {
    slug: 'habits-of-dealmakers-who-never-lose-a-thread',
    type: T.list,
    audience: 'All dealmakers',
    title: '6 habits of dealmakers who never lose a thread',
    description:
      'Six simple working habits for brokers, investors and syndicators who run deals across WhatsApp, Telegram, LinkedIn and Slack, and keep every counterparty moving.',
    dek: 'The dealmakers who never drop a thread are not more organized by nature. They just have a few habits that do the remembering for them.',
    published: PUBLISHED,
    readMinutes: 4,
    illustrative: false,
    sections: [
      { heading: '1. Every deal has one written next step', blocks: ['Not a list of ideas. One step, one owner, one rough date. If there is no next step, the deal is stalled and they know it.'] },
      { heading: '2. They file from the conversation, the same day', blocks: ['The moment a message turns into a real opportunity, it becomes a deal record, with the message attached.'] },
      { heading: '3. They treat introductions as data', blocks: ['Names, emails, numbers and the introducer go into a contact record on the day the intro arrives. [Here is a simple way to do it](/playbooks/turn-introductions-into-contact-records).'] },
      { heading: '4. They reply on the other person’s network', blocks: ['They do not drag a seller onto email before the seller is ready. The deal moves on whichever app the counterparty prefers.'] },
      { heading: '5. They review weekly from the desk, not the inbox', blocks: ['Thirty minutes a week, deal by deal, looking for what went quiet. [Our weekly review guide](/playbooks/run-a-weekly-deal-review-from-your-messages).'] },
      { heading: '6. Paperwork starts from records, not screenshots', blocks: ['When documents go out, the names and emails come from contact records, not retyped from a chat.'] },
    ],
  },

  // ── Comparisons ──────────────────────────────────────────────────────────
  {
    slug: 'spreadsheet-vs-crm-vs-deal-workspace-for-solo-brokers',
    type: T.comparison,
    audience: 'Brokers and solo dealmakers',
    title: 'Spreadsheet, CRM or deal workspace: what a solo broker actually needs',
    description:
      'A practical comparison for independent brokers and small desks: tracking deals in a spreadsheet, a CRM, or a messaging-first deal workspace like Merger.',
    dek: 'Most independent brokers start with a spreadsheet, try a CRM, and drift back. Here is what each option is good at, and where each one breaks.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Option', 'Good at', 'Where it breaks'],
            rows: [
              ['Spreadsheet', 'Free, flexible, fast to start', 'Always behind the conversation; no link to the messages or the people'],
              ['CRM', 'Structure, reminders, reporting, email sync', 'Messaging apps sit outside it; updating it becomes a separate job'],
              ['Merger', 'Deals, contacts and documents built from the conversations themselves', 'Early access on Windows; network availability varies by service'],
            ],
          },
        ],
      },
      {
        heading: 'Spreadsheets',
        blocks: [
          'A spreadsheet is the right first tool. It costs nothing and takes any shape. It breaks when the deal count grows, because every row has to be typed in from somewhere else, and that somewhere is usually a chat.',
        ],
      },
      {
        heading: 'CRMs',
        blocks: [
          'A CRM adds structure, reminders and reporting. For a broker whose counterparties live on email, it works well. For one whose deals happen on WhatsApp and LinkedIn, the CRM becomes something to update after the real work, and it falls behind.',
        ],
      },
      {
        heading: 'A deal workspace',
        blocks: [
          'Merger starts from the conversations: connected messaging in one list, a Deal Desk where suggested deals are reviewed before they are filed, a Rolodex built from introductions, and your own DocuSign account beside your contacts. If you already keep a CRM for reporting, Merger can sit next to it as the place the day-to-day work happens.',
        ],
      },
    ],
  },

  {
    slug: 'merger-vs-unified-inbox-plus-spreadsheet',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Merger vs a unified inbox plus a spreadsheet',
    description:
      'Many dealmakers pair a unified messaging app like Beeper with a spreadsheet. How that setup compares with Merger for tracking deals, contacts and documents.',
    dek: 'A unified inbox fixes “too many apps.” A spreadsheet holds the pipeline. Here is what that pairing does well and what still falls between them.',
    published: PUBLISHED,
    readMinutes: 5,
    illustrative: false,
    sections: [
      {
        heading: 'The setup',
        blocks: [
          'A common setup among dealmakers: a unified messaging app such as Beeper to read every chat in one place, plus a spreadsheet or notes app for the pipeline. Beeper is free to start, with paid tiers listed in its help center as of its July 2025 relaunch ([Beeper help center](https://help.beeper.com/en_US/beeper-plus/subscriptions-how-legacy-beeper-and-texts-users-are-transitioning-to-the-new-beeper)).',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'Unified inbox + spreadsheet', 'Merger'],
            rows: [
              ['Read and reply across chat networks', 'Yes, in the inbox app', 'Yes; availability varies by service'],
              ['Deal records', 'Typed into the spreadsheet by hand', 'Deal Desk, with suggested deals reviewed before filing'],
              ['Link from deal to conversation', 'None, unless you paste it', 'The source conversation stays attached'],
              ['Contacts from introductions', 'Copied by hand', 'Can become Rolodex fields with their source'],
              ['Documents', 'Separate e-signature app', 'Your own DocuSign account inside Merger, Rolodex beside it'],
            ],
          },
        ],
      },
      {
        heading: 'When the pairing is enough',
        blocks: [
          'If you run a handful of deals at a time and enjoy keeping a spreadsheet, the pairing works. The cost shows up as the deal count grows: every update is a copy from one app to the other.',
        ],
      },
      {
        heading: 'When Merger fits better',
        blocks: [
          'If the copying is where things slip, Merger removes that step by keeping the deal, the people and the paperwork in the same workspace as the conversation. It is early, runs on Windows today, and is opening to dealmakers by invitation.',
        ],
      },
    ],
    sources: [BEEPER_SOURCE],
  },
];
