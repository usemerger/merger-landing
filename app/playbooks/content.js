// Playbooks: the articles behind /playbooks.
//
// RULES FOR EVERY ARTICLE, because these pages are public and indexed:
//
//   · Product claims stay inside what the homepage and FAQ already say:
//     connected messaging (availability varies by service), Deal Desk with
//     Claude suggestions you review (your own Anthropic API key), a Rolodex
//     built from introductions, and your own DocuSign account inside Merger.
//     No encryption claims, no "automatic" filing or sending, no SMS/iMessage.
//   · Use-case articles are illustrative composites, not customer stories.
//     The page says so. Real case studies replace them once pilot members
//     agree to be named.
//   · Facts about other companies carry a source and an as-of date.
//   · No prices here. Price copy lives in lib/billingOffer.js and nowhere else.
//
// tests/playbooks.test.js enforces the mechanical parts of this.
//
// Inline markup inside strings: **bold** and [text](href). Nothing else.

export const TYPES = Object.freeze({
  useCase: 'Use case',
  guide: 'Guide',
  list: 'List',
  comparison: 'Comparison',
});

export const ILLUSTRATIVE_NOTE =
  'This walkthrough is an illustrative composite built from common dealmaker workflows. '
  + 'Names, firms and figures are invented. It is not a customer story.';

