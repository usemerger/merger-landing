// Playbooks added by the daily content run. Same rules as content.js: claims
// stay inside what the homepage says, use cases are illustrative composites,
// no prices, and any other company named carries a source.
// tests/playbooks.test.jsx checks this file through the combined `articles` list.

const T = { useCase: 'Use case', guide: 'Guide', list: 'List', comparison: 'Comparison' };

const WORTH_KNOWING = {
  type: 'callout',
  title: 'Worth knowing',
  text: 'Available networks, history and messaging actions vary by service. Claude features use your own Anthropic API key, billed by Anthropic. DocuSign access is through your own account.',
};

export const daily = [
  // ── 2026-10-28 ───────────────────────────────────────────────────────────
  {
    slug: 'commercial-real-estate-broker-off-market-listing-groups',
    type: T.useCase,
    audience: 'Commercial real estate',
    title: 'How a commercial real estate broker works off-market listings from a dozen WhatsApp and Telegram groups',
    description:
      'An illustrative walkthrough: off-market listings arrive in WhatsApp and Telegram broker groups. One workspace keeps the good ones, the owners and the next steps in view.',
    dek: 'Nine new listings before lunch, most of them noise, one of them exactly what a buyer asked for last month. A walkthrough of catching that one without living inside the groups.',
    published: '2026-10-28',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The groups',
        blocks: [
          'Ray is a buyer-side commercial real estate broker. He represents four private buyers looking for small industrial and flex properties, and almost none of the inventory he cares about ever reaches a listing site.',
          'It shows up in chat. He sits in seven WhatsApp groups run by local brokers, three Telegram channels where off-market packages get posted, and a handful of LinkedIn threads with owners who prefer to talk one to one. On a busy morning nine new listings land before lunch.',
          'Most of them are wrong for his buyers: the wrong size, the wrong submarket, a retail strip when his buyers want loading docks. One of them is a 40,000 square foot flex building in exactly the corridor a buyer named last month. The job is to notice that one, act on it the same day, and keep track of it after the group has moved on to forty other messages.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The good listing scrolls away.** A group posts thirty messages an hour. By the afternoon, the flex building is a long scroll up, under a debate about cap rates.',
              '**The poster is not the owner.** The listing came from another broker in the group. The owner’s name, the asking terms and the rent roll arrive later, in a private chat on a different app.',
              '**The buyer match lives in Ray’s head.** He knows which of his four buyers wants this building. Nothing written down connects the listing to that buyer.',
              '**Follow-ups depend on memory.** The co-broker said the rent roll would come Thursday. Nobody wrote that down, so nobody notices on Friday that it never came.',
              '**Paperwork starts from screenshots.** When the owner asks for a confidentiality agreement before sharing financials, the names and entity come from a screenshot of a chat.',
            ],
          },
          'None of this is a discipline problem. Group chats are built for conversation, not for keeping a short list of serious opportunities separate from everything else.',
        ],
      },
      {
        heading: 'The same morning, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Every group and direct chat in one list',
                text: 'Ray connects the WhatsApp and Telegram accounts he already uses, plus LinkedIn. The broker groups, the off-market channels and his direct threads with owners sit in one list. He reads and replies from Merger, and each reply goes out on the network the conversation started on.',
              },
              {
                title: 'A suggested deal from the listing post',
                text: 'With his own Anthropic API key connected, Claude flags the flex building post as a possible deal and shows the message it came from. Ray reviews it, names it after the building and the buyer he has in mind, and files it on his Deal Desk. The other eight listings stay in the groups where they belong.',
              },
              {
                title: 'The co-broker and the owner, saved as contacts',
                text: 'The co-broker who posted the listing and the owner he later introduces in a private chat become Rolodex contacts, each linked to the message they came from. When the owner’s entity name turns out to be different from his personal name, Ray corrects the field in place.',
              },
              {
                title: 'One next step, visible',
                text: 'The deal carries one next step: get the rent roll from the co-broker by Thursday. On Friday, the desk shows the step is still open, and Ray sends a nudge in the same WhatsApp thread instead of trying to remember where the promise was made.',
              },
              {
                title: 'The confidentiality agreement, with the right names',
                text: 'When the owner asks for a confidentiality agreement, Ray opens his own DocuSign account inside Merger. His Rolodex sits beside the template, so the owner’s corrected entity name and email go in from the contact record instead of a screenshot. He reviews and sends from DocuSign as usual.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What the desk looks like by Friday',
        blocks: [
          'By the end of the week Ray has four live deals on his desk, one for each building he is actively working, each with its source message, the people on both sides and one next step. The groups are still noisy. He still reads them. The difference is that the handful of listings that matter no longer depend on him scrolling back to find them.',
          'He also has something he did not have before: a record of which co-brokers send him listings that turn into real conversations. Over a few months that tells him which groups are worth the attention and which ones he can mute.',
        ],
      },
      {
        heading: 'What to capture for every listing worth a call',
        blocks: [
          'A listing deserves a record the moment it is worth picking up the phone. The record does not need to be long. It needs to answer the questions that come up again a week later, when the group has moved on and the details are hard to find.',
          {
            type: 'list',
            items: [
              '**The original post.** A link back to the message, so the asking terms and photos are one click away rather than a long scroll up a busy group.',
              '**Who posted it.** The co-broker, the group it appeared in and how to reach them directly. The poster is usually the fastest route to the owner.',
              '**Who owns it.** The owner’s name and, as soon as you learn it, the entity that holds the property. They are often not the same.',
              '**Which buyer it is for.** One line naming the buyer you have in mind and why: size, submarket, use. If no buyer fits, it probably does not need a record.',
              '**What you are waiting for.** The rent roll, the survey, a tour date. Write who promised it and when.',
              '**One next step.** A verb and a rough date. Call the owner Tuesday. Send the confidentiality agreement once the entity is confirmed.',
            ],
          },
          'Six fields is enough. The point is not to build a database of every post in every group. It is to make sure the handful of listings you are actually working never depend on memory.',
        ],
      },
      {
        heading: 'Questions brokers usually ask',
        blocks: [
          '**Do I have to leave the groups?** No. The groups are where the inventory is. The workspace sits on top of the chats you already use, and you keep reading and replying in them.',
          '**Will the other brokers know?** Replies go out on the network the conversation started on, from your own account, so the other side sees a normal message from you.',
          '**Does Claude decide which listings matter?** No. Claude can flag posts that look like possible deals and show you the message behind each one. You decide what gets filed, and anything you do not file stays in the chat.',
          '**What about listings that come by phone?** You can still add a deal by hand. The value of starting from the message is the link back to the source, which a phone call does not have, so a short note on the deal is the next best thing.',
        ],
      },
      {
        heading: 'A habit that works with or without software',
        blocks: [
          'If you broker off-market property from group chats, the core habit is simple. The moment a listing is worth a phone call, take it out of the group. Give it a name, attach the original post, write down who posted it and who owns it, and write one next step. Everything else can stay in the chat.',
          'Merger is built around that habit: the conversation stays where it is, and the few that matter get a home on the desk. For the weekly side of it, see [how to run a 30-minute deal review](/playbooks/run-a-weekly-deal-review-from-your-messages).',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'send-an-nda-without-retyping-names-from-chat',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'The NDA checklist for deals that start in chat: right name, right entity, right email',
    description:
      'A practical checklist for preparing an NDA when the deal started in WhatsApp, Telegram or LinkedIn: where the right details are, what to confirm, and how to avoid retyping.',
    dek: 'The fastest way to look careless in front of a counterparty is an NDA with the wrong company name on it. Here is how to get the details right when every one of them came from a chat.',
    published: '2026-10-28',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why NDAs go wrong in messaging-first deals',
        blocks: [
          'When a deal starts by email, the other side’s name, title and company sit in a signature block. When a deal starts in a messaging app, those details are scattered. The first name is on the chat. The surname came in the introduction. The legal entity was mentioned once, in passing, in a voice note or a later message. The email address was shared in a different app entirely.',
          'So when it is time for an NDA, most people reconstruct the counterparty from screenshots and memory. That is where the mistakes come from: a holding company that is not the signing entity, a personal email instead of a work one, a surname spelled the way it sounded on a call.',
          'None of these are legal disasters on their own. Each one costs a day, a re-send, and a little credibility at the exact moment the other side is deciding how seriously to take you.',
        ],
      },
      {
        heading: 'The checklist',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Confirm the signing entity, in writing',
                text: 'Ask directly which entity should sign, and ask in the same chat where the deal is happening so the answer is on the record. The person you talk to and the company that signs are often different.',
              },
              {
                title: 'Confirm the signer and their title',
                text: 'The person you have been messaging may not be the one with authority to sign. Ask who signs, and get the name spelled out rather than taken from a display name.',
              },
              {
                title: 'Get the email they want documents sent to',
                text: 'Do not assume the address from the introduction is the right one for signatures. Many people prefer a work address for documents and a personal one for chat.',
              },
              {
                title: 'Note who introduced them',
                text: 'If the introducer needs to be copied, named in the agreement or simply thanked once it is signed, you will want to know who it was without scrolling back.',
              },
              {
                title: 'Save it all in one record before you open the template',
                text: 'Put the entity, signer, title and email in a single contact record first. Then fill the document from that record. Filling the template straight from five chats is how details get crossed between two counterparties.',
              },
              {
                title: 'Read the names back before you send',
                text: 'A ten-second check of every name and email against the record catches most errors. It is the cheapest step on the list.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Where each detail usually lives',
        blocks: [
          {
            type: 'table',
            head: ['Detail', 'Where it usually turns up', 'What to watch for'],
            rows: [
              ['First and last name', 'The introduction message', 'Display names that are nicknames or initials'],
              ['Company or signing entity', 'A later message, or a deck shared in chat', 'Holding companies and funds that differ from the brand name'],
              ['Title', 'Their LinkedIn profile or the intro', 'Titles that changed since the intro was made'],
              ['Email for documents', 'Often a different app from the deal chat', 'Personal addresses used for chat but not for signing'],
              ['Introducer', 'The first message in the thread', 'Forgetting them once the deal moves to direct messages'],
            ],
          },
        ],
      },
      {
        heading: 'A worked example',
        blocks: [
          'Say a broker introduces you on LinkedIn to the owner of a logistics business. You move to WhatsApp with the owner. A week later he mentions that the business is held by a family holding company, and he shares a work email in a Telegram message to your colleague.',
          'Without a record, the NDA goes out addressed to the owner personally, at the email from the LinkedIn intro, naming the trading name of the business. The owner’s lawyer sends it back. With a record, you would have saved the owner from the intro, added the holding company and the work email when each appeared, and filled the document once.',
          'This example is illustrative. The pattern is common: the details arrive in pieces, in different apps, over days.',
        ],
      },
      {
        heading: 'Five mistakes that cost a day',
        blocks: [
          {
            type: 'list',
            items: [
              '**Using the brand name as the party.** The business your counterparty talks about is often a trading name. The signing party is the company or fund that owns it. Ask.',
              '**Sending to the chat email.** The address someone shared in passing may be one they rarely check. A document that sits unopened for three days looks like a deal that has gone cold.',
              '**Crossing two counterparties.** When two buyers are in play on the same deal, details copied from screenshots get mixed up. Filling each agreement from its own contact record prevents it.',
              '**Forgetting the second signer.** Some entities need two signatures. Ask once, early, and note it on the record.',
              '**Losing the thread of the change.** A counterparty corrects their entity name in a message. You fix it on the document but not in your notes, and the next document goes out with the old name.',
            ],
          },
        ],
      },
      {
        heading: 'When the other side sends their own NDA',
        blocks: [
          'Often the counterparty wants to use their own form. The checklist still applies, just in reverse. Before you sign, check that your own entity, signer and email are right on their document, and save their version of their entity name on your contact record. Whatever they call themselves on paper is what your next document should say too.',
          'Keep the conversation where the agreement was discussed. If a question about a clause comes up later, the context for why you agreed to it is in that thread, and a link from the deal record back to it saves a search across apps.',
          'And keep your own review step. Whoever drafted it, a person should read every NDA before it is signed or sent. This checklist is about getting the details right, not a substitute for advice from your own counsel on the terms.',
        ],
      },
      {
        heading: 'How Merger handles it',
        blocks: [
          'In Merger, names, emails, phone numbers and company details shared in an introduction can become Rolodex fields, each linked to the message it came from so you can check the source. When the signing entity or email changes, you correct the field in place.',
          'Your own DocuSign account opens inside Merger with your Rolodex beside the template, so you insert the counterparty’s details from the contact record instead of retyping them. You review the document and send it from DocuSign as usual. Merger does not send anything on its own.',
          'For the habit that makes this work, see [how to turn every introduction into a contact record](/playbooks/turn-introductions-into-contact-records).',
          WORTH_KNOWING,
        ],
      },
    ],
  },
];