export const articles = [
  {
    slug: 'secondaries-broker-counterparties-across-messaging-apps',
    type: TYPES.useCase,
    audience: 'Pre-IPO secondaries',
    title: 'How a secondaries broker keeps 40 counterparties straight across five messaging apps',
    description:
      'A walkthrough of a pre-IPO secondaries block moving from a Telegram tip to a signed NDA, with the conversation, contacts and deal kept in one Merger workspace.',
    dek: 'Sellers on WhatsApp, buyers on Telegram, the issuer’s counsel on LinkedIn. One block, five apps, and a broker who cannot afford to lose a thread.',
    published: '2026-10-16',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The block',
        blocks: [
          'Dana runs a two-person secondaries desk. On a Tuesday morning a former colleague messages her on Telegram: an early employee at a late-stage software company wants to sell a block of common stock, and he has the cap table context.',
          'Within an hour the conversation has split. The seller prefers WhatsApp. Two likely buyers, a family office and a secondaries fund, live on Telegram and LinkedIn. A third buyer only answers in a Slack Connect channel. Nobody is on email yet, and nobody wants to be.',
          'This is normal. In private markets the first two weeks of a deal happen in direct messages, and the record of who said what, at what price, sits in whichever app the other side happened to pick.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The price drifts between apps.** The seller’s floor is in WhatsApp, a buyer’s indication is in Telegram, and the counter lives in Dana’s head.',
              '**The intro gets lost.** The colleague who made the introduction shared the seller’s email and the company’s transfer-restriction notes in a message that is now 200 messages up.',
              '**Follow-ups slip.** Each app has its own unread badge. The buyer who went quiet on LinkedIn is the one nobody notices.',
              '**Paperwork starts from scratch.** When it is time for an NDA, names and emails get retyped from screenshots.',
            ],
          },
        ],
      },
      {
        heading: 'The same week, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Every thread in one list',
                text: 'Dana connects the messaging accounts she already uses. The seller’s WhatsApp chat, both Telegram buyers, the LinkedIn thread and the Slack channel sit in one list, and she replies to each from Merger on its own network.',
              },
              {
                title: 'A suggested deal, reviewed before it is filed',
                text: 'With her own Anthropic API key connected, Claude flags the Telegram introduction as a possible deal and shows the source messages. Dana checks it, edits the name to the block she actually cares about, and files it on her Deal Desk. Nothing lands on the desk without her review.',
              },
              {
                title: 'The introduction becomes contacts',
                text: 'The seller’s email and phone number, shared in the original intro, are picked up into her Rolodex with a link back to the message they came from. When the colleague later corrects the seller’s surname, she fixes the field in place.',
              },
              {
                title: 'Terms and next steps in one view',
                text: 'The deal holds the people on both sides, the indication from each buyer and the next step for each. When the LinkedIn buyer goes quiet, it is visible on the desk rather than buried in a tab she has not opened.',
              },
              {
                title: 'The NDA, with the people beside it',
                text: 'Dana opens her own DocuSign account inside Merger. Her Rolodex sits alongside the template, so she selects a recipient field and inserts the buyer’s name and email instead of retyping them. She reviews and sends from DocuSign as usual.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What changes',
        blocks: [
          'The deal does not move faster because software negotiates it. It moves faster because Dana spends the week talking to counterparties instead of reconstructing them. The price history, the introduction and the next step are in the same place when she needs them.',
          {
            type: 'callout',
            title: 'Worth knowing',
            text: 'Network availability, history and messaging actions vary by service. Claude features use your own Anthropic API key, billed by Anthropic. DocuSign access is through your own account.',
          },
        ],
      },
    ],
  },

  {
    slug: 'real-estate-syndicator-capital-raise-from-intro-to-signature',
    type: TYPES.useCase,
    audience: 'Real estate',
    title: 'From a WhatsApp intro to signed documents: a syndicator’s raise in one workspace',
    description:
      'How a real estate syndicator can track investor conversations across WhatsApp, Instagram and LinkedIn, build an investor Rolodex from introductions, and prepare DocuSign packets without retyping.',
    dek: 'Thirty investor conversations, three networks, one closing date. A walkthrough of keeping a raise organized without forcing investors onto email.',
    published: '2026-10-16',
    readMinutes: 6,
    illustrative: true,
    sections: [
      {
        heading: 'The raise',
        blocks: [
          'Marcus is raising equity for a 96-unit value-add multifamily acquisition. His investors are doctors, business owners and a few repeat LPs. Almost none of them start the conversation by email.',
          'Repeat LPs text him on WhatsApp. New prospects come in through Instagram after seeing a property tour. Referral partners make introductions on LinkedIn. His spreadsheet of soft commitments is always a day behind his messages.',
        ],
      },
      {
        heading: 'The cost of a spreadsheet that lags',
        blocks: [
          {
            type: 'list',
            items: [
              'A prospect who said “count me in for a hundred” on Instagram never makes it into the tracker.',
              'An introduction from a referral partner includes the investor’s email and entity name, and both get lost.',
              'When documents go out, contact details are copied by hand from three apps, and a typo sends a packet to the wrong address.',
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
              {
                title: 'One inbox for the raise',
                text: 'Marcus connects his WhatsApp, Instagram and LinkedIn accounts. Investor conversations appear in one list and he replies on each network from the same place.',
              },
              {
                title: 'The raise as a deal',
                text: 'He files the acquisition on his Deal Desk. As investors commit in conversation, Claude can surface those messages as suggestions; he reviews each one and keeps the source attached, so a soft commitment always links back to what the investor actually said.',
              },
              {
                title: 'An investor Rolodex that builds itself from introductions',
                text: 'When a referral partner introduces a new investor with an email and entity name, those details can become Rolodex fields with the original message one click away.',
              },
              {
                title: 'Documents without retyping',
                text: 'At closing he opens his own DocuSign account inside Merger, with the Rolodex beside his templates. He inserts each investor’s details into the field he selects, or copies them where a field will not accept Insert, then reviews and sends in DocuSign.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What it does not do',
        blocks: [
          'Merger is a workspace, not a fund administrator or a compliance system. It does not verify accreditation, hold funds or send documents on its own. It keeps the conversations, the people and the paperwork next to each other so the person running the raise can.',
          {
            type: 'callout',
            title: 'Worth knowing',
            text: 'Available networks and messaging actions vary by service. You review, send and sign in your own DocuSign account. Claude features need your own Anthropic API key.',
          },
        ],
      },
    ],
  },

  {
    slug: 'search-fund-broker-outreach-without-a-crm',
    type: TYPES.useCase,
    audience: 'Search funds',
    title: 'Running a search fund’s broker pipeline without building a CRM habit',
    description:
      'A searcher talking to dozens of business brokers across LinkedIn, WhatsApp and Telegram can keep every listing, intro and next step on one Deal Desk.',
    dek: 'Searchers live on LinkedIn and in brokers’ WhatsApp groups. Most give up on their CRM by month three. Here is a lighter way to keep the pipeline honest.',
    published: '2026-10-16',
    readMinutes: 5,
    illustrative: true,
    sections: [
      {
        heading: 'The search',
        blocks: [
          'Priya is eight months into a self-funded search for a B2B services business. Her deal flow comes from about forty business brokers, a handful of operators she met at conferences, and her own LinkedIn outreach to owners.',
          'She started with a CRM. She stopped updating it in month three, like most searchers she knows, because every listing and every follow-up already lives in a message somewhere else.',
        ],
      },
      {
        heading: 'Make the record where the work happens',
        blocks: [
          'The fix is not more discipline. It is putting the record where the conversation already is.',
          {
            type: 'steps',
            items: [
              {
                title: 'Connect the channels brokers use',
                text: 'LinkedIn for owner outreach, WhatsApp for the brokers who prefer it, Telegram for one regional broker group. All of it lands in one list.',
              },
              {
                title: 'File listings from the conversation',
                text: 'When a broker sends a teaser, Claude can suggest it as a deal with the message attached. Priya decides whether it makes the desk. Most do not, which is the point: the desk only holds what she chose to pursue.',
              },
              {
                title: 'Keep the broker, not just the deal',
                text: 'Brokers matter more than any single listing. Their contact details, picked up from introductions, stay in her Rolodex with the conversation they came from, so the next teaser from the same broker starts with context.',
              },
              {
                title: 'Next steps on one desk',
                text: 'Each live deal shows the people involved and the next step. Her weekly review with her investors starts from the desk, not from scrolling five apps.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Use it alongside what you already have',
        blocks: [
          'If you keep a CRM for investor reporting, keep it. Merger is the place the day-to-day conversations and decisions happen. You can also connect an AI assistant to read your saved contacts and deals through the [Merger API and MCP server](/developers).',
        ],
      },
    ],
  },

  {
    slug: 'your-deal-flow-lives-in-your-dms',
    type: TYPES.guide,
    audience: 'All dealmakers',
    title: 'Your deal flow lives in your DMs. Here is what that is costing you.',
    description:
      'Most private-market deals start in WhatsApp, Telegram and LinkedIn messages, not email. Why that breaks traditional deal tracking, and what a messaging-first deal workspace looks like.',
    dek: 'Email-era tools assume deals start in an inbox. For brokers, syndicators and investors today, they start in a group chat.',
    published: '2026-10-16',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Deals moved, the tools did not',
        blocks: [
          'Ask any broker where their last three deals started. The answer is rarely “an email.” It is a WhatsApp message from a former colleague, a Telegram group where blocks get shopped, a LinkedIn DM from a founder, or a Slack Connect channel with a fund.',
          'The tools most dealmakers were given were built for a different decade. CRMs and deal-tracking platforms are excellent at structured records and email sync. They are much weaker at the place the first, most valuable conversations now happen.',
        ],
      },
      {
        heading: 'The hidden costs',
        blocks: [
          {
            type: 'list',
            items: [
              '**Search time.** Finding the message where a counterparty named their price means guessing which app they used.',
              '**Dropped follow-ups.** Five apps means five unread counts. The quiet counterparty is the one that disappears.',
              '**Lost introductions.** The email, phone and title shared in an intro are the most useful contact data you will ever get, and they rarely leave the chat.',
              '**Re-keying.** When documents go out, names and addresses are copied from screenshots, and mistakes happen at exactly the wrong moment.',
              '**No memory.** When a deal revives six months later, the context is scattered across threads you may no longer have.',
            ],
          },
        ],
      },
      {
        heading: 'What a messaging-first deal workspace looks like',
        blocks: [
          'Instead of asking people to copy conversations into a CRM, the workspace starts from the conversations themselves.',
          {
            type: 'list',
            items: [
              '**Connected messaging.** Read and reply across the networks your counterparties already use, from one place.',
              '**Deals that keep their source.** A potential deal is surfaced from the conversation and reviewed by you before it is filed, with the original messages attached.',
              '**Contacts from introductions.** Details shared in an intro become contact fields you can check against the message they came from.',
              '**Paperwork beside the people.** Contact details sit next to your e-signature templates so you are not retyping them.',
            ],
          },
          'That is the workspace we are building with Merger. It is early, it runs on Windows today, and it is opening to dealmakers in small groups.',
        ],
      },
    ],
  },

  {
    slug: 'seven-ways-deals-die-in-messaging-apps',
    type: TYPES.list,
    audience: 'All dealmakers',
    title: '7 ways deals die in messaging apps, and the fix for each',
    description:
      'Lost intros, drifting prices, silent counterparties: seven common ways private-market deals fall apart in WhatsApp, Telegram and LinkedIn, with a practical fix for each.',
    dek: 'Most deals that die in messaging apps are not rejected. They are forgotten. Seven failure modes, and what to do about each one.',
    published: '2026-10-16',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: '1. The introduction scrolls away',
        blocks: [
          'The single most valuable message in a deal is often the first one: who the person is, how to reach them, why you should talk. A week later it is buried.',
          '**Fix:** Turn introductions into contact records the day they arrive, and keep a link back to the message. In Merger, details shared in an intro can become Rolodex fields with their source.',
        ],
      },
      {
        heading: '2. The price lives in three places',
        blocks: [
          'The seller’s floor is in one app, the buyer’s indication in another, and the last counter in a voice note.',
          '**Fix:** Keep terms on the deal record, not in the thread. A Deal Desk entry that holds terms and people means one place to check before you quote anyone.',
        ],
      },
      {
        heading: '3. The quiet counterparty disappears',
        blocks: [
          'Unread counts reward whoever messaged last. The buyer who went quiet is the one who needed a nudge.',
          '**Fix:** Track the next step per deal, not per app. Review the desk, not the inbox, at the start of each day.',
        ],
      },
      {
        heading: '4. You answer from the wrong account',
        blocks: [
          'Dealmakers juggle personal and work numbers, two LinkedIn profiles, and group chats with mixed audiences. Replying from the wrong one is awkward at best.',
          '**Fix:** Work from one list that shows which network and account each conversation is on, and reply on that network.',
        ],
      },
      {
        heading: '5. Paperwork starts from screenshots',
        blocks: [
          'When it is time for an NDA or LOI, names, emails and entity details are retyped from messages. That is where wrong-recipient mistakes happen.',
          '**Fix:** Keep your contacts beside your templates. Merger opens your own DocuSign account with your Rolodex alongside, so you insert details into the field you choose.',
        ],
      },
      {
        heading: '6. The CRM is always a week behind',
        blocks: [
          'Nobody updates a CRM at 11pm after a WhatsApp call. So the CRM becomes a reporting tool, not a working one.',
          '**Fix:** Capture from the conversation instead of copying into a separate system. Review suggested deals as they appear and file the ones that matter.',
        ],
      },
      {
        heading: '7. The deal revives and the context is gone',
        blocks: [
          'Plenty of deals come back after six months. By then the thread is long, the people have changed roles, and nobody remembers the old terms.',
          '**Fix:** Keep the conversation attached to the deal record so the history comes back with it.',
        ],
      },
    ],
  },

  {
    slug: 'unified-inbox-vs-crm-vs-shared-inbox-for-dealmakers',
    type: TYPES.comparison,
    audience: 'All dealmakers',
    title: 'Unified inbox, deal CRM or shared inbox? Choosing a workspace for messaging-first deals',
    description:
      'A plain comparison of unified messaging apps like Beeper, relationship CRMs built for deal teams, shared email inboxes, and Merger, for dealmakers whose deals start in chat.',
    dek: 'Three kinds of tool each solve part of the problem. Here is what each is good at, where each stops, and where Merger fits.',
    published: '2026-10-16',
    readMinutes: 7,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          'If you only need your chats in one window, a unified messaging app is enough. If your firm needs institutional reporting and email-based relationship tracking, a deal CRM is the standard. If your team shares an email inbox, a shared-inbox tool helps. Merger is for the gap between them: deals that start and move in messaging apps, and need to become organized deals with contacts and documents attached.',
          {
            type: 'table',
            head: ['Tool type', 'Good at', 'Where it stops for dealmakers'],
            rows: [
              ['Unified messaging app (for example Beeper)', 'Reading and replying across many chat networks in one app', 'No deal records, terms or next steps; contacts stay inside chats'],
              ['Deal or relationship CRM', 'Pipelines, reporting and email and calendar relationship data for firms', 'Chat apps sit outside the record; data is entered after the fact'],
              ['Shared email inbox', 'Team ownership of email threads and assignments', 'Built around email, where early deal conversations rarely happen'],
              ['Merger', 'Connected messaging, a Deal Desk fed from conversations, a Rolodex from introductions, DocuSign beside your contacts', 'Early access on Windows; network availability varies; not a replacement for firm-wide reporting'],
            ],
          },
        ],
      },
      {
        heading: 'Unified messaging apps',
        blocks: [
          'Beeper is the best-known example. It brings chat networks into one inbox and is free to start, with paid Beeper Plus and Plus Plus tiers listed in its help center at $9.99 and $30 a month as of its July 2025 relaunch. Texts.com, another unified inbox, stopped taking new registrations and moved its subscribers onto Beeper plans ([Beeper help center](https://help.beeper.com/en_US/beeper-plus/subscriptions-how-legacy-beeper-and-texts-users-are-transitioning-to-the-new-beeper)).',
          'These apps solve “too many inboxes.” They do not try to turn a conversation into a deal, track terms, or keep a counterparty’s details anywhere but the chat.',
        ],
      },
      {
        heading: 'Deal and relationship CRMs',
        blocks: [
          'Firms running institutional pipelines usually standardize on a CRM built for deal teams. These are strong at structured records, reporting to partners, and relationship data drawn from email and calendars.',
          'Their weak point for messaging-first dealmakers is input. A WhatsApp negotiation has to be summarized and typed in after the fact, which is exactly the step that gets skipped.',
        ],
      },
      {
        heading: 'Shared email inboxes',
        blocks: [
          'Shared-inbox tools help teams assign and track email threads. They are useful once a deal reaches the email stage. They are not where the first conversations happen for most brokers, syndicators and investors today.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'Merger starts from the conversation. You connect your messaging accounts and read and reply in one place. Claude, using your own Anthropic API key, can suggest potential deals from those conversations; you review each one before it is filed on your Deal Desk with its source attached. Contact details from introductions can become Rolodex fields, and your own DocuSign account opens inside Merger with those contacts beside it.',
          'It is early. Merger runs on Windows today, available networks and actions vary by service, and it is opening to dealmakers by invitation. If your firm already has a CRM it reports from, Merger can sit alongside it as the place the work happens, and the [Merger API](/developers) lets an AI assistant read your saved contacts and deals.',
        ],
      },
    ],
    sources: [
      {
        label: 'Beeper help center: how legacy Beeper and Texts users are transitioning to the new Beeper',
        href: 'https://help.beeper.com/en_US/beeper-plus/subscriptions-how-legacy-beeper-and-texts-users-are-transitioning-to-the-new-beeper',
        accessed: '2026-10-16',
      },
    ],
  },
];

export function formatDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function getArticle(slug) {
  return articles.find((article) => article.slug === slug) || null;
}

export function relatedArticles(slug, count = 3) {
  const current = getArticle(slug);
  const others = articles.filter((article) => article.slug !== slug);
  if (!current) return others.slice(0, count);
  // Same type first, then everything else, keeping file order inside each.
  return [
    ...others.filter((article) => article.type === current.type),
    ...others.filter((article) => article.type !== current.type),
  ].slice(0, count);
}

/** Every string in an article, for the claim checks in tests. */
export function articleText(article) {
  const parts = [article.title, article.description, article.dek];
  for (const section of article.sections) {
    parts.push(section.heading);
    for (const block of section.blocks) {
      if (typeof block === 'string') parts.push(block);
      else if (block.type === 'list') parts.push(...block.items);
      else if (block.type === 'steps') block.items.forEach((item) => parts.push(item.title, item.text));
      else if (block.type === 'callout') parts.push(block.title, block.text);
      else if (block.type === 'table') parts.push(...block.head, ...block.rows.flat());
    }
  }
  return parts.join('\n');
}
