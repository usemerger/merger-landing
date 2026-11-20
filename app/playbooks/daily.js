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

  // ── 2026-10-29 ───────────────────────────────────────────────────────────
  {
    slug: 'follow-up-messages-that-restart-a-quiet-deal',
    type: T.list,
    audience: 'All dealmakers',
    title: '7 follow-up messages that restart a quiet deal conversation',
    description:
      'Seven short follow-ups for when a buyer, seller or founder goes quiet on WhatsApp, Telegram or LinkedIn, with when to send each and what to avoid.',
    dek: 'Most deals do not die with a no. They die with a silence nobody followed up on. Here are seven messages that get the conversation moving again, and when each one fits.',
    published: '2026-10-29',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why quiet threads matter more in chat',
        blocks: [
          'In a messaging-first deal there is no out-of-office reply and no email chain to forward. A counterparty who stops answering simply drifts down the list, under group chats and newer conversations. A week later you notice, and by then the silence has a reason you cannot see.',
          'The fix is not to chase harder. It is to send the right kind of follow-up at the right time, in the app the other side already uses, and to know which threads are quiet before they go cold. The messages below are short on purpose. In chat, a long follow-up reads like pressure.',
          'A useful rule: if a live deal has had no reply for five working days, it gets one of these today.',
        ],
      },
      {
        heading: '1. The specific question',
        blocks: [
          '**When to use it:** the other side went quiet after you sent something long, like terms, a deck or a list of questions.',
          '**The message:** “Quick one on the numbers you sent: is the 2024 revenue figure before or after the one-off contract?”',
          'A single, easy question is far simpler to answer than a vague check-in. It also shows you actually read what they sent. Pick the question that matters most and leave the rest for the call.',
        ],
      },
      {
        heading: '2. The useful update',
        blocks: [
          '**When to use it:** you have something new to share, even something small.',
          '**The message:** “Spoke to the lender this morning. They are comfortable with the structure we discussed. Still keen on a call this week?”',
          'Follow-ups that carry information get replies. Follow-ups that only ask for information often do not. If you have nothing new, it is usually better to wait a day and find something than to send an empty nudge.',
        ],
      },
      {
        heading: '3. The easy yes or no',
        blocks: [
          '**When to use it:** you suspect interest has cooled and you would rather know.',
          '**The message:** “Totally fine if the timing is off. Should I keep you in the loop on this one, or park it for now?”',
          'Giving someone an easy way to say no often gets you a yes, or at least an honest answer. Either is better than a silent pipeline. A clear pass also frees you to spend the time on a buyer who is still in.',
        ],
      },
      {
        heading: '4. The calendar offer',
        blocks: [
          '**When to use it:** the conversation has gone back and forth for a while and needs a call to move forward.',
          '**The message:** “Easier to talk this through? I have Tuesday at 10 or Wednesday at 3, your time.”',
          'Two concrete options beat “let me know when works.” Name the time zone. If they are in a different region, offer one slot that is friendly to their morning.',
        ],
      },
      {
        heading: '5. The introducer loop',
        blocks: [
          '**When to use it:** the deal came through an introduction, and both the counterparty and the introducer have gone quiet.',
          '**The message to the introducer:** “Thanks again for connecting me with Priya. We had a good first exchange, then it went quiet. Any sense of whether the timing changed on their side?”',
          'Introducers usually know more than they say, and most want their intros to work. Keep it light, and never ask them to chase on your behalf. This only works if you recorded who made the introduction when it happened. [Here is a simple way to do that](/playbooks/turn-introductions-into-contact-records).',
        ],
      },
      {
        heading: '6. The deadline that is real',
        blocks: [
          '**When to use it:** there is an actual date: another buyer, a lender cutoff, a seller who wants to decide by month end.',
          '**The message:** “Heads up: the seller wants to choose a buyer by the 15th. If you are still interested, can we get your indication by the 10th?”',
          'Only use real deadlines. An invented one works once and costs trust for every deal after it. When the date is genuine, saying it plainly is a favour to the other side.',
        ],
      },
      {
        heading: '7. The clean close',
        blocks: [
          '**When to use it:** you have followed up twice with nothing back.',
          '**The message:** “I will take this off my list for now. If anything changes on your side, message me here and we will pick it up.”',
          'This is not a guilt trip. It closes the loop politely, keeps the door open, and lets you remove the deal from your active list with a clear conscience. A surprising number of people reply to this one.',
        ],
      },
      {
        heading: 'Three follow-ups to stop sending',
        blocks: [
          {
            type: 'list',
            items: [
              '**“Just checking in.”** It asks the other side to do the work of remembering what you wanted.',
              '**“Bumping this.”** In a chat app, the bump is visible. It reads as impatience, not organization.',
              '**The app switch.** Moving a quiet WhatsApp conversation to email, or a LinkedIn thread to a phone call, without asking. Follow up where they last answered.',
            ],
          },
        ],
      },
      {
        heading: 'How to know which threads are quiet',
        blocks: [
          'The hard part is not writing the follow-up. It is noticing that a thread went quiet before a week has passed. When the deal lives across five apps, each with its own unread badge, nothing tells you that the buyer on LinkedIn has not replied since Tuesday.',
          'A short weekly pass fixes most of it: list every live deal, note when the other side last replied, and send one of the messages above to anything quiet for five working days. [Our 30-minute weekly review](/playbooks/run-a-weekly-deal-review-from-your-messages) walks through it.',
          'In Merger, the conversations you connect sit in one list, and each deal on the Deal Desk keeps its source conversation and one next step. Reviewing the desk shows which deals are waiting on the other side, and you reply from Merger on the network the conversation started on. You write and send every follow-up yourself.',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'pinned-chats-vs-starred-messages-vs-deal-desk',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Pinned chats, saved messages or a deal desk: three ways to track live deals in chat',
    description:
      'Most dealmakers track live deals with pinned chats or saved messages. How those built-in tools compare with a deal desk, and when each one is enough.',
    dek: 'Before anyone buys software, they pin chats and save messages. Both work for a while. Here is what each is good at, where each breaks, and what a deal desk adds.',
    published: '2026-10-29',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Method', 'Good at', 'Where it breaks'],
            rows: [
              ['Pinned chats', 'Keeping a few live conversations at the top of one app', 'Works per app; a deal with people in three apps needs three pins'],
              ['Saved or starred messages', 'Marking the one message with the price or the terms', 'Saves a message, not a deal; no next step, no people, no status'],
              ['A deal desk', 'One list of deals, each with its conversation, people and next step', 'Needs a habit of filing the deals that matter'],
            ],
          },
          'Features and limits for pinning and saving vary by app and change over time. The comparison below is about how each method fits a deal, not about any one app’s settings.',
        ],
      },
      {
        heading: 'Pinned chats',
        blocks: [
          'Pinning is the first tool almost every dealmaker reaches for, and it is a good one. A pinned chat stays at the top of the list no matter how many group messages arrive. If your three live deals each live in one WhatsApp chat, pinning those three is a working pipeline.',
          'It breaks in two ways. First, pins are per app. The seller is pinned in WhatsApp, the buyer in Telegram, the lender is a LinkedIn thread with no pin at all. To see one deal you open three apps. Second, most apps cap how many chats you can pin, and even where they do not, a pin says nothing about what happens next. Ten pinned chats look the same whether the deal is about to sign or has been quiet for three weeks.',
          '**Enough when:** you run a handful of deals, each mostly in one app, and you can remember the next step for each.',
        ],
      },
      {
        heading: 'Saved and starred messages',
        blocks: [
          'Saving a message is the second habit: star the one with the agreed price, the LOI terms or the email address from an intro. It solves a real problem. The detail you need is one tap away instead of a long scroll up the thread.',
          'But a saved message is a bookmark, not a record. It does not know which deal it belongs to, who else is involved, or what you promised to do next. Over a few months the saved list becomes a mix of prices, addresses, jokes you meant to reply to and terms from deals that closed long ago. And like pins, saved messages live inside one app, so the price in WhatsApp and the counteroffer in Telegram never sit side by side.',
          '**Enough when:** you mainly need to find one detail again, and the deal itself is simple to keep in your head.',
        ],
      },
      {
        heading: 'A deal desk',
        blocks: [
          'A deal desk starts from the deal rather than the chat. Each deal is one record: the conversations it came from, the people on each side, and one next step. The chats stay where they are. The desk is the list you look at when you want to know where things stand.',
          'In Merger, the messaging accounts you connect sit in one list. With your own Anthropic API key connected, Claude can flag a message that looks like a possible deal and show you where it came from. You review it and decide whether it goes on the Deal Desk. People from introductions can become Rolodex contacts linked to the message they came from, and your own DocuSign account opens inside Merger with those contacts beside your template.',
          'The cost is a habit. Someone has to decide which conversations are deals, and a desk full of maybes is as noisy as a chat list. The habit that works: file a deal the day it is worth a phone call, and dismiss suggestions that are not.',
          '**Better when:** deals involve people in more than one app, you run more than a handful at once, or someone else (a partner, a seller, an investment committee) asks where things stand.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'Pinned chats', 'Saved messages', 'Deal desk'],
            rows: [
              ['See all live deals at once', 'Per app only', 'No', 'Yes'],
              ['Keep the key detail findable', 'Scroll the chat', 'Yes, per app', 'The source conversation stays attached'],
              ['Know the next step', 'In your head', 'In your head', 'Written on the deal'],
              ['People in more than one app', 'One pin per app', 'One save per app', 'One deal, every conversation'],
              ['Spot a deal that went quiet', 'Only if you look', 'No', 'Visible in a weekly review'],
              ['Fill documents with the right names', 'Retype', 'Copy from the saved message', 'From contact records'],
            ],
          },
        ],
      },
      {
        heading: 'Using them together',
        blocks: [
          'These are not either-or. Plenty of people keep pinning the two or three chats they answer every day and saving the odd message, while the desk holds the full list. The difference is which one you trust when someone asks for your pipeline.',
          'A simple test: could you list every live deal, who is on the other side and the next step for each, in under two minutes and without opening a chat app? If yes, your pins are doing the job. If no, the deals have outgrown them. [Eight more signs](/playbooks/signs-your-deal-pipeline-has-outgrown-your-phone) are worth a look.',
        ],
      },
      {
        heading: 'How to move from pins to a desk without losing anything',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'List what is pinned', text: 'Go app by app and write down every pinned chat that is a live deal. Ignore the ones that are just people you talk to often.' },
              { title: 'Group by deal, not by app', text: 'A seller in WhatsApp and two buyers in Telegram are one deal. Give it one name.' },
              { title: 'Pull the saved details in', text: 'For each deal, find the saved messages that matter (price, terms, contact details) and attach or note them on the deal.' },
              { title: 'Write one next step', text: 'A verb and a rough date. If you cannot write one, the deal may already be stalled.' },
              { title: 'Unpin what the desk now holds', text: 'Keep pins for the chats you answer every day. Let the desk be the pipeline.' },
            ],
          },
          WORTH_KNOWING,
        ],
      },
    ],
  },

  // ── 2026-10-30 ───────────────────────────────────────────────────────────
  {
    slug: 'independent-sponsor-founder-conversation-across-three-apps',
    type: T.useCase,
    audience: 'Independent sponsors',
    title: 'How an independent sponsor keeps one founder conversation together across LinkedIn, WhatsApp and Signal',
    description:
      'An illustrative walkthrough: a founder sale starts on LinkedIn, moves to WhatsApp, then to Signal. How one workspace keeps the deal, the people and the next step together.',
    dek: 'The deal started on LinkedIn. Two weeks later it lives in three apps, and the one message that matters is sitting in the app nobody checked.',
    published: '2026-10-30',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The founder',
        blocks: [
          'Marcus is an independent sponsor. He has no committed fund. He finds a business, negotiates the deal, then brings in equity partners to close it. That means his pipeline is a handful of founder conversations at a time, and each one is worth months of work.',
          'In early spring he sends a LinkedIn message to the founder of a regional commercial cleaning company. The founder, Dana, replies a week later: she is open to a conversation about a sale, not this year, maybe next. Marcus books a call.',
          'After the call Dana says it is easier to text her on WhatsApp. Two weeks later, after a second call with her accountant on the line, she asks to move the conversation to Signal because that is where she talks to her advisors. Nothing about this is unusual. Founders pick the app they are comfortable with, and they change their minds.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The history splits three ways.** The first conversation about why she might sell is on LinkedIn. Her rough revenue numbers are on WhatsApp. The question about terms is on Signal. No single app holds the whole story.',
              '**The important message lands in the quiet app.** Marcus checks WhatsApp twenty times a day. Signal he opens once a week. Dana’s question, “before we go further, can we talk terms on Friday?”, sits unread for two days.',
              '**The accountant is a name in a voice call.** Dana’s accountant joined the second call. His email came in a WhatsApp message afterwards, and it is now a long scroll up.',
              '**Partners ask for a summary he has to rebuild.** When an equity partner asks where things stand, Marcus scrolls three apps to piece together a timeline he already lived through.',
            ],
          },
          'None of this is a lack of discipline. Each app is built to hold its own conversations, not to hold a deal that moves between them.',
        ],
      },
      {
        heading: 'The same three weeks, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'All three apps in one list',
                text: 'Marcus connects the LinkedIn, WhatsApp and Signal accounts he already uses. Dana’s three threads sit in the same list as everything else, newest first. When her Signal message arrives it shows up where he is already looking, and he replies on Signal from the same screen.',
              },
              {
                title: 'A suggested deal, reviewed before it is filed',
                text: 'With his own Anthropic API key connected, Claude flags the LinkedIn thread as a possible deal and shows the message behind the suggestion. Marcus reviews it, names it “Commercial cleaning, founder sale” and files it on his Deal Desk. Nothing goes on the desk until he approves it.',
              },
              {
                title: 'One deal, every conversation',
                text: 'As the conversation moves to WhatsApp and then to Signal, Marcus attaches each thread to the same deal. The deal now carries the whole history, in order, whichever app each part happened in.',
              },
              {
                title: 'The accountant becomes a contact',
                text: 'The WhatsApp message with the accountant’s details becomes a Rolodex contact, linked to the message it came from and to the deal. When the accountant later sends a corrected email address, Marcus updates the record instead of creating a second one.',
              },
              {
                title: 'One next step, written on the deal',
                text: 'After the second call the deal carries a single next step: answer Dana’s terms question by Friday. When Friday comes, the step is in front of him, and so is the Signal thread it came from.',
              },
            ],
          },
        ],
      },
      {
        heading: 'When the partner asks for an update',
        blocks: [
          'Three weeks in, an equity partner Marcus has worked with before asks where the cleaning company stands. In the old way of working, the answer would be a twenty-minute scroll and a long voice note.',
          'Instead Marcus opens the deal. The first LinkedIn exchange, the revenue numbers from WhatsApp and the terms question from Signal are all attached, in order. The accountant is a contact on the deal. The next step is dated. He writes a five-line summary and sends it on the app the partner prefers.',
          'When it is time for a mutual NDA before Dana shares her financials, Marcus opens his own DocuSign account inside Merger. Dana’s and the accountant’s details come from the Rolodex rather than from a screenshot. He reviews the envelope and sends it from DocuSign as usual.',
        ],
      },
      {
        heading: 'What to do when a conversation changes apps',
        blocks: [
          'Whether or not you use software for it, the moment a founder says “text me here instead” is the moment the deal is most likely to split. A short routine keeps it whole.',
          {
            type: 'list',
            items: [
              '**Reply in the new app the same day.** A short “got it, talk here from now on” confirms the switch and puts the first message in the new thread.',
              '**Write a one-line handover.** Note where the last useful detail lives: “revenue figures in WhatsApp, Apr 12”. Future you will thank you.',
              '**Move the people, not just the chat.** If an advisor or accountant joined along the way, save their details now, with a note on where they came from.',
              '**Keep the next step in one place.** Not in each app. One place, with a date.',
              '**Check the quiet app on purpose.** If a founder moved to an app you rarely open, add it to the apps you check every morning until the deal is done.',
            ],
          },
        ],
      },
      {
        heading: 'Questions sponsors usually ask',
        blocks: [
          '**Do I have to ask founders to change apps?** No. The point is the opposite. You meet them where they are, and the workspace keeps the deal together behind the scenes.',
          '**Does Claude decide which conversations are deals?** No. Claude can flag a thread that looks like a possible deal and show you why. You decide what gets filed, and everything else stays in your inbox.',
          '**What if part of the conversation happened on a call?** Add a short note to the deal after the call. The messages carry the written history; the note carries what was said out loud.',
          '**Can I still reply from the original apps on my phone?** Yes. Your accounts stay yours. Merger sits on top of the apps you already use.',
        ],
      },
      {
        heading: 'The habit underneath',
        blocks: [
          'Deals with founders are long, personal and spread across whatever app the founder likes this month. The habit that keeps them intact is simple: one deal, one record, every conversation attached, one dated next step. For the weekly side of it, see [how to run a 30-minute deal review](/playbooks/run-a-weekly-deal-review-from-your-messages), and for writing a next step that actually moves, see [the guide to next steps](/playbooks/write-a-next-step-for-every-deal).',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'write-a-next-step-for-every-deal',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to write a next step for every deal, and why the date matters more than the step',
    description:
      'A practical guide for dealmakers who work from chat: what a good next step looks like, who owns it, how to date it, and what to do when you cannot write one.',
    dek: 'Count your live deals. Now count the ones with a clear next step. The gap between those two numbers is where a pipeline leaks.',
    published: '2026-10-30',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The quick test',
        blocks: [
          'Write down every deal you would call live today. Then, next to each one, write the very next thing that has to happen, who has to do it and by when.',
          'Most people who run deals from chat find that a third or more of their list has no clear answer. Those are not slow deals. They are deals waiting on something nobody wrote down: a buyer waiting on numbers, a seller waiting on a call back, an NDA nobody sent.',
          'The fix is one rule. Every live deal gets exactly one next step, and a date. This guide covers how to write them so they are useful, and what to do with the deals where you cannot.',
        ],
      },
      {
        heading: 'What a good next step looks like',
        blocks: [
          'A next step is a single action that moves the deal forward. It has four parts.',
          {
            type: 'list',
            items: [
              '**A verb.** Send, call, ask, chase, decide. “Follow up” is not a verb you can do; “ask the seller for the 2025 P&L” is.',
              '**One owner.** You, or a named person on the other side. If the step is theirs, the real step is yours: when you will check.',
              '**A date.** Not “soon”. A day of the week is enough.',
              '**Where it happens.** The app or the thread. “Reply in the Telegram thread” saves you hunting for it on the day.',
            ],
          },
          {
            type: 'table',
            head: ['Weak', 'Strong'],
            rows: [
              ['Follow up with buyer', 'Send the buyer the updated numbers on WhatsApp by Tuesday'],
              ['Waiting on seller', 'Check with the seller on Thursday if the rent roll has not arrived'],
              ['NDA', 'Send the mutual NDA from DocuSign once the entity name is confirmed, Wednesday'],
              ['Circle back', 'Ask the founder on Signal whether Friday works for a terms call'],
            ],
          },
        ],
      },
      {
        heading: 'Why the date matters more than the step',
        blocks: [
          'A step without a date is a wish. It sits on the list looking active while the other side quietly assumes you lost interest.',
          'The date does two jobs. It tells you when to act, and it tells you when a deal has gone quiet. If the date passes and nothing happened, you have learned something, and you learned it on the day rather than three weeks later.',
          'Dates can be rough. “This week” is better than nothing, and “Tuesday” is better than “this week”. What matters is that a date exists, so a missed one is visible.',
        ],
      },
      {
        heading: 'Only one',
        blocks: [
          'It is tempting to write a list of five things for a deal. Resist it. Five steps means none of them is the next one, and the list goes stale the moment the first is done.',
          'Write the one action that unblocks everything else. When it is done, write the next one. The record of finished steps becomes the history of the deal, and the open step is always the answer to “where are we?”.',
        ],
      },
      {
        heading: 'When you cannot write one',
        blocks: [
          'Sometimes you sit down to write the next step and nothing comes. That is useful information. Usually it means one of three things.',
          {
            type: 'list',
            items: [
              '**The deal is waiting on the other side, and you have not set a check.** Write the check: “ask the buyer on Friday if the committee met”.',
              '**The deal is over and nobody said so.** Close it. A short, polite message to the other side keeps the relationship warm and your list honest.',
              '**You do not know what the other side wants.** Then the next step is a question. Ask it.',
            ],
          },
          'A deal with no possible next step does not belong on the live list. Move it off, and keep the conversation in your inbox for the day it comes back.',
        ],
      },
      {
        heading: 'Keep the step next to the conversation',
        blocks: [
          'The most common reason next steps get lost is that they live somewhere different from the deal: a notes app, a paper pad, the back of your mind. When the date comes, you have the step but not the context, or the context but not the step.',
          'Put the step where the conversation is. In Merger that is the deal on your Deal Desk, with the source conversations attached, so the step and the thread it came from are on the same screen. Claude can flag messages that look like a possible deal; you approve what gets filed and you write the next step. The same habit works with a spreadsheet, as long as each row links back to the right chat.',
        ],
      },
      {
        heading: 'Make it a weekly habit',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Once a week, list every live deal', text: 'Every deal, every app. If you need to scroll a chat to remember a deal exists, it is a sign the list needs a home.' },
              { title: 'Check every date', text: 'Anything past its date gets action today or an honest new date.' },
              { title: 'Write the missing steps', text: 'Every deal without a step gets one, or comes off the list.' },
              { title: 'Look one week ahead', text: 'Which steps need a document, a number or a person you have not lined up yet?' },
            ],
          },
          'It takes about half an hour. The full routine is in [the 30-minute weekly deal review](/playbooks/run-a-weekly-deal-review-from-your-messages), and [these follow-up messages](/playbooks/follow-up-messages-that-restart-a-quiet-deal) help when a date has already slipped.',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  // ── 2026-10-31 ───────────────────────────────────────────────────────────
  {
    slug: 'weekly-buyer-update-for-your-seller',
    type: T.list,
    audience: 'Business brokers and M&A advisors',
    title: '8 lines for a weekly buyer update that answers “where are we?” before the seller asks',
    description:
      'A short weekly update a broker or advisor can send a seller, line by line, built from buyer conversations spread across WhatsApp, LinkedIn and Telegram.',
    dek: 'Sellers do not want a report. They want to know the deal is moving. Eight lines, sent on the same day every week, do more for the relationship than a long call.',
    published: '2026-10-31',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why the question keeps coming',
        blocks: [
          'Every seller asks it eventually, usually by text and usually at an awkward moment: “Where are we with buyers?” It is a fair question. They have handed you something they spent years building, and from their side the process is silent.',
          'The trouble is that the honest answer is scattered. One buyer is on WhatsApp, another prefers LinkedIn messages, a third sits in a Telegram group with two other advisors. Pulling a straight answer together takes twenty minutes of scrolling, and the seller can hear the hesitation.',
          'The fix is to answer before they ask. A weekly update, sent on the same day, in the app the seller already uses, turns the anxious text into a routine. Here are the eight lines that make it work. Each one is a single sentence. If a line has nothing new, say so in four words and move on.',
        ],
      },
      {
        heading: '1. The headline',
        blocks: [
          '**What it says:** one sentence on the state of the process. “Three buyers still active, one new, one dropped.”',
          'Lead with the number. Sellers read the first line and skim the rest, so the first line should stand on its own. If the week was quiet, say that too. “Quiet week, nothing lost” is reassuring when it is true.',
        ],
      },
      {
        heading: '2. Who is new',
        blocks: [
          '**What it says:** any buyer who entered the process this week, described by type, not by name unless the seller has agreed. “A regional operator who already owns two similar businesses.”',
          'Keep it to what the seller needs to judge fit. The full profile can wait for the call.',
        ],
      },
      {
        heading: '3. Who moved forward',
        blocks: [
          '**What it says:** the buyers who took a real step. Signed the NDA, asked for the next set of numbers, booked a site visit.',
          'Only count steps the buyer took, not steps you took. “I sent the deck to five buyers” is activity. “Two asked follow-up questions about customer concentration” is progress.',
        ],
      },
      {
        heading: '4. Who went quiet',
        blocks: [
          '**What it says:** any buyer with no reply for a week, and what you are doing about it. “One buyer quiet since last Thursday. I followed up Monday and will close the loop Friday if nothing comes back.”',
          'Sellers find silence more worrying than bad news. Naming the quiet buyer, with a plan, shows you are watching. [Seven follow-ups that restart a quiet thread](/playbooks/follow-up-messages-that-restart-a-quiet-deal) can help with the plan.',
        ],
      },
      {
        heading: '5. Who dropped out, and why',
        blocks: [
          '**What it says:** any buyer who passed, with the reason they gave. “The family office passed. They want a business that does not depend on the owner for sales.”',
          'This is the most useful line in the update. A pattern in the reasons tells the seller something about how the business reads from outside, and it often comes up in pricing talks later.',
        ],
      },
      {
        heading: '6. The questions buyers are asking',
        blocks: [
          '**What it says:** the one or two questions that keep coming up. “Two buyers asked how many customers make up half of revenue.”',
          'Repeated questions are a to-do list for the seller. If three buyers ask the same thing, the answer belongs in the materials, not in individual replies.',
        ],
      },
      {
        heading: '7. What you need from the seller',
        blocks: [
          '**What it says:** a specific request with a date. “Could you send the customer list by revenue band by Wednesday?”',
          'One request is better than four. If you need more, pick the item that unblocks the most buyers and save the rest for next week.',
        ],
      },
      {
        heading: '8. What happens next week',
        blocks: [
          '**What it says:** the one or two things you expect to happen before the next update. “Site visit with the operator on Tuesday. First indications of interest due Friday.”',
          'This line sets expectations, so next week’s update has something to report against. If a date slips, the next update says so plainly.',
        ],
      },
      {
        heading: 'A sample update',
        blocks: [
          '“Quick Friday update. Three buyers active, one new, one dropped. New: a regional operator who owns two similar businesses. Moved forward: two buyers asked about customer concentration, one booked a site visit for Tuesday. Quiet: one buyer since Thursday; I followed up Monday. Dropped: the family office, because sales still run through you. Could you send the customer list by revenue band by Wednesday? Next week: site visit Tuesday, first indications due Friday.”',
          'That is under a hundred words. It fits in one message, in whatever app the seller texts you on.',
        ],
      },
      {
        heading: 'Where the update comes from',
        blocks: [
          'The update is only as easy as the record behind it. If each buyer lives in a different app, writing those eight lines means opening every app and scrolling. That is the twenty minutes the seller can hear.',
          'Two habits make it quick. Keep one line per buyer with the last thing they said and the date. And keep each buyer conversation attached to the deal, so you reread what they actually wrote instead of what you remember.',
          'In Merger, the messaging accounts you connect sit in one list, and a deal on the Deal Desk keeps the conversations it came from, the people on each side and one next step. Writing the Friday update becomes a read of one deal rather than a tour of five apps. You still write and send the update yourself. A [30-minute weekly review](/playbooks/run-a-weekly-deal-review-from-your-messages) is a good place to do it.',
          WORTH_KNOWING,
        ],
      },
    ],
  },

  {
    slug: 'broker-group-chats-mute-folders-or-deal-desk',
    type: T.comparison,
    audience: 'Buyers and brokers in listing groups',
    title: 'Muting, folders or a deal desk: three ways to work deal flow from broker group chats',
    description:
      'Listing groups on Telegram and WhatsApp surface deals early and bury them fast. How muting, chat folders and a deal desk compare, and when each one is enough.',
    dek: 'A busy broker group can post nine listings before breakfast and two hundred messages by lunch. Here is how the three common ways of coping compare, and what each one misses.',
    published: '2026-10-31',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Method', 'Good at', 'Where it breaks'],
            rows: [
              ['Muting groups', 'Protecting your attention from constant notifications', 'You see the listing hours late, or not at all'],
              ['Chat folders', 'Keeping deal groups apart from friends and family', 'Organizes chats, not listings; the good one still scrolls away'],
              ['A deal desk', 'Pulling the listings that fit out of the group and into one list', 'Needs a quick daily decision about what counts'],
            ],
          },
          'Muting and folder features vary by app and change over time. This comparison is about how each method fits a buyer’s or broker’s week, not about any one app’s settings.',
        ],
      },
      {
        heading: 'Why groups are different',
        blocks: [
          'Direct messages are about one relationship. Groups are a stream. In a listing group, a dozen brokers and buyers post opportunities, ask for comps, share news and occasionally argue. The signal is real: many off-market deals show up in a group before they show up anywhere else. The noise is real too.',
          'Most people are in several of these groups across more than one app. A buy-side searcher might follow two Telegram groups, a WhatsApp community for one region and a Slack channel run by a lender. The question is not whether to be in them. It is how to catch the two listings a day that fit what you buy.',
        ],
      },
      {
        heading: 'Muting groups',
        blocks: [
          'Muting is the first move for almost everyone, and it is the right one for your sanity. A group that buzzes forty times an hour will wreck any focused work.',
          'The cost is timing. A muted group becomes something you check when you remember, and in a busy group the listing from 8 AM is a long scroll up by noon. For competitive listings, a few hours can decide whether you get the first call with the broker.',
          '**Enough when:** the group is low volume, or listings in it are rarely time sensitive, and you have a fixed time each day to read it properly.',
        ],
      },
      {
        heading: 'Chat folders',
        blocks: [
          'Folders, or the equivalent in your app, group chats so the deal groups sit together and away from personal chats. Opening the “Deals” folder each morning is a solid habit, and it beats hunting through one long list.',
          'But a folder organizes chats, not listings. Inside the folder, each group is still a stream. The HVAC listing that fits your criteria sits between a question about lender appetite and a link to an article. And folders are per app, so a Telegram folder does nothing for the WhatsApp community or the Slack channel.',
          '**Enough when:** most of your groups are in one app, and you read them at least once a day.',
        ],
      },
      {
        heading: 'A deal desk',
        blocks: [
          'A deal desk changes the unit from the chat to the deal. When a listing in a group fits, it becomes a deal record: the message it came from, the broker who posted it and one next step. The group keeps streaming. The desk holds the handful of listings worth a call.',
          'In Merger, the messaging accounts you connect sit in one list, groups included where the service allows it. With your own Anthropic API key connected, Claude can flag a message that looks like a possible deal and show you where it came from. You decide whether it goes on the Deal Desk. The broker who posted it can become a Rolodex contact linked to that message, which matters because the broker who sends one good listing usually sends the next.',
          'The cost is a daily decision. A flag is a suggestion, not a verdict, and a desk full of maybes is as noisy as the group. The habit that works: review suggestions once or twice a day, approve the listings you would actually call about, dismiss the rest.',
          '**Better when:** you follow groups in more than one app, listings are time sensitive, or you need to show a partner which opportunities you are pursuing.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'Muting', 'Folders', 'Deal desk'],
            rows: [
              ['Protect your attention', 'Yes', 'Partly', 'Yes, groups stay in their own list'],
              ['See a fitting listing early', 'Only if you check', 'Only if you check', 'Flagged for your review'],
              ['Groups in more than one app', 'Mute each one', 'One folder per app', 'One inbox'],
              ['Keep the original listing findable', 'Scroll up', 'Scroll up', 'Attached to the deal'],
              ['Remember which broker sent it', 'In your head', 'In your head', 'Contact linked to the message'],
              ['Know the next step', 'In your head', 'In your head', 'Written on the deal'],
            ],
          },
        ],
      },
      {
        heading: 'Using them together',
        blocks: [
          'These are not either-or. Keep groups muted, so they never interrupt a call. Keep a deals folder in the app you use most, for the days you want to read the whole stream. And let the desk hold the listings you are actually pursuing.',
          'A simple test: name the last three listings from your groups that fit your criteria, who posted each one and what you did next. If you can do it in under a minute, your current setup works. If you have to go looking, the groups have outgrown it. The [commercial real estate walkthrough](/playbooks/commercial-real-estate-broker-off-market-listing-groups) shows one broker’s version of this week.',
        ],
      },
      {
        heading: 'A ten-minute morning routine for group deal flow',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Write down what fits', text: 'Three or four criteria you can check in a few seconds: sector, region, size, deal type. Pin them somewhere you will see them.' },
              { title: 'Read each group once', text: 'Muted all night, read once in the morning. Skim for listings only; skip the discussion.' },
              { title: 'Pull out the fits', text: 'Anything that matches goes into one list with the original message and the broker’s name.' },
              { title: 'Reply in the group’s app', text: 'Message the broker directly, in the app they posted on. A fast, specific reply gets the first call.' },
              { title: 'Set one next step', text: 'For each listing you pursue, a verb and a date. Drop the rest without guilt.' },
            ],
          },
          WORTH_KNOWING,
        ],
      },
    ],
  },

  // ── 2026-11-01 ───────────────────────────────────────────────────────────
  {
    slug: 'private-credit-originator-loan-requests-across-messaging-apps',
    type: T.useCase,
    audience: 'Private credit',
    title: 'How a private credit originator keeps loan requests from five messaging apps in one pipeline',
    description:
      'An illustrative walkthrough: borrower requests arrive on WhatsApp, LinkedIn, Telegram, Slack and Signal. How one workspace keeps each request, its people and its next step together.',
    dek: 'Borrowers do not fill in intake forms. They send a voice note on WhatsApp at 9 PM and a rent roll on Telegram the next morning.',
    published: '2026-11-01',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The desk',
        blocks: [
          'Priya originates loans for a small private credit fund that lends against commercial real estate and to lower middle market businesses. She is the first conversation a borrower has with the fund. Her job is to find the requests worth pursuing, collect enough to size them, and hand a clean file to the credit committee.',
          'On paper there is an intake process. In practice, almost nothing arrives through it. Brokers she has known for years message her on WhatsApp. A mortgage advisor she met at a conference sends deals over LinkedIn. A borrower group she belongs to posts requests on Telegram. Her fund’s partners talk in Slack, and one repeat sponsor will only use Signal.',
          'In a normal week she sees thirty or forty requests. Most are a poor fit. Four or five are worth a call, and one or two will reach committee. The work is not reading the requests. It is making sure the good ones do not get lost among the rest.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The request and the documents arrive in different apps.** The broker describes the loan on WhatsApp. The borrower sends the rent roll on Telegram. The appraisal comes through a LinkedIn message a week later. Nobody sends everything in one place.',
              '**Good requests sink in group chats.** A refinance that fits the fund’s box is posted in a busy Telegram group at 8 AM. By lunch it is sixty messages up, under a debate about rates.',
              '**Committee asks for a summary she has to rebuild.** When a partner asks in Slack where a deal stands, Priya scrolls four apps to rebuild a timeline she already lived through.',
              '**The broker who sent the deal is forgotten.** Six months later, when the loan closes, she cannot remember whether the intro came from the broker or the borrower’s advisor. The person who should get the thank-you, and the next deal, does not.',
            ],
          },
          'None of this is carelessness. Each app is built to hold its own conversations. A loan request that moves between five of them has no natural home.',
        ],
      },
      {
        heading: 'One inbox before one pipeline',
        blocks: [
          'In this composite, Priya starts by connecting the apps where requests actually arrive: WhatsApp, LinkedIn, Telegram, Slack and Signal. Her conversations now sit in one inbox in Merger, in the order they arrived, without her switching apps to check each one.',
          'This step changes less than people expect and more than they think. The requests are the same. What changes is that the Telegram group and the Signal thread are no longer the apps she forgets to open. Everything is read in the same place, at the same time of day.',
        ],
      },
      {
        heading: 'Flagged, then approved',
        blocks: [
          'With her own Anthropic API key connected, Claude reads her conversations and flags messages that look like a possible deal: a borrower describing a loan, a broker asking whether a request fits, a sponsor asking for terms. A flag is a suggestion. Nothing is filed until Priya reviews it.',
          'The 8 AM refinance in the Telegram group is flagged. Priya reads it, decides it fits, and approves it onto her Deal Desk. The request becomes a deal with the source conversation attached. When the borrower sends the rent roll later that day, she attaches that conversation to the same deal.',
          'Most flags she dismisses, and that is the point. The decision about what counts as a real request stays with the person who knows the fund’s box. Claude only makes sure the candidates are in front of her.',
          {
            type: 'callout',
            title: 'Why the review step matters',
            text: 'A lender’s pipeline is a list of judgments. A tool that filed every mention of a loan would bury the good requests again, just in a different place. Flag, review, approve keeps the list short and real.',
          },
        ],
      },
      {
        heading: 'People, not just threads',
        blocks: [
          'When the broker introduces the borrower on WhatsApp, Priya saves the borrower as a contact in her Rolodex, linked to the message that introduced them. The broker is already there from an earlier deal.',
          'Six months later, when the loan closes, the record shows who opened the door. Priya sends the broker a thank-you the same afternoon. In a business where most deal flow comes from a few dozen relationships, that is not a courtesy. It is the next deal.',
        ],
      },
      {
        heading: 'The term sheet stage',
        blocks: [
          'Before the borrower shares financials, the fund asks for a confidentiality agreement. Priya sends the NDA from her own DocuSign account inside Merger, with the borrower’s details coming from the Rolodex contact rather than retyped from a chat. She checks the names once and sends it herself.',
          'The signed NDA, the conversations and the next step all sit on the same deal. When a partner asks in Slack where the refinance stands, the answer is one screen, and she can reply in the Slack thread without leaving her inbox.',
        ],
      },
      {
        heading: 'What a week looks like now',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Morning: one pass through the inbox', text: 'Every app, read once. Flags reviewed, most dismissed, a few approved.' },
              { title: 'Each live request gets one next step', text: 'Ask for the rent roll. Book the sponsor call. Send the NDA. One step and a date.' },
              { title: 'Documents attached as they arrive', text: 'Whichever app they come through, they join the deal they belong to.' },
              { title: 'Friday: the committee list', text: 'Every live deal on one screen, with its conversation and its next step. No rebuilding.' },
            ],
          },
          'The [weekly deal review](/playbooks/run-a-weekly-deal-review-from-your-messages) covers the Friday routine in more detail, and [turning introductions into contact records](/playbooks/turn-introductions-into-contact-records) covers the Rolodex habit.',
        ],
      },
      {
        heading: 'What to take from this',
        blocks: [
          'Lending runs on relationships, and relationships run on whatever app the other side prefers. You will not move borrowers and brokers onto an intake form. What you can do is read every app in one place, decide quickly which requests are real, and keep each one together with the people and documents that belong to it.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'close-a-dead-deal-without-burning-the-relationship',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to close out a dead deal without burning the relationship',
    description:
      'A practical guide for dealmakers who work from chat: how to tell a deal is over, what to send, what to keep, and why a clean close often brings the next deal.',
    dek: 'Most deals do not end with a no. They end with silence, and a pipeline full of deals nobody has the heart to close.',
    published: '2026-11-01',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why dead deals stay on the list',
        blocks: [
          'Look at your live deals and count the ones where nothing has happened in a month. For most people who run deals from chat, it is a meaningful share of the list.',
          'They stay for understandable reasons. Closing a deal feels like admitting defeat. The other side might come back. And in a chat app there is no moment where a deal officially ends. The conversation just stops, and the thread slides down the screen.',
          'The cost is real, though. A list full of dead deals hides the live ones. Your weekly review takes longer, your follow-ups go to people who have moved on, and when someone asks how many deals you are working, the honest answer is unclear even to you.',
        ],
      },
      {
        heading: 'How to tell a deal is over',
        blocks: [
          'A deal is not dead because it is slow. Some of the best deals take a year. Use signals, not feelings.',
          {
            type: 'list',
            items: [
              '**Two follow-ups with no reply.** One unanswered message is a busy week. Two, spaced a week or more apart, is an answer.',
              '**The reason for the deal is gone.** The seller decided to keep the business. The buyer closed on something else. The fund’s mandate changed.',
              '**You cannot write a next step.** If you sit down to write the next action and nothing makes sense, the deal is probably over. The guide on [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers this test.',
              '**Terms are too far apart, and both sides said so.** Not every gap closes. When both sides have named their limit, it is fine to stop.',
            ],
          },
        ],
      },
      {
        heading: 'Send a closing message',
        blocks: [
          'The single most useful habit is to send a short message that closes the loop. It does three things: it ends the ambiguity for both sides, it leaves a good last impression, and it gives the other side an easy way to come back.',
          'Keep it short, warm and specific. Send it in the app where the conversation happened, not in a new channel.',
          {
            type: 'table',
            head: ['Situation', 'A closing message that works'],
            rows: [
              ['No reply after two follow-ups', 'I’ll take the quiet as a not-right-now. I’m closing this out on my side. If timing changes, message me here and we’ll pick it up.'],
              ['Seller decided not to sell', 'Thanks for being straight with me. If anything changes in a year or two, I’d like to be the first call.'],
              ['Terms too far apart', 'We’re too far apart on structure to make this work today. I appreciated the time. Happy to look again if the picture changes.'],
              ['Buyer went with another deal', 'Congratulations on closing. I’ll keep you in mind for anything similar.'],
            ],
          },
          'If you are not sure the deal is dead, say so in the message. “It sounds like the timing is wrong, so I’m pausing this on my side” is honest, and it invites a correction if you read the silence wrong. A surprising number of quiet deals restart with a reply to exactly this kind of message.',
          'None of these messages asks for anything. That is deliberate. A closing message that is secretly another follow-up reads as pressure, and pressure is what burns relationships.',
        ],
      },
      {
        heading: 'Keep the record, not the deal',
        blocks: [
          'Closing a deal does not mean deleting it. The conversation, the people and the reason it ended are worth keeping, because dead deals come back more often than people expect.',
          'Before you take it off the live list, write one line: why it ended and what would have to change for it to come back. “Seller not ready; revisit after next year’s numbers” is enough. When the seller messages you eighteen months later, that line and the original thread are the difference between picking up where you left off and starting over.',
          'Keep the people too. The broker who sent you the deal still sends deals. The buyer who went elsewhere will be buying again. Save them as contacts, linked to the conversation that introduced them, so the relationship outlives the deal.',
        ],
      },
      {
        heading: 'Make it part of the weekly review',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Sort by last activity', text: 'Every live deal, oldest conversation first.' },
              { title: 'Apply the signals', text: 'Two unanswered follow-ups, reason gone, no possible next step, terms named and apart.' },
              { title: 'Send the closing message', text: 'Same day, same app, no ask.' },
              { title: 'Write the one line and move it off the live list', text: 'Why it ended, and what would bring it back.' },
            ],
          },
          'It adds about five minutes to [the 30-minute weekly deal review](/playbooks/run-a-weekly-deal-review-from-your-messages), and it makes the rest of the review faster.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, a deal on your Deal Desk keeps its source conversations attached, so the closing message goes out in the right thread and the history stays with the deal after you move it off the live list. Contacts in your Rolodex stay linked to the message that introduced them. Claude can flag messages that look like a possible deal, including an old contact who comes back; you decide what goes on the Desk.',
          'The habit works without any tool, though. What matters is that a dead deal gets a clean ending, a one-line reason and a door left open.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-01 (b) ───────────────────────────────────────────────────────────
  {
    slug: 'places-deal-terms-hide-in-your-chats',
    type: T.list,
    audience: 'All dealmakers',
    title: '8 places deal terms hide in your chats, and how to pull each one out',
    description:
      'Prices, dates and conditions agreed in WhatsApp, Telegram and LinkedIn messages often end up somewhere nobody can find them. Eight common hiding places and a fix for each.',
    dek: 'The number was agreed. Everyone remembers agreeing it. Nobody can find where. Here are the eight places terms usually go missing in a chat-first deal, and the small habit that brings each one back.',
    published: '2026-11-01',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why terms get lost in chat',
        blocks: [
          'In a deal that runs on email, the terms tend to end up in an attachment or a long thread you can search. In a deal that runs on messaging apps, they end up wherever the conversation happened to be that day. A price in a voice note. A closing date in a group chat. A condition in a reply to a reply.',
          'None of that is a problem while the deal is moving. It becomes one the moment someone asks, “What did we agree?” and you have to reconstruct it from memory across four apps. The list below is about catching terms when they are said, not hunting for them later.',
          'One rule underlies every fix: a term is not agreed until it exists in writing, in one place, next to the deal it belongs to.',
        ],
      },
      {
        heading: '1. Voice notes',
        blocks: [
          'A two-minute voice note from a seller can carry the price, the timeline and a condition, all in one breath. It is fast for them and invisible for everyone else. You cannot search a voice note, quote it or forward the relevant ten seconds.',
          '**Fix:** reply in text with the number. “Confirming: asking price stays where you said, close targeted for Q1, owner stays on for six months.” If the reply is wrong, they will correct it now, not at the letter of intent.',
        ],
      },
      {
        heading: '2. Screenshots in the camera roll',
        blocks: [
          'Someone sends a screenshot of a spreadsheet or a term summary. You save it, or it saves itself. Three weeks later it is one of four hundred images, with no name and no link to the conversation it came from.',
          '**Fix:** when an image carries terms, type the two or three numbers that matter into the deal record the same day, with the date and who sent it. The screenshot is the evidence. Your note is the part you will actually read.',
        ],
      },
      {
        heading: '3. Group chats',
        blocks: [
          'A buyer confirms an earnest money figure in a group with the broker, the seller’s advisor and two people nobody can place. By lunch the message is sixty replies up, under a debate about rates.',
          '**Fix:** move the agreement, not the conversation. Reply directly to the person in the same app: “Just to confirm what you said in the group.” Now the term lives in a one-to-one thread you can find, and the group stays a group.',
        ],
      },
      {
        heading: '4. Edited and deleted messages',
        blocks: [
          'Many messaging apps let people edit or delete messages, and how visible that is varies by app. A number that was there on Tuesday can look different on Thursday, with nothing more than a small “edited” label, if that.',
          '**Fix:** treat a message as a draft and your confirmation as the record. When a term matters, restate it in your own message. If something later changes, ask about it directly rather than relying on what the thread shows today.',
        ],
      },
      {
        heading: '5. A reply to a reply',
        blocks: [
          'Quoted replies are useful until they nest. “Yes to that” only means something if you can still see what “that” was, and in a long thread the quoted message may be days up and two topics ago.',
          '**Fix:** answer terms with full sentences. “Yes to the six-month transition” costs five extra words and survives being read out of context, which is how every term is eventually read.',
        ],
      },
      {
        heading: '6. The other app',
        blocks: [
          'The price was set on WhatsApp. The closing date came up on LinkedIn. The condition about the lease arrived on Signal, because that is where the seller’s partner lives. Each app holds a third of the deal, and none of them knows about the others.',
          '**Fix:** keep one deal record that every app feeds into. It can be a document, a spreadsheet row or a deal workspace. What matters is that you write each term into the same place, with the app and date it came from.',
        ],
      },
      {
        heading: '7. Your own head',
        blocks: [
          'Some terms are only ever said on a call. “We can live with a small holdback.” Nobody writes it down, and in a month both sides remember a slightly different number.',
          '**Fix:** after any call where a term moved, send a short message in the app where the deal lives: “Good call. Noting what we discussed: holdback is on the table, size to be agreed.” It turns a memory into a record both sides have seen.',
        ],
      },
      {
        heading: '8. A message you meant to answer later',
        blocks: [
          'The buyer asks a direct question about terms while you are between meetings. You read it, plan to answer properly, and then forty other messages arrive. The question is unanswered, and the term it was about is undecided.',
          '**Fix:** when you read a term question and cannot answer now, give it a next step right away, even a rough one: “Answer the holdback question by 10 tomorrow.” The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the habit.',
        ],
      },
      {
        heading: 'A five-minute end-of-day check',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'List the deals that moved today', text: 'Any deal where a price, date or condition came up, in any app.' },
              { title: 'Find the sentence', text: 'For each one, find the message where the term was said. If it was a voice note or a call, there is no sentence yet.' },
              { title: 'Write the confirmation', text: 'One short message, in the app the deal lives in, that restates the term in full.' },
              { title: 'Copy it to the deal record', text: 'Same words, with the date and the person who agreed it.' },
            ],
          },
          'It sounds like admin. It is cheaper than the call where both sides discover they agreed different things.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so the WhatsApp price, the LinkedIn date and the Signal condition are read in the same place. A deal on your Deal Desk keeps its source conversations attached, so the confirmation you sent is next to the deal it belongs to. With your own Anthropic API key, Claude can flag messages that look like a possible deal; you decide what goes on the Desk.',
          'The habit matters more than the tool, though. Terms that are restated in writing, in one place, survive the deal. Terms that live in voice notes and memory rarely do.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'reply-in-their-app-vs-move-everyone-to-one-channel',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Reply in their app or move everyone to one channel? How to handle counterparties on different messaging apps',
    description:
      'Buyers on WhatsApp, sellers on Telegram, advisors on LinkedIn. Comparing three ways to handle it: move everyone to one channel, reply in each app, or one inbox for all of them.',
    dek: 'Every dealmaker has tried asking a counterparty to switch apps. Sometimes it works. Often it costs a little momentum each time. Here is how the three common approaches compare.',
    published: '2026-11-01',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Approach', 'Good at', 'Where it breaks'],
            rows: [
              ['Move everyone to one channel', 'One searchable place for the whole deal', 'Counterparties reply slower, or keep using their app anyway'],
              ['Reply in each app', 'Fast replies, no friction for the other side', 'The deal is split across apps and you carry the map in your head'],
              ['One inbox for every app', 'Replies stay in their app, and you read everything in one place', 'You still need a habit for deciding what is a deal'],
            ],
          },
        ],
      },
      {
        heading: 'Why counterparties pick the app',
        blocks: [
          'People choose a messaging app for reasons that have nothing to do with your deal. A seller uses WhatsApp because that is where their family is. A secondaries buyer lives on Telegram because their whole desk does. A banker answers on LinkedIn because it is open all day. A founder’s co-investor insists on Signal.',
          'Each of those choices is reasonable on its own. Together they mean that a single deal with four people can involve four apps. The question is who carries the cost of that: the counterparties, or you.',
        ],
      },
      {
        heading: 'Option 1: move everyone to one channel',
        blocks: [
          'The traditional answer is to pick a channel, often the one you prefer, and ask everyone to move there. “Can we take this to a group?” or “Let’s keep everything in one thread.”',
          'The benefit is real. One channel is one place to search, one history to forward to a partner and one record of who said what. For long deals with many parties, a dedicated group can work well once everyone is in it.',
          'The cost shows up in small ways. Each switch asks the other side to do something for your convenience. Some will, and then answer a day slower because the new channel is not where they live. Others will agree and keep messaging you in their app anyway. Early in a deal, when interest is fragile, that friction can be the difference between a fast reply and none.',
          '**Works when:** the deal is far enough along that every party has a reason to make the effort, and someone is clearly running the process.',
        ],
      },
      {
        heading: 'Option 2: reply in each app',
        blocks: [
          'The opposite approach is to meet everyone where they are. The seller gets WhatsApp replies, the buyer gets Telegram replies and the banker gets LinkedIn replies. Nobody is asked to switch.',
          'Counterparties like this. Replies are fast, the tone stays natural and nobody feels managed. For relationship-driven deal flow, this is usually the better instinct.',
          'The cost moves to you. The deal now lives in four apps and only you know how the pieces fit. A question on Signal sits unread because you checked WhatsApp twice and Signal once. When a partner asks where things stand, you rebuild the timeline by scrolling. The [seven ways deals die in messaging apps](/playbooks/seven-ways-deals-die-in-messaging-apps) are mostly versions of this problem.',
          '**Works when:** you have only a few live deals, each with one or two people, and you check every app at fixed times.',
        ],
      },
      {
        heading: 'Option 3: one inbox for every app',
        blocks: [
          'The third approach keeps the counterparty’s choice and fixes your side of it. Every app you use for deals feeds one inbox. You still reply in the app they chose, but you read everything in one place and in the order it arrived.',
          'In Merger, the messaging accounts you connect sit in that one inbox, and you reply from it in each person’s app. With your own Anthropic API key connected, Claude can flag messages that look like a possible deal. You decide what goes on the Deal Desk, and an approved deal keeps its conversations attached, whichever apps they came from.',
          'The cost is a habit. One inbox means more messages in one list, and a deal desk full of maybes is as noisy as four apps. The routine that works: review flags once or twice a day, approve what you would actually act on, dismiss the rest.',
          '**Works when:** your deals regularly involve people on different apps, or you are tired of being the only place the full picture exists.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'One channel', 'Reply in each app', 'One inbox'],
            rows: [
              ['Fast replies from the other side', 'Slower after the switch', 'Yes', 'Yes'],
              ['No friction for counterparties', 'They have to move', 'Yes', 'Yes'],
              ['One place to read the deal', 'Yes, once everyone moved', 'No', 'Yes'],
              ['Answer a partner’s status question', 'Search one thread', 'Scroll several apps', 'Open the deal'],
              ['Catch the question in the app you check least', 'Not an issue after the move', 'Easy to miss', 'In the same list'],
            ],
          },
        ],
      },
      {
        heading: 'A practical rule',
        blocks: [
          'Do not ask anyone to switch apps until the deal gives them a reason to. Early on, reply where they wrote. Once there is a signed NDA and several parties need the same information, a shared group or a data room can make sense, and by then nobody minds the extra step.',
          'Whatever you choose, keep one record of the deal outside any single app. A term agreed on WhatsApp and a date set on LinkedIn belong on the same page. The list of [places deal terms hide in your chats](/playbooks/places-deal-terms-hide-in-your-chats) covers how to pull them out.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-14 ───────────────────────────────────────────────────────────
  {
    slug: 'self-storage-investor-buying-facilities-from-owners-across-messaging-apps',
    type: T.useCase,
    audience: 'Real estate investors',
    title: 'How a self-storage investor buys facilities from owners who answer on four different messaging apps',
    description:
      'An illustrative walkthrough: a self-storage buyer works owner leads from WhatsApp, LinkedIn, Messenger and a Telegram broker group, and keeps each facility, owner and next step in one place.',
    dek: 'The owners who sell small storage facilities rarely live on email. One answers on WhatsApp, one on Facebook Messenger, one only through his son on LinkedIn. A walkthrough of keeping four conversations from becoming four lost deals.',
    published: '2026-11-14',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The buy box',
        blocks: [
          'Marcus buys small self-storage facilities with two partners. Their buy box is narrow: 200 to 500 units, older owners, secondary towns within a day’s drive, and room to add climate-controlled units or raise rents that have not moved in years.',
          'Facilities like that almost never reach a listing site. They come from owners who have run the place for twenty years, from local brokers who know them, and from a Telegram group where a few dozen storage investors swap leads. Marcus’s pipeline is a mix of cold outreach, introductions and group posts.',
          'At any time he has around fifteen owner conversations going. On a normal week three of them move. The rest are owners who said “not yet”, owners who stopped replying, and owners whose sons or daughters are now the ones answering.',
        ],
      },
      {
        heading: 'Four owners, four apps',
        blocks: [
          'Here is one ordinary week, with invented names.',
          {
            type: 'list',
            items: [
              '**Glenn, WhatsApp.** Owns a 340-unit facility two hours north. Marcus met him at a regional conference. Glenn sends voice notes and the occasional photo of the office. On Tuesday he writes: “Thinking about it more seriously after the holidays.”',
              '**Rita, Facebook Messenger.** Found through a local group. Rita answers fast, in short lines. She asks whether Marcus would keep her manager on, which is the real question behind any sale she would consider.',
              '**Paul, LinkedIn.** Paul’s father owns the facility; Paul handles the business side. He sends a rough rent roll as an attachment and asks for a call “sometime next week”.',
              '**A Telegram post.** A broker in the investor group posts a 260-unit facility with a gravel lot and expansion land. Two other investors reply in the thread within an hour.',
            ],
          },
          'None of these is an offer yet. Each is a possible deal, and each has a different next step: a date to check back with Glenn, an answer on the manager for Rita, a call with Paul, and a private message to the broker before the Telegram post goes cold.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**“After the holidays” has no date.** Glenn’s message is the warmest of the week and the easiest to lose. By February it is forty voice notes up.',
              '**The real question goes unanswered.** Rita asked about her manager. Marcus meant to check with his partners and reply. Messenger is the app he opens least.',
              '**The rent roll lives in a LinkedIn attachment.** When a partner asks what the facility collects, Marcus scrolls LinkedIn to find it.',
              '**The group lead is first come, first served.** By the time Marcus messages the broker privately, the broker has already sent the package to the two investors who replied in the thread.',
              '**The partners see none of it.** His partners ask for a status update on Friday. Marcus rebuilds the week from four apps.',
            ],
          },
          'Nothing here is unusual. Small-facility owners pick the app they already use with their family, and the buyer carries the cost of keeping the picture together.',
        ],
      },
      {
        heading: 'The same week, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Every owner chat in one list',
                text: 'Marcus connects the WhatsApp, Messenger, LinkedIn and Telegram accounts he already uses. Glenn, Rita, Paul and the investor group sit in one inbox. He replies from Merger, and each reply goes out in the app the owner chose.',
              },
              {
                title: 'Possible deals flagged for review',
                text: 'With his own Anthropic API key connected, Claude flags Glenn’s “more seriously after the holidays”, Paul’s rent roll and the Telegram post as possible deals. Marcus reads each conversation and decides. He approves all three, and passes on a fourth flag from an owner who was only asking about a referral.',
              },
              {
                title: 'One deal per facility, conversations attached',
                text: 'Each approved facility goes on the Deal Desk with its conversation attached. The rent roll Paul sent sits with Paul’s facility. Glenn’s voice notes sit with Glenn’s.',
              },
              {
                title: 'A next step with a date',
                text: 'For Glenn: “Check in January 8, ask about timing and whether his daughter is involved.” For Rita: “Answer the manager question by Thursday.” For Paul: “Offer two call times.” For the group lead: “Message the broker directly today.”',
              },
              {
                title: 'Owners saved as contacts',
                text: 'Paul is saved to the Rolodex with a note that his father is the owner, linked to the message where Paul introduced himself. When a buyer later asks who decides, the answer is one click away.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What changed for Rita',
        blocks: [
          'The manager question was the one most likely to slip, because it needed a conversation with the partners first. On the Deal Desk it had a next step with a date, so it came up on Thursday instead of three weeks later.',
          'Marcus answered on Messenger in two lines: the partners would keep the manager for at least a year, and they would want to meet her before making an offer. Rita replied within the hour and asked when they could visit. A reply like that rarely comes from a question answered late.',
          'None of this needed new software habits from Rita. She stayed on Messenger the whole time.',
        ],
      },
      {
        heading: 'What to copy, with or without software',
        blocks: [
          {
            type: 'list',
            items: [
              '**Give every “not yet” a date.** An owner who says “after the holidays” has told you when to ask again. Write the date down the same day.',
              '**Answer the question behind the question.** Owners of small facilities usually care about their staff, their customers and their name in town as much as the price. Answer that first.',
              '**Keep documents with the deal, not the app.** A rent roll in a LinkedIn attachment is hard to find when a partner asks for it. Note where each document lives, or keep it with the deal.',
              '**Move group leads to a private message fast.** A post in a group is seen by everyone in the group. Reply to the broker directly, the same hour if you can.',
              '**Write the Friday update from one list.** If the update takes more than ten minutes to write, the pipeline is in too many places.',
            ],
          },
          'The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the date habit in more detail, and [turning introductions into contact records](/playbooks/turn-introductions-into-contact-records) covers the Rolodex side.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, and you reply in each owner’s app. With your own Anthropic API key, Claude can flag messages that look like a possible deal; nothing goes on the Deal Desk until you approve it. Approved deals keep their conversations attached, contacts live in the Rolodex linked to the message they came from, and confidentiality agreements can go out from your own DocuSign account.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'ask-for-an-introduction-someone-can-forward-in-one-message',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to ask for an introduction that someone can forward in one message',
    description:
      'Most intro requests stall because they ask the introducer to write your pitch. Here is the three-line blurb to send instead, with examples, an easy out, and what to do when the intro lands.',
    dek: '“Could you introduce me to Dan?” asks your contact to explain who you are, why Dan should care and what you want. Most people mean to. Then the week happens. Write the part they forward.',
    published: '2026-11-14',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why intro requests stall',
        blocks: [
          'An introduction is a favor, and the size of the favor decides whether it happens this week. When you ask “Could you introduce me to Dan?”, you are asking your contact to do three things: remember what you do, work out why Dan would care, and write a message Dan will answer.',
          'That is ten minutes of thought for someone who owes you nothing. They agree, they mean it, and the request sinks under the rest of their messages. Two weeks later you are deciding whether a follow-up would be rude.',
          'The fix is to do the writing yourself. Send a short blurb your contact can forward as it is, in whatever app they use with Dan. Now the favor is copy, paste and send.',
        ],
      },
      {
        heading: 'The three-line blurb',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Who you are, in one line',
                text: 'Write it in the third person so it reads naturally when forwarded. “Maya Ruiz is a search funder buying one services business in the Southeast.” Not your whole background. One line Dan can place.',
              },
              {
                title: 'Why this person',
                text: 'The specific reason you want Dan and not anyone else. “Dan sold a company like the ones she looks at.” If you cannot write this line, you are not ready to ask for the intro.',
              },
              {
                title: 'What you would ask',
                text: 'A small, clear ask with a limit. “Twenty minutes on how his handover went.” A small ask is easy to say yes to, and a clear one tells Dan what the call is for.',
              },
            ],
          },
          'Then add one sentence that makes saying no easy: “No pressure if the timing is wrong.” People forward more readily when they know the other side can decline without awkwardness.',
        ],
      },
      {
        heading: 'What it looks like',
        blocks: [
          'Two messages to your contact, in the app you already talk in. First the request, then the blurb on its own so it can be forwarded cleanly:',
          {
            type: 'callout',
            title: 'Message 1',
            text: 'Could you introduce me to Dan? Here is a short note you can forward as it is. Completely fine if now is not a good time.',
          },
          {
            type: 'callout',
            title: 'Message 2 (the blurb)',
            text: 'Maya Ruiz is a search funder buying one services business in the Southeast. Dan sold a company like the ones she looks at, and she would value twenty minutes on how his handover went. No pressure if the timing is wrong.',
          },
          'Sending the blurb as its own message matters. A forward of message 2 carries no context Dan does not need, and your contact does not have to edit anything.',
        ],
      },
      {
        heading: 'Adjust it for the deal',
        blocks: [
          {
            type: 'table',
            head: ['You are', 'Who you want', 'The “why this person” line'],
            rows: [
              ['Business broker', 'A buyer who closed in the sector last year', 'He bought a business like the one you are selling and knows what lenders asked for.'],
              ['Real estate investor', 'A local owner with older properties', 'She has owned in the submarket for twenty years and knows which owners are thinking about selling.'],
              ['Secondaries broker', 'An early employee at a named company', 'He has been through a transfer at the company and knows how the approval process works.'],
              ['Fund manager', 'A family office in a new region', 'They have backed two managers with a similar strategy.'],
            ],
          },
          'The pattern holds across deals: the reason is about them, not about you, and it is specific enough that they would recognize it as true.',
        ],
      },
      {
        heading: 'Mistakes that make people hesitate',
        blocks: [
          {
            type: 'list',
            items: [
              '**A pitch deck as the blurb.** Attachments do not forward well in chat, and nobody reads a deck from someone they have not met. Keep it to three lines.',
              '**Asking for “a quick call” with no topic.** Dan cannot judge a call he knows nothing about. Name the topic and the time.',
              '**Asking for five intros at once.** Each one is a favor. Ask for the one that matters, then ask again later.',
              '**Writing in the first person.** “I am a search funder…” reads strangely when your contact forwards it. Third person forwards cleanly.',
              '**Following up after two days.** Give it a week. Then one line: “Did you get a chance to send that? Happy to rewrite it if it is not quite right.”',
            ],
          },
        ],
      },
      {
        heading: 'When the intro lands',
        blocks: [
          'The intro is the start, not the finish. Three things to do the same day:',
          {
            type: 'steps',
            items: [
              { title: 'Reply to Dan', text: 'Thank him for being open to it, restate the twenty-minute ask and offer two specific times. Do it in the app the intro arrived in.' },
              { title: 'Thank the introducer', text: 'One line back to your contact: the intro landed, and you will let them know how it goes. Then actually let them know.' },
              { title: 'Save the contact with its source', text: 'Record Dan as a contact, with who introduced him and a link to the message. Six months from now, “who connected us?” should take one look, not a scroll.' },
            ],
          },
          'The guide to [turning introductions into contact records](/playbooks/turn-introductions-into-contact-records) covers that last step in detail.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'Intros arrive in whatever app the introducer uses: a WhatsApp forward, a LinkedIn group message, a Telegram add. In Merger, the messaging accounts you connect sit in one inbox, so the intro does not depend on which app you check most. You can save the new contact to the Rolodex linked to the message it came from, and if it turns into a deal, it goes on the Deal Desk with the conversation attached once you approve it.',
          'The blurb itself needs no software. Three lines, written so someone else can send them, is the whole habit.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-15 ───────────────────────────────────────────────────────────
  {
    slug: 'chat-replies-that-look-like-agreement-and-are-not',
    type: T.list,
    audience: 'All dealmakers',
    title: '7 chat replies that look like agreement and aren’t, and the one line that settles each',
    description:
      'A thumbs up, an “ok”, a “sounds good, let me check”. Seven replies in deal chats that feel like a yes, what each one usually means, and the one-line follow-up that gets a real answer.',
    dek: 'You send terms. The reply comes back in two seconds and it feels like a yes. Often it is not one yet. Here are the seven replies that fool dealmakers most, and the short message that turns each into a clear answer.',
    published: '2026-11-15',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why chat makes this worse',
        blocks: [
          'In a meeting, agreement comes with a face, a pause and usually a handshake. In email, it comes in sentences you can quote. In messaging apps, it often comes as a reaction, a single word or a voice note recorded while walking to the car.',
          'Fast replies are good for deals. The problem is what we read into them. A tired seller taps a thumbs up to say “seen it, will look later”. A buyer writes “ok” to mean “ok, I understand your position”. The person who sent the terms reads both as acceptance, and the gap only shows up at the letter of intent.',
          'The fix is not to slow anyone down. It is one short follow-up, sent the same day, that asks for the sentence instead of the signal.',
        ],
      },
      {
        heading: '1. The reaction',
        blocks: [
          'You send the price and a closing date. He reacts with a thumbs up. It is the most common false yes in deal chat, because it is the fastest thing anyone can send.',
          'A reaction tells you he read the message. It might mean he likes it. It might mean “noted”. It almost never means he has checked it with whoever else signs.',
          '**Send:** “Good to send the LOI on those terms?” A yes to that is a sentence you can point to later.',
        ],
      },
      {
        heading: '2. The one-word “ok”',
        blocks: [
          'Your message had three things in it: a number, a date and a request for a call. The reply is “ok”. Ok to which one?',
          'One-word replies usually answer the part of the message the reader cared about. That may not be the part you care about.',
          '**Send:** pick the one that matters and ask about it alone. “Just to be sure: ok on the March 31 close?”',
        ],
      },
      {
        heading: '3. “Sounds good, let me run it by my partner”',
        blocks: [
          'It reads warm. It is a not-yet. Someone else has a vote, and you do not know when they will use it or what they think.',
          'Treat it as an open item with a date, not as progress. The deal has not moved until the partner has seen it.',
          '**Send:** “Makes sense. When do you two usually meet? I’ll check in the day after.” Then put that date on the deal.',
        ],
      },
      {
        heading: '4. The heart or thumbs up on a meeting time',
        blocks: [
          'You propose “Tuesday at 10?” and get a heart. Most of the time it holds. When it does not, you find out at 10:05 on Tuesday.',
          'Reactions on times are easy to forget because nobody typed anything. There is no calendar invite and nothing to search for.',
          '**Send:** the day before, one line: “Still on for 10 tomorrow?” If it is a first meeting, send a calendar invite too.',
        ],
      },
      {
        heading: '5. “Should be fine”',
        blocks: [
          'You ask whether the landlord will consent to the lease transfer, or whether the books will be ready by Friday. The answer is “should be fine”.',
          'That is an opinion about the future, not a commitment. It is often sincere and often wrong, because the person answering does not control the outcome.',
          '**Send:** “Great. Who confirms it, and by when?” Now you know whose answer you are actually waiting for.',
        ],
      },
      {
        heading: '6. Silence after “seen”',
        blocks: [
          'The message shows as read. No reply. Some people take that as quiet acceptance: he saw the terms and did not object.',
          'In practice, silence after a read usually means he did not have an answer yet, did not like the answer he had, or read it on his phone between two other things and forgot. None of those is agreement.',
          '**Send:** after a reasonable gap, one line with a question only he can answer. The list of [follow-up messages that restart a quiet deal](/playbooks/follow-up-messages-that-restart-a-quiet-deal) has examples that do not sound like chasing.',
        ],
      },
      {
        heading: '7. The voice note that says yes and something else',
        blocks: [
          'A two-minute voice note: “Yeah, yeah, the number works, as long as we sort out the working capital piece, but yeah, let’s do it.” You heard “let’s do it”. The condition was in the middle.',
          'Voice notes are where conditions go to hide. They are hard to search and hard to quote, and the person who sent one rarely remembers exactly what they said.',
          '**Send:** reply in text with the number and the condition in the same sentence. “Confirming: the number works, subject to agreeing working capital. Right?” The guide to [places deal terms hide in your chats](/playbooks/places-deal-terms-hide-in-your-chats) covers voice notes and six other hiding places.',
        ],
      },
      {
        heading: 'The pattern behind all seven',
        blocks: [
          'Every false yes above has the same shape. The other side sent a signal, and you filled in the meaning you hoped for. The follow-up in each case does the same thing: it asks for a sentence that contains the term itself.',
          {
            type: 'table',
            head: ['Reply', 'What it usually means', 'Ask for'],
            rows: [
              ['Thumbs up', 'Read it', 'A yes to sending the LOI on those terms'],
              ['“ok”', 'Agreed with one part', 'A yes on the specific term'],
              ['“Let me run it by my partner”', 'Someone else decides', 'The date they meet'],
              ['Heart on a time', 'Probably coming', 'A confirm the day before'],
              ['“Should be fine”', 'Hopes so', 'Who confirms it, and by when'],
              ['Read, no reply', 'No answer yet', 'One question only he can answer'],
              ['Voice note yes', 'Yes, with a condition', 'The number and condition in text'],
            ],
          },
          'None of these follow-ups is pushy. They are short, specific and easy to answer, which is why they work. Most people are glad to be asked, because it saves them a harder conversation later.',
        ],
      },
      {
        heading: 'Keep the answer next to the deal',
        blocks: [
          'Once you get the sentence, it is worth keeping where you will find it. The clear “yes, March 31 works” is often in a different app from the terms it answers: terms sent on WhatsApp, confirmation on LinkedIn, the partner’s view in a Signal group.',
          'In Merger, the messaging accounts you connect sit in one inbox. With your own Anthropic API key, Claude can flag a message that looks like a possible deal, and you decide whether it goes on the Deal Desk. An approved deal keeps its conversations attached, so the sentence that settled a term is one click from the deal it belongs to. Claude reads words; it does not know whether a thumbs up meant yes. That judgment stays with you, as the guide to [AI deal triage without giving up judgment](/playbooks/ai-deal-triage-without-giving-up-judgment) explains.',
          'The habit itself needs no software. When a reply feels like a yes, ask for the sentence.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'deal-numbers-in-chat-shorthand-vs-written-out-vs-term-summary',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Shorthand, written out, or a term summary? Three ways to send deal numbers in chat',
    description:
      '“We could do 3.5” can mean millions, a multiple or a percent. Comparing three ways to send deal numbers in messaging apps: shorthand, the full figure in words, and a short term summary.',
    dek: 'Chat strips the units off numbers. Everyone fills them back in with what they expected to see. Here is how the three common ways of sending a number compare, and when each one is the right call.',
    published: '2026-11-15',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Approach', 'Good at', 'Where it breaks'],
            rows: [
              ['Shorthand (“3.5”, “4x”, “70/30”)', 'Speed, early conversations where both sides share context', 'Units and conditions go missing; forwards lose meaning'],
              ['Written out in one sentence', 'One number that matters, with its condition attached', 'Gets long if there are several terms'],
              ['A short term summary', 'Several terms at once, before an LOI', 'Feels formal too early; can stall a casual conversation'],
            ],
          },
        ],
      },
      {
        heading: 'Why numbers go wrong in chat',
        blocks: [
          'A buyer writes, “We could do 3.5 if the owner stays on.” The broker reads three and a half million. The buyer meant a 3.5 times multiple of earnings, which he assumed was obvious from a call last week. The seller’s accountant, reading a forward, wonders if it is 3.5 percent of something.',
          'None of them is careless. Messaging apps reward short messages, and short messages drop the parts that seem obvious to the writer. The units, the basis (revenue or earnings, this year or last), and the condition all live in someone’s head.',
          'This matters more in chat than in email for one reason: chat messages get forwarded alone. The person reading your number may never see the thread above it.',
        ],
      },
      {
        heading: 'Option 1: shorthand',
        blocks: [
          'Shorthand is how most deal numbers start. “3.5”, “4x”, “70/30 on the earn-out”, “mid-sevens”. Between two people who have been talking all week, it is fast and usually understood.',
          'The risk grows with every person added to the conversation and every day that passes. A week later, even the sender may not remember whether “4x” was on this year’s earnings or a forecast.',
          '**Works when:** it is early, two people share the context, and nobody is going to act on the number yet.',
        ],
      },
      {
        heading: 'Option 2: written out in one sentence',
        blocks: [
          'The second approach is to write the number in full once, with its unit and its condition, and ask for a confirm. “To confirm: three and a half million, with the owner staying six months?”',
          'Three rules make this work. Write the unit in words, not just a symbol. Put the condition in the same sentence as the number, so nobody can quote half of it. End with a question, so the other side has to say yes or correct you.',
          'It costs one message. It saves the conversation at the letter of intent where both sides discover they agreed to different things.',
          '**Works when:** one number has started to matter, such as a price, a multiple, a split or a deposit, and someone is about to act on it.',
        ],
      },
      {
        heading: 'Option 3: a short term summary',
        blocks: [
          'Once there are several numbers in play, a single sentence stops being enough. A short summary, five to eight lines sent as one message, lists each term with its basis and condition.',
          {
            type: 'list',
            items: [
              '**Price:** three and a half million, cash at close.',
              '**Basis:** about 3.5 times last year’s earnings, before owner add-backs are agreed.',
              '**Owner transition:** six months, paid at the current salary.',
              '**Condition:** landlord consents to the lease transfer.',
              '**Next step:** LOI draft by Friday.',
            ],
          },
          'A summary like this is not a term sheet and should say so. Its job is to make sure everyone is looking at the same numbers before lawyers get involved.',
          'The risk is tone. Sent too early, a structured summary can feel like pressure in a conversation that is still friendly and loose. Wait until the other side is discussing more than one term.',
          '**Works when:** two or more terms are being discussed, more than two people are involved, or a draft LOI is close.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'Shorthand', 'Written out', 'Term summary'],
            rows: [
              ['Speed early on', 'Best', 'Fine', 'Slow'],
              ['Survives being forwarded', 'Rarely', 'Yes', 'Yes'],
              ['Keeps the condition attached', 'No', 'Yes', 'Yes'],
              ['Handles several terms', 'No', 'Gets long', 'Yes'],
              ['Feels casual', 'Yes', 'Yes', 'Can feel formal'],
              ['Gets an explicit confirm', 'Rarely', 'If you ask', 'If you ask'],
            ],
          },
        ],
      },
      {
        heading: 'A practical rule',
        blocks: [
          'Use shorthand freely while you are exploring. The moment a number moves the deal, write it out once in full and ask for a yes. When a second term joins it, switch to a short summary.',
          'And whichever you use, keep the confirmed version somewhere other than the bottom of a chat. The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) pairs well with this: a confirmed number and a dated next step are most of what a deal record needs.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'Numbers rarely arrive in one app. The price comes on WhatsApp, the multiple on a LinkedIn message, the condition in a Telegram group. In Merger, the messaging accounts you connect sit in one inbox, and you reply in each person’s own app. With your own Anthropic API key, Claude can flag messages that look like a possible deal. You review each flag and decide what goes on the Deal Desk, where an approved deal keeps its conversations attached.',
          'That means the message where someone confirmed “three and a half million, with six months of transition” stays next to the deal it belongs to. The habit of writing it out in full is still yours.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-16 ───────────────────────────────────────────────────────────
  {
    slug: 'insurance-agency-acquirer-owner-conversations-across-messaging-apps',
    type: T.useCase,
    audience: 'Independent agency acquirers',
    title: 'How an insurance agency acquirer keeps retiring owners, producers and a lender in step across messaging apps',
    description:
      'An illustrative walkthrough: a buyer of small independent insurance agencies works owners on LinkedIn and WhatsApp, a lender in Slack and a broker group on Telegram, with one next step per agency.',
    dek: 'Small insurance agencies change hands when an owner is ready to stop, and owners rarely announce it by email. A walkthrough of one buyer, four agencies and the messages that decide which ones close.',
    published: '2026-11-16',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The buyer',
        blocks: [
          'Elena buys small independent insurance agencies with a group of investors behind her. Her targets are agencies with one owner close to retirement, a book of personal and small commercial lines, a few long-serving staff and no plan for who takes over.',
          'Those agencies are rarely listed. Elena hears about them from carrier contacts, from a Telegram group where a few dozen agency buyers and brokers share leads, from her own LinkedIn outreach, and from owners who already know someone she bought from.',
          'At any time she has ten or twelve owner conversations going. Most are slow on purpose. An owner who has run an agency for thirty years does not decide in a week, and the buyer who stays patient and organized is usually the one still talking to him when he does.',
        ],
      },
      {
        heading: 'Four agencies, five apps',
        blocks: [
          'Here is one ordinary week, with invented names.',
          {
            type: 'list',
            items: [
              '**Frank, LinkedIn.** Owns a two-office agency. Elena wrote to him in the spring; he answered “not yet”. On Monday he writes back: “My producer wants to talk about staying on. Can we find a time?”',
              '**Denise, WhatsApp.** Runs a one-office agency with her husband. They send voice notes from the office and photos of their renewal reports. Denise asks whether Elena would keep their two customer service reps.',
              '**A Telegram post.** A broker in the buyers’ group posts an agency with a strong commercial book and an owner who wants to close before year end. Three buyers ask for details in the thread within the hour.',
              '**Gary, WhatsApp, through his daughter.** Gary owns the agency; his daughter Lauren handles the business side and is added to the chat on Wednesday. She has not seen any of the earlier messages.',
            ],
          },
          'Behind all four sits the lender, who works in a shared Slack channel and asks on Thursday which agencies are close enough to need a term sheet this quarter.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The producer question is the real deal.** Frank’s message is about his top producer, not about price. If Elena treats it as small talk, Frank’s agency stalls on the one person who can walk out with the book.',
              '**The staff question goes unanswered.** Denise asked about her reps. Elena needs to check with her investors first. WhatsApp moves on and the question sinks under the next voice note.',
              '**The group lead is first come, first served.** By the time Elena messages the broker privately, he has already sent the package to the buyers who replied in the thread.',
              '**The new person starts from zero.** Lauren joined Gary’s chat late. Whatever she believes the deal is will come from the first summary she gets, from Elena or from someone else.',
              '**The lender gets a reconstruction.** Answering Thursday’s Slack question means scrolling LinkedIn, two WhatsApp chats and Telegram to rebuild where each agency stands.',
            ],
          },
          'None of this is unusual. Agency owners use the app they already use with their family and staff, and the buyer carries the cost of keeping the picture together.',
        ],
      },
      {
        heading: 'The same week, in one workspace',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Every conversation in one list',
                text: 'Elena connects the LinkedIn, WhatsApp, Telegram and Slack accounts she already uses. Frank, Denise, Gary and Lauren, the buyers’ group and the lender channel sit in one inbox. Each reply goes out in the app the other person chose.',
              },
              {
                title: 'Possible deals flagged for review',
                text: 'With her own Anthropic API key connected, Claude flags Frank’s message, Denise’s staff question and the Telegram post as possible deals. Elena reads each conversation before deciding. She approves all three and passes on a fourth flag, a carrier contact asking for a referral.',
              },
              {
                title: 'One deal per agency, conversations attached',
                text: 'Each approved agency goes on the Deal Desk with its conversation attached. Denise’s renewal photos stay with Denise’s agency. Frank’s spring “not yet” and Monday’s message sit in the same thread.',
              },
              {
                title: 'A next step with a date',
                text: 'For Frank: “Offer two times for a call with him and his producer by Wednesday.” For Denise: “Answer the reps question by Friday, after the investor call.” For the group lead: “Message the broker directly today.” For Gary: “Send Lauren a three-line recap today.”',
              },
              {
                title: 'Owners and family saved as contacts',
                text: 'Lauren is saved to the Rolodex with a note that her father owns the agency, linked to the message where she joined. When the lender asks who signs, the answer is one look away.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What changed for Gary’s agency',
        blocks: [
          'Lauren was the risk. She arrived three weeks into the conversation and would not scroll up through voice notes. Elena sent her three lines the same afternoon:',
          {
            type: 'callout',
            title: 'The recap',
            text: 'Welcome, Lauren. Where it stands: your father and I agreed to look at a sale next year, nothing signed. What we discussed: a price range based on last year’s commissions, if the two account managers stay. Next step: I send a one-page summary Friday, and we talk the week after.',
          },
          'Lauren replied with two questions about the account managers, which told Elena what the family cared about most. Without the recap, those questions would likely have surfaced much later, as doubts instead of questions.',
        ],
      },
      {
        heading: 'What to copy, with or without software',
        blocks: [
          {
            type: 'list',
            items: [
              '**Treat staff questions as deal questions.** In a small agency, the producer and the account managers carry the relationships. An owner asking about them is asking whether the sale is safe.',
              '**Give every “not yet” a date.** An owner who said no in spring may say yes in autumn. Write down when to ask again.',
              '**Move group leads to a private message fast.** Reply to the broker directly, the same hour if you can.',
              '**Recap for anyone who joins late.** Three lines: where it stands, the number with its condition, the next step with a date.',
              '**Answer the lender from one list.** If the update takes more than ten minutes to write, the pipeline is in too many places.',
            ],
          },
          'The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the date habit, and [turning introductions into contact records](/playbooks/turn-introductions-into-contact-records) covers the Rolodex side.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, and you reply in each person’s own app. With your own Anthropic API key, Claude can flag messages that look like a possible deal; nothing goes on the Deal Desk until you approve it. Approved deals keep their conversations attached, contacts live in the Rolodex linked to the message they came from, and confidentiality agreements can go out from your own DocuSign account.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'send-a-recap-when-someone-new-joins-a-deal',
    type: T.guide,
    audience: 'All dealmakers',
    title: 'How to send a three-line recap when someone new joins a deal',
    description:
      'A CFO, a lender or the seller’s daughter joins three weeks in and will not scroll up. Here is the three-line recap to send the day they join, with examples and the mistakes to avoid.',
    dek: 'Deals pick up people as they go. Each new person forms a view of the deal from the first thing they are told. Make sure that is you, in three lines, the same day.',
    published: '2026-11-16',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why late joiners matter',
        blocks: [
          'Most deals start between two people and end with six or eight. The buyer adds his CFO to the WhatsApp group. The lender loops in someone from credit on Slack. The seller adds his daughter, who will run the handover. A lawyer appears in week five.',
          'None of them will read three weeks of history. They will ask someone what is going on, or they will skim the last few messages and fill in the rest. Either way, the first account they get becomes their picture of the deal.',
          'If that account comes from you, it is accurate and it is short. If it comes from someone else, or from a screenshot of the wrong message, you spend the next two weeks correcting it.',
        ],
      },
      {
        heading: 'The three lines',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Where it stands',
                text: 'One sentence on the stage, in plain words. “Price agreed in principle. LOI drafting this week.” Not the history of how you got there.',
              },
              {
                title: 'The number and its condition',
                text: 'The term that matters most, written out in full, with its condition in the same sentence. “Three million, if the lease transfers.” A number without its condition is the most common thing a new person repeats wrongly.',
              },
              {
                title: 'The next step, with a date and an owner',
                text: '“Landlord call Thursday. I send notes Friday.” The new person now knows what happens next, when, and who is doing it.',
              },
            ],
          },
          'That is the whole recap. Send it the day they join, in the app where they joined.',
        ],
      },
      {
        heading: 'What it looks like',
        blocks: [
          {
            type: 'callout',
            title: 'Example',
            text: 'Welcome, Priya. Quick recap: price agreed in principle, LOI drafting this week. Three million if the lease transfers. Landlord call Thursday, I’ll send notes Friday. Happy to walk you through any of it.',
          },
          'The last line is optional, but it gives the new person an easy way to ask a question instead of guessing.',
        ],
      },
      {
        heading: 'Adjust it for who joined',
        blocks: [
          {
            type: 'table',
            head: ['Who joined', 'What they care about', 'Lead with'],
            rows: [
              ['Buyer’s CFO', 'Numbers and what they depend on', 'The number and its condition'],
              ['Lender', 'Timing and what is still open', 'Where it stands and the next date'],
              ['Seller’s family member', 'What was promised and what was not', 'Where it stands, in plain words'],
              ['Lawyer', 'What has been agreed in writing', 'What is agreed, and what is still only discussed'],
              ['Co-broker', 'Who answers what', 'The next step and its owner'],
            ],
          },
          'The three lines stay the same. Only the order and the emphasis change.',
        ],
      },
      {
        heading: 'Mistakes to avoid',
        blocks: [
          {
            type: 'list',
            items: [
              '**Forwarding screenshots instead.** Screenshots carry old numbers, jokes and half-agreed ideas. A new person cannot tell which parts still stand.',
              '**Writing the history.** Nobody needs the story of the first call. They need where things are now.',
              '**Dropping the condition.** “Three million” and “three million if the lease transfers” are different deals. Keep them in one sentence.',
              '**Waiting a few days.** By then the new person has already formed a view from somewhere else.',
              '**Sending it only to them.** If the chat is a group, post the recap in the group. Everyone already in the deal reads the same three lines, and any disagreement shows up now rather than at closing.',
            ],
          },
        ],
      },
      {
        heading: 'When the deal moves again',
        blocks: [
          'A recap is a snapshot. When one of the three lines changes, say so in one message rather than letting the change live only in the chat where it happened.',
          'If the lease call goes well, the second line becomes “Three million, lease transfer confirmed by the landlord on Thursday.” If the date slips, the third line becomes “Landlord call moved to Tuesday. Notes Wednesday.” Short updates like these keep the late joiner, and everyone else, on the same version of the deal.',
          'A useful rule: whenever a new person joins, or whenever one of the three lines changes, post the three lines again. On a busy deal that may be once a week. On a quiet one it may be once a month. Either way, nobody has to reconstruct the deal from scrollback, and nobody can say later that they were working from a different number.',
        ],
      },
      {
        heading: 'Why this helps everyone already in the deal',
        blocks: [
          'A recap written for one new person works as a check for everyone else. If the seller reads “three million if the lease transfers” and thought the lease was settled, you hear about it today, in one message, instead of in a lawyer’s markup.',
          'It also gives you a habit worth keeping: if you cannot write the three lines for a deal, you do not know where it stands. The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the third line in more detail, and [deal numbers in chat](/playbooks/deal-numbers-in-chat-shorthand-vs-written-out-vs-term-summary) covers the second.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'The hard part of a recap is finding the facts, because they are spread across apps: the price on WhatsApp, the condition on LinkedIn, the next step in Slack. In Merger, the messaging accounts you connect sit in one inbox, and you reply in each person’s own app. With your own Anthropic API key, Claude can flag messages that look like a possible deal, and you decide what goes on the Deal Desk. An approved deal keeps its conversations attached, so the facts for the recap are in one place.',
          'The three lines themselves are still yours to write. That is the point: the new person hears it from you.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-17 ───────────────────────────────────────────────────────────
  {
    slug: 'messages-to-send-in-the-first-week-after-an-loi-is-signed',
    type: T.list,
    audience: 'All dealmakers',
    title: '6 messages to send in the first week after an LOI is signed',
    description:
      'The LOI is signed and everyone relaxes. Six short messages to send in the first week, in the chats the deal already lives in, so the next sixty days start organised.',
    dek: 'A signed letter of intent feels like the finish line. It is the start of diligence, lawyers, lenders and a lot more chat. Here are the six messages that set up the next two months, most of them one or two lines long.',
    published: '2026-11-17',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why the first week matters',
        blocks: [
          'For weeks the deal has been two people trading messages: you and the seller, or you and the buyer. The day the LOI comes back signed, that changes. Lawyers join. An accountant joins. A lender wants a call. The seller’s spouse or business partner starts to have opinions.',
          'Everyone is relieved, and relief is when things get skipped. Nobody writes down the timeline because it was in the LOI. Nobody shares who the lawyers are because they will find each other. A week later, three people are asking the same question in three different apps.',
          'The six messages below take about an hour to send in total. Most are two lines. They do one job: make sure everyone starts the next phase with the same picture.',
        ],
      },
      {
        heading: '1. Thank the seller, with the timeline',
        blocks: [
          'Send it the same day the LOI is signed, in the app you have been using with them. Thank them, then put the dates in writing: when diligence should wrap, when you are aiming to close, and what happens next.',
          '**Sounds like:** “Thank you, Ray. Signed copy attached. Plan: diligence wraps by January 15, closing target end of February. I’ll send the first request list Monday.”',
          'A seller who has the dates in front of them worries less and asks less. And when a date slips, you both have the original to talk about.',
        ],
      },
      {
        heading: '2. Who’s who, in one message',
        blocks: [
          'List the people on each side and how to reach them: your lawyer, their lawyer, the accountant, the lender, anyone else who will be asking for things. Name, role and best channel.',
          'This message saves a surprising amount of time. Without it, the seller’s lawyer emails your accountant to ask who your lawyer is, and the answer comes back two days later.',
          'If people are being added to a group chat, send this as the first message in the group so everyone sees it at once.',
        ],
      },
      {
        heading: '3. The first diligence request, not the whole list',
        blocks: [
          'The full request list can run to dozens of items. Sending it all on day one tends to produce silence while the seller works out where to start.',
          'Send the first two or three items instead, with one owner on their side and a date. “Could you send the last three years of tax returns and the current lease by Friday?” Then send the next batch once those arrive.',
          'Track every request where you will see it, with the exact words, the date asked and who owes the answer. The habit of [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) works just as well for your own requests.',
        ],
      },
      {
        heading: '4. Which chat is for what',
        blocks: [
          'By week one there is usually a group chat, a few direct threads and some email. Say plainly what goes where. A simple rule many dealmakers use: logistics and scheduling in the group, terms and numbers in writing between the two principals, documents through the channel the lawyers prefer.',
          'It sounds fussy. It prevents the most common week-three problem: a number floated casually in a group, quoted later as if it were agreed.',
        ],
      },
      {
        heading: '5. A check-in with the person who introduced you',
        blocks: [
          'If someone introduced you to this deal, tell them it reached an LOI. One line is enough: “The intro you made in September just signed an LOI. Thank you.”',
          'Introducers rarely hear how things went. The ones who do tend to introduce you again. The guide to [turning introductions into contact records](/playbooks/turn-introductions-into-contact-records) covers keeping track of who opened which door.',
        ],
      },
      {
        heading: '6. A date for the first update',
        blocks: [
          'Finally, tell the seller when they will next hear from you, even if nothing has happened. “I’ll send a short update every Friday until closing.” Then do it.',
          'Silence in diligence reads as trouble, even when everything is fine. A regular, short update removes the guesswork. The list of [weekly buyer updates for your seller](/playbooks/weekly-buyer-update-for-your-seller) has formats that take five minutes.',
        ],
      },
      {
        heading: 'The six at a glance',
        blocks: [
          {
            type: 'table',
            head: ['Message', 'When', 'Why it matters'],
            rows: [
              ['Thanks plus timeline', 'Day of signing', 'Dates both sides can point to'],
              ['Who’s who', 'Day one or two', 'Nobody hunts for a lawyer’s contact'],
              ['First diligence request', 'First week', 'Small asks get answered; long lists stall'],
              ['Which chat is for what', 'First week', 'Terms stay out of casual group threads'],
              ['Check-in with the introducer', 'First week', 'The person who opened the door hears about it'],
              ['Date for the first update', 'End of week one', 'Silence stops reading as trouble'],
            ],
          },
        ],
      },
      {
        heading: 'Keep week one findable in week six',
        blocks: [
          'Six messages across several apps is exactly the kind of thing that gets lost by closing. The timeline went to the seller on WhatsApp, the lawyer’s contact came in a LinkedIn message, the first request was answered in a Telegram group.',
          'In Merger, the messaging accounts you connect sit in one inbox, and you reply to each person in their own app. New names from those conversations can go into your Rolodex, linked to the message they came from. With your own Anthropic API key, Claude can flag messages that look like a possible deal, and you decide what goes on the Deal Desk, where an approved deal keeps its conversations attached.',
          'The habit itself needs no software. Signed is the start: send the six.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'running-late-on-a-deal-deliverable-heads-up-vs-apology-vs-partial-send',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Running late on something you promised a buyer: heads-up, apology, or partial send?',
    description:
      'You promised the P&L by Friday and it will not be ready. Comparing three ways to handle a missed deal deadline in chat: a heads-up before, an apology after, or sending part of it now.',
    dek: 'Every deal has a Friday where something you promised is not ready. How you tell the other side matters more than the delay itself. Here is how the three common approaches compare, and the one that usually works best.',
    published: '2026-11-17',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Approach', 'Good at', 'Where it breaks'],
            rows: [
              ['Heads-up before the deadline', 'Keeps trust; the other side can plan', 'Only works if you notice the delay in time'],
              ['Apology after the deadline', 'Better than nothing', 'Reads as if you hoped nobody would notice'],
              ['Partial send now, rest later', 'Gives the other side something to work on', 'Can confuse if the partial version is not labelled'],
            ],
          },
          'In practice, the best answer is usually a heads-up that includes a partial send. More on that below.',
        ],
      },
      {
        heading: 'Why small delays cause big problems',
        blocks: [
          'You told a buyer the October P&L would be with him by Friday. On Thursday afternoon the accountant says it needs until Tuesday. It is a four-day delay on one document. It should not matter much.',
          'It matters because of what the buyer does with silence. If Friday passes with nothing, he does not think “the accountant is closing the month”. He thinks something is wrong with the numbers. He mentions it to his partner. By Monday the deal has a mood problem that has nothing to do with the business.',
          'Chat makes this sharper. The buyer can see you were online. He can see his last message was read. A missed deadline in a messaging app feels more personal than one in email.',
        ],
      },
      {
        heading: 'Option 1: a heads-up before the deadline',
        blocks: [
          'Send it as soon as you know, and before the deadline, not on it. Three parts: the new date, the reason in one plain sentence, and what happens in the meantime.',
          '**Sounds like:** “Quick heads-up: the P&L will be with you Tuesday, not today. The accountant is closing October. I’ll send it the moment I have it.”',
          'The new date should be a day, not “early next week”. The reason should be short. A long apology makes a small delay sound like a big one.',
          '**Works when:** you notice the delay at least a few hours before the deadline. Which, if you check your promises each morning, is most of the time.',
        ],
      },
      {
        heading: 'Option 2: an apology after the deadline',
        blocks: [
          'Sometimes the deadline passes before you notice. The message then has to do two jobs: own the miss and give a new date.',
          '**Sounds like:** “I missed Friday on the P&L, sorry. It will be with you Tuesday. The accountant is closing October.”',
          'Keep it to the facts. Do not explain at length, and do not wait for the buyer to ask first. A late apology sent before he chases is still much better than one sent after.',
          '**Works when:** you have already missed it. It is the fallback, not the plan.',
        ],
      },
      {
        heading: 'Option 3: send part of it now',
        blocks: [
          'Often you have something useful even if the full thing is not ready. September’s numbers, a draft with one section missing, the first half of the customer list.',
          'Sending part of it now gives the other side something to work on and shows the delay is real, not a cover for a problem. The risk is confusion: a partial document forwarded without context can be mistaken for the final one.',
          'So label it clearly in the message and, if you can, in the file name. “September P&L attached so you can start. October follows Tuesday.”',
          '**Works when:** the partial version is useful on its own and clearly marked as partial.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Need', 'Heads-up', 'Apology after', 'Partial send'],
            rows: [
              ['Keeps trust', 'Best', 'Some', 'Good'],
              ['Gives a new date', 'Yes', 'Yes', 'Yes, if you add one'],
              ['Gives the other side something to do', 'No', 'No', 'Yes'],
              ['Risk of confusion', 'Low', 'Low', 'Medium unless labelled'],
              ['Needs you to notice early', 'Yes', 'No', 'Helps'],
            ],
          },
        ],
      },
      {
        heading: 'The combination that usually works',
        blocks: [
          'The strongest version is a heads-up that includes a partial send: new date, short reason, and something useful attached now.',
          '**Sounds like:** “Quick heads-up: the P&L will be with you Tuesday, not today. The accountant is closing October. Sending the September numbers now so you can start.”',
          'Then keep the new date. A second slip on the same item does far more damage than the first. If you need to, set the new date a day later than you think, and deliver early.',
        ],
      },
      {
        heading: 'What to leave out',
        blocks: [
          'Three things make a late message worse. A long explanation, which makes a small delay sound like a crisis. Vague dates such as “soon” or “early next week”, which give the other side nothing to plan around. And blaming someone by name, which puts the buyer in the middle of a problem that is not his.',
          'One more: do not hide the delay inside an unrelated message. A line about the P&L buried under a question about the site visit is easy to miss, and later it looks as if you hoped it would be. Send it on its own.',
        ],
      },
      {
        heading: 'Notice promises before they are due',
        blocks: [
          'The hard part is not writing the message. It is remembering on Thursday what you promised on Monday, in whichever app you promised it. The commitments made in chat rarely make it into a calendar.',
          'A simple habit helps: every promise gets a dated next step on the deal it belongs to. The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the format.',
          'In Merger, the messaging accounts you connect sit in one inbox, so the message where you promised Friday is in the same place as the buyer’s other messages. With your own Anthropic API key, Claude can flag messages that look like a possible deal; you decide what goes on the Deal Desk, where an approved deal keeps its conversations and next steps together.',
          'The habit itself needs no software. Late is fine. Silent is the problem.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-18 ───────────────────────────────────────────────────────────
  {
    slug: 'machine-shop-broker-working-a-counteroffer-across-messaging-apps',
    type: T.useCase,
    audience: 'Business brokers',
    title: 'How a business broker works one counteroffer through a seller, a buyer and a lender in three messaging apps',
    description:
      'An illustrative walkthrough: a seller counters on WhatsApp, the buyer is on LinkedIn and the lender is in Slack. How a broker keeps the number, the condition and the dates straight.',
    dek: 'A counteroffer rarely arrives as a clean number. It arrives as one line in a chat, with a new condition attached, while you are busy. A walkthrough of one week on one sale.',
    published: '2026-11-18',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The sale',
        blocks: [
          'Marcus is a business broker who sells manufacturing and trade businesses. This month his main listing is a machine shop: thirty years old, twenty-two employees, one owner, and a building the owner bought in the nineties and still holds in the same company.',
          'After six weeks of marketing, one buyer is clearly ahead. Rachel runs a small holding company that buys industrial businesses with a bank loan and her own capital. She has sent a written offer for the business and the building together. The seller, Jim, has had it for two days.',
          'Everyone in this sale uses a different app. Jim writes on WhatsApp, usually from the shop floor. Rachel prefers LinkedIn messages during the day. Her lender works in a shared Slack channel. Marcus also has a Telegram group with two other brokers he co-lists with, where he posts updates on the listing.',
        ],
      },
      {
        heading: 'The counter arrives',
        blocks: [
          'On Tuesday at 11:40, while Marcus is on a site visit for another listing, Jim writes on WhatsApp:',
          {
            type: 'callout',
            title: 'The message',
            text: 'Read her offer. I’d do it at her number for the business, but I keep the building and she leases it from me.',
          },
          'In one line, Jim has accepted the price for the business, removed the building from the deal and introduced a lease that does not exist yet. That changes Rachel’s financing, her monthly costs and possibly whether she wants the deal at all.',
          'Two things usually happen next. Either the broker replies from the parking lot with something warm and vague, which Jim reads as agreement. Or the broker forwards a screenshot to the buyer with “thoughts?”, which hands her a negotiation with no context.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The condition gets lost.** Rachel hears “Jim accepted your number” from someone in the co-broker group before she hears “for the business only”.',
              '**The lease has no terms.** Nobody has said how long, at what rent, or who pays for the roof. Every party fills that gap with their own assumption.',
              '**The lender hears last.** The bank approved a loan that included real estate. Without it, the structure changes, and the lender learns that from Rachel a week later.',
              '**The dates drift.** Jim expects an answer “soon”. Rachel expects to talk to her lender first. Nobody wrote down when the next message is due.',
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
                title: 'Every conversation in one list',
                text: 'Marcus connects the WhatsApp, LinkedIn, Slack and Telegram accounts he already uses. Jim, Rachel, the lender channel and the co-broker group sit in one inbox, and each reply goes out in the app the other person chose.',
              },
              {
                title: 'The counter flagged for review',
                text: 'With his own Anthropic API key connected, Claude flags Jim’s message as a possible deal. Marcus reads the whole conversation before doing anything with it. Nothing goes on the Deal Desk until he approves it.',
              },
              {
                title: 'A holding reply with a time',
                text: 'From the parking lot, Marcus sends Jim one line: “Got it, thanks. I’ll call you by 4 today.” Jim knows he has been heard, and Marcus has the afternoon.',
              },
              {
                title: 'The counter written out',
                text: 'On the Deal Desk, the machine shop now reads: business at Rachel’s number; building retained by seller; lease terms not stated; next step, call Jim by 4 PM. The missing piece is visible: the lease.',
              },
              {
                title: 'One recap for the buyer',
                text: 'Before Rachel hears it anywhere else, Marcus writes to her on LinkedIn with the counter in full, condition included, and a date for her answer.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What Marcus actually sent',
        blocks: [
          'At 3:50 he called Jim and asked one question: what lease would he offer? Jim said ten years, at roughly what the shop would pay a landlord today, with two renewal options. Marcus wrote it back to him on WhatsApp so it existed in writing:',
          {
            type: 'callout',
            title: 'To the seller',
            text: 'To confirm what we discussed: her number for the business, you keep the building, ten-year lease at market rent with two five-year options. I’ll put this to Rachel today and come back to you by Friday.',
          },
          'Then to Rachel, on LinkedIn:',
          {
            type: 'callout',
            title: 'To the buyer',
            text: 'Jim accepts your number for the business. He wants to keep the building and lease it to you: ten years at market rent, two five-year options. Rent figure to follow from his accountant. Can you check this with your lender and reply by Friday?',
          },
          'Rachel forwarded the message to the lender channel herself. The lender asked one question, about the length of the lease, which Marcus had already written down. The co-broker group got a single line: “Counter on the machine shop, details with buyer, answer due Friday.”',
        ],
      },
      {
        heading: 'What to copy, with or without software',
        blocks: [
          {
            type: 'list',
            items: [
              '**Never answer a counter from the hallway.** Reply with a time, not a position.',
              '**Write the counter out in full.** Number, what is included, what is excluded, and what is still unstated. The unstated part is usually where the deal turns.',
              '**Confirm it back to the sender.** One message that starts “To confirm” turns a phone call into a record.',
              '**Tell the other side before anyone else does.** In a co-listed deal, word travels fast and loses its conditions on the way.',
              '**Put a date on every reply you owe.** “By Friday” is a promise both sides can hold you to.',
            ],
          },
          'For the habit behind the second point, see [deal numbers in chat](/playbooks/deal-numbers-in-chat-shorthand-vs-written-out-vs-term-summary). For the last one, see the guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal).',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, and you reply in each person’s own app. With your own Anthropic API key, Claude can flag messages that look like a possible deal; nothing goes on the Deal Desk until you approve it. Approved deals keep their conversations attached, contacts live in the Rolodex linked to the message they came from, and confidentiality agreements can go out from your own DocuSign account.',
          'The counter, the confirmation and the reply are still yours to write. Merger keeps them in one place so you can find them on Friday.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'tell-a-buyer-the-seller-chose-someone-else',
    type: T.guide,
    audience: 'Business brokers',
    title: 'How to tell a buyer the seller chose someone else, and keep him for the next listing',
    description:
      'The seller picked another buyer. Here is the three-line message to send the ones who lost, the same day, with examples, what to leave out and what to write down afterwards.',
    dek: 'Every sale has one buyer who wins and several who do not. The ones who do not are your buyer list for the next listing. How you tell them decides whether they open your next message.',
    published: '2026-11-18',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why this message matters',
        blocks: [
          'When a seller accepts an offer, the broker’s attention goes to the winner: the LOI, diligence, the lender. The other serious buyers, the ones who signed the NDA, read the numbers and maybe made an offer, often hear nothing for weeks.',
          'They find out some other way. A co-broker mentions it, or the closing shows up on LinkedIn. What they remember is not that they lost. It is that nobody told them.',
          'Those buyers are the most valuable names on your list. They know your process, they have shown they can move, and they have told you what they want. A short, honest message the day the decision is made keeps them reading your next listing.',
        ],
      },
      {
        heading: 'The three lines',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Thanks, by name, for the work they did',
                text: 'Be specific. “Thank you for the time on Harbor Signs, and for turning the questions around so fast” reads very differently from “thanks for your interest”.',
              },
              {
                title: 'The reason, in one sentence',
                text: 'Give the real reason if you can share it: timing, structure, certainty of financing. “The seller went with a buyer who could close in January.” Do not share the winning offer or the other buyer’s name.',
              },
              {
                title: 'What you will send them next, and when',
                text: '“I have two print shops coming to market in the spring. You’ll see them before the list does.” Only promise what you can do.',
              },
            ],
          },
          'Send it the same day the seller decides, in the app where you have been talking to that buyer.',
        ],
      },
      {
        heading: 'What it looks like',
        blocks: [
          {
            type: 'callout',
            title: 'Example',
            text: 'Mark, thank you for the work on Harbor Signs. The seller went with a buyer who could close in January. I have two print shops coming in the spring and you’ll see them first.',
          },
          'Three sentences. No apology paragraph, no numbers from the other side, no “unfortunately” at the top. A fact and a next step.',
        ],
      },
      {
        heading: 'Adjust it for how far they got',
        blocks: [
          {
            type: 'table',
            head: ['How far they got', 'What to add', 'What to leave out'],
            rows: [
              ['Asked for the teaser only', 'Nothing. Two lines is enough.', 'The reason, unless they ask'],
              ['Signed the NDA and read the package', 'What they would need to win next time, if it is clear', 'Details from the package they no longer need'],
              ['Made an offer', 'A call, if they want one', 'The winning number or terms'],
              ['Was the backup buyer', 'That you will tell them first if the deal falls through', 'Any hint that it will'],
            ],
          },
          'If a buyer was your backup, say so plainly and agree how long they are willing to wait. A backup who hears nothing for six weeks is not a backup.',
        ],
      },
      {
        heading: 'Mistakes to avoid',
        blocks: [
          {
            type: 'list',
            items: [
              '**Waiting until closing.** Closing may be months away. The decision is the day to tell them.',
              '**Sharing the other offer.** It breaks the seller’s confidence and invites a re-bid nobody asked for.',
              '**Writing a long apology.** It reads as guilt, and it buries the one useful sentence.',
              '**Promising “first look” at everything.** Send them what fits what they told you, not every listing.',
              '**Sending one message to the whole group.** If several buyers were in a shared group, still tell each one directly. Nobody wants to learn they lost in front of the others.',
            ],
          },
        ],
      },
      {
        heading: 'Afterwards: write down what they want',
        blocks: [
          'The message is half the job. The other half is making “you’ll see them first” true. While the deal is fresh, write down what that buyer told you they want: industry, region, size, whether the owner needs to stay, how they finance. Use their words.',
          'Put the note where you will find it when the next listing comes in, next to the conversation where they said it. In three months you will not remember which buyer wanted sign shops in the Midwest and which wanted print shops anywhere.',
          'If a buyer keeps looking at listings and never bids, the same note helps. The guide on [following up on a quiet deal](/playbooks/follow-up-messages-that-restart-a-quiet-deal) covers when to ask again, and [closing a dead deal without burning the relationship](/playbooks/close-a-dead-deal-without-burning-the-relationship) covers the seller side of the same habit.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so every buyer who looked at the listing is in one list, whichever app they used. You reply in each person’s own app. Contacts live in the Rolodex, linked to the message they came from, so the note about what a buyer wants sits next to the conversation where they said it. With your own Anthropic API key, Claude can flag messages that look like a possible deal, and you decide what goes on the Deal Desk.',
          'The message itself is still yours to write. That is the point: the buyer hears it from you, on the day it happened.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-19 ───────────────────────────────────────────────────────────
  {
    slug: 'what-to-send-every-live-deal-before-a-holiday-week',
    type: T.list,
    audience: 'All dealmakers',
    title: 'What to send every live deal before a holiday week',
    description:
      'Holiday weeks slow every deal down. Seven things to send, check and write down before the break, so a quiet week does not read as a cooling deal.',
    dek: 'Nobody minds a slow week at Thanksgiving or the end of the year. What people notice is a deal that goes from daily messages to nothing. Here is what to send before everyone logs off, and what to set up for the day you come back.',
    published: '2026-11-19',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why the week before matters',
        blocks: [
          'In a normal week, a live deal produces a steady trickle of messages: a question from the buyer, a document from the seller, a lender asking for one more number. In a holiday week the trickle stops. Sellers travel, counsel is out from Wednesday, and lenders go quiet until the following Monday.',
          'The pause itself is harmless. The problem is how silence reads from the other side. A seller who heard from you every day and then hears nothing for nine days starts to wonder whether the buyer has cooled. A buyer who is waiting on a document and gets no word starts to look at the next listing.',
          'A few short messages before the break take that question off the table. Here is what to send, in roughly the order to send it.',
        ],
      },
      {
        heading: 'Seven things to do before the break',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: '1. Make a list of every live deal',
                text: 'Not every conversation, only the deals where someone is waiting on someone. Go app by app: the WhatsApp seller, the Telegram buyers, the LinkedIn thread with the lender. If a deal has no next step, it is not live, and it does not need a message this week.',
              },
              {
                title: '2. Send each one a four-line message',
                text: 'Where it stands, in one sentence. What you are waiting on, and from whom. What happens before the break, if anything. The day you will pick it up. Send it on the Monday or Tuesday of the holiday week, while people are still reading.',
              },
              {
                title: '3. Say what will not happen this week',
                text: 'If the buyer’s lender will not look at the file until the 30th, say so to the seller now. Bad news before the break is a plan. The same news after the break is a surprise.',
              },
              {
                title: '4. Answer every open question you owe',
                text: 'Search for messages that end with a question mark and no reply from you. The holiday is the worst time to leave a buyer’s question hanging, because it will hang for nine days instead of two.',
              },
              {
                title: '5. Confirm anything said on a call, in writing',
                text: 'If a seller agreed to something on a call the week before, write it back to them before the break. “To confirm from Thursday: you’ll send the lease by December 4.” Memories do not improve over a long weekend.',
              },
              {
                title: '6. Tell people who is covering, if anyone',
                text: 'If you are fully offline, say so and give the day you are back. If a colleague is watching your deals, name them and say what they can decide and what waits for you.',
              },
              {
                title: '7. Put the pick-up date where you will see it',
                text: 'Each message promised a day. Write it next to the deal, not in a separate list you will forget you made. On the first morning back, that is your to-do list.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What the four-line message looks like',
        blocks: [
          {
            type: 'callout',
            title: 'Example, to a seller',
            text: 'Quick one before the holiday. We’re waiting on your Q3 numbers. No rush this week. I’ll pick it up Monday the 30th. Happy Thanksgiving.',
          },
          {
            type: 'callout',
            title: 'Example, to a buyer',
            text: 'Before the break: the seller is reviewing your questions on the lease. His counsel is out until the 30th, so expect answers that week. I’ll send them the day they arrive.',
          },
          'Short, specific, and with a date. No pressure to reply, and no “circling back” with nothing new in it. If you want more on that habit, the list of [follow-up messages that restart a quiet deal](/playbooks/follow-up-messages-that-restart-a-quiet-deal) covers the general case.',
        ],
      },
      {
        heading: 'What not to send',
        blocks: [
          {
            type: 'list',
            items: [
              '**A group blast to every contact.** A holiday card to your whole list is fine. It is not a deal update, and it does not replace the four lines to each live deal.',
              '**New asks with a holiday deadline.** “Can you get me the tax returns by Wednesday?” to a seller who is packing the car does not get you the tax returns. It gets you a seller who feels pushed.',
              '**A price change or a new condition.** If something material changed, call first and write it down after. Do not drop it in chat on the way out of the office.',
              '**Silence because the deal feels fine.** Fine deals are the ones that drift. The message costs a minute.',
            ],
          },
        ],
      },
      {
        heading: 'The first morning back',
        blocks: [
          'Start with the dates you promised. Every deal that got a “I’ll pick it up Monday” gets a message that morning, even if all it says is that you are back and the next step is still the same.',
          'Then read anything that arrived during the break, oldest first. The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) is a good way to reset each one, and if a buyer or seller went quiet over the break, [the weekly review from your messages](/playbooks/run-a-weekly-deal-review-from-your-messages) is a quick way to see which.',
          'If a seller is waiting to hear how buyers are getting on, the [weekly buyer update for your seller](/playbooks/weekly-buyer-update-for-your-seller) is a good format for the first update after the break.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so the list of live deals is one list instead of six apps. You reply in each person’s own app. Approved deals sit on the Deal Desk with their conversations attached, so the pick-up date sits next to the message it came from. With your own Anthropic API key, Claude can flag messages that look like a possible deal while you are away, and nothing goes on the Deal Desk until you approve it.',
          'The four lines are still yours to write. Merger keeps them, and the replies, in one place for the first morning back.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'exclusive-vs-first-look-vs-off-market-what-a-broker-means-by-only-you',
    type: T.comparison,
    audience: 'Buyers and investors',
    title: 'Exclusive, first look or off-market: what a broker means by “only showing this to you”',
    description:
      'A broker says a deal is only being shown to you, for now. Comparing what that line can mean, what each version is worth, and the one question to ask before you approve it.',
    dek: '“Off market. Only showing this to you for now.” It might be a real head start, a short window before a wider release, or a line that goes to several buyers at once. The words are the same. The deal is not. Here is how to tell which one you have.',
    published: '2026-11-19',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['What it is', 'What you usually get', 'How to recognise it'],
            rows: [
              ['A written exclusive', 'A defined period where the seller talks only to you', 'There is a date, and usually a document or a clause in the LOI'],
              ['A first look', 'A head start of days or weeks before a wider release', 'The broker can tell you when the wider release happens'],
              ['“Off market” used loosely', 'The deal is not on a listing site, but several buyers may have it', 'Answers about timing and other buyers stay vague'],
            ],
          },
          'None of these is good or bad on its own. A first look with an honest date is worth more than an exclusive that only exists in a chat message. What matters is knowing which one you have before you spend time on the deal.',
        ],
      },
      {
        heading: 'A written exclusive',
        blocks: [
          'A real exclusive has edges: a start date, an end date, and some statement of what the seller will not do in between, usually that they will not negotiate with other buyers. In small business sales it often arrives with or after the LOI, as a no-shop or exclusivity period. Before an LOI, a true exclusive is less common, because the seller has not yet seen a number.',
          'If a broker offers an exclusive before an LOI, it is reasonable to ask what it covers and to have it written down, even in one line of chat: “Confirming you won’t show this to other buyers until December 15.” A line like that is a record. A feeling that you are the only one is not.',
        ],
      },
      {
        heading: 'A first look',
        blocks: [
          'A first look is the most common honest version of “only you”. The broker is showing the deal to a short list, or to one buyer, before sending it wider. You get time to read the numbers and ask questions without competition, and the broker gets a fast read on the price.',
          'It is worth a lot if you can move. It is worth very little if the window closes before you have the information to decide. So the useful questions are about time: when does the wider release happen, and what would you need to see from me before then?',
          {
            type: 'callout',
            title: 'One line to send',
            text: 'Thanks. Until what date, and what happens after it?',
          },
          'A broker running a real first look can usually answer that in one message. “Through the 15th, then it goes to our list” is a good answer. It tells you how much work to do this week.',
        ],
      },
      {
        heading: '“Off market” used loosely',
        blocks: [
          'Sometimes “off market” only means the deal is not on a public listing site. The broker may be sending the same message to ten buyers in ten chats, each worded as if it were personal. That is not dishonest in itself; it is how many deals move. But it changes how fast you need to be, and how much the word “only” is worth.',
          'The signs are in the answers. If you ask about timing and get “soon”, or ask whether others have it and get “a couple of people might take a look”, treat it as an open process. Move at the pace of an open process, and do not let the word “only” push you into skipping steps.',
        ],
      },
      {
        heading: 'How to read the answer',
        blocks: [
          {
            type: 'table',
            head: ['If the broker says', 'It probably means', 'What to do next'],
            rows: [
              ['A date and what happens after', 'A first look or an exclusive with edges', 'Plan your work back from the date'],
              ['“The owner wants an answer soon”', 'Urgency without a window', 'Ask what “soon” is, in days'],
              ['“A few people might look”', 'An open process', 'Move as you would on a listed deal'],
              ['Silence on the question', 'You do not know yet', 'Ask once more, then decide how much time to spend'],
            ],
          },
          'Whatever the answer, write it down next to the conversation it came from. Two weeks later, “he said through the 15th” is easy to check if it is in front of you, and easy to misremember if it is not.',
        ],
      },
      {
        heading: 'Mistakes to avoid',
        blocks: [
          {
            type: 'list',
            items: [
              '**Treating “only you” as an exclusive.** Unless there is a date and a commitment, it is a head start at most.',
              '**Rushing because of the word.** Urgency is a reason to ask about timing, not a reason to skip the NDA or the numbers.',
              '**Asking about other buyers by name.** The broker should not tell you, and asking puts them in an awkward spot. Ask about timing instead.',
              '**Forgetting the date you were given.** A first look that ends while you are waiting on a lender is just a missed deal.',
            ],
          },
          'For what usually comes next, see [sending an NDA without retyping names from chat](/playbooks/send-an-nda-without-retyping-names-from-chat), and for the habit of reading a flag before approving it, [AI deal triage without giving up judgment](/playbooks/ai-deal-triage-without-giving-up-judgment).',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, and you reply in each person’s own app. With your own Anthropic API key, Claude can flag a message like “only showing this to you” as a possible deal. It is a suggestion: you ask your question first, and nothing goes on the Deal Desk until you approve it. Approved deals keep the conversation attached, so the date the broker gave you sits next to the deal.',
          'Whether the window is real is still a question for you to ask. Merger keeps the answer where you will find it.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-20 ───────────────────────────────────────────────────────────
  {
    slug: 'cabinet-shop-broker-keeping-a-sale-confidential-through-buyer-site-visits',
    type: T.useCase,
    audience: 'Business brokers',
    title: 'How a business broker keeps a sale confidential through three buyer site visits arranged in three messaging apps',
    description:
      'An illustrative walkthrough: three buyers want to see a cabinet shop whose employees do not know it is for sale. How a broker settles who, when and what gets asked, in writing.',
    dek: 'A site visit is the best sign a buyer is serious. It is also the moment a quiet sale is most likely to stop being quiet. A walkthrough of one listing, three visits and eighteen employees who did not find out.',
    published: '2026-11-20',
    readMinutes: 7,
    illustrative: true,
    sections: [
      {
        heading: 'The listing',
        blocks: [
          'Elena is a business broker who sells trade and light manufacturing businesses. Her current listing is a custom cabinet shop: twenty-four years old, eighteen employees, one owner. Tom built it from a two-car garage and wants to retire within two years.',
          'Tom has one firm condition. His team cannot find out the shop is for sale until a buyer is signed and he can tell them himself. Several of his people have been with him for over a decade. He does not want them hearing it from a stranger walking through the spray booth.',
          'After a month of marketing, three buyers have signed NDAs and want to see the shop. Each one found Elena in a different place. Kevin, who owns a millwork company two towns over, writes on LinkedIn. Priya, a former operations manager buying her first business with an SBA-backed loan, prefers WhatsApp. A small holding company is represented by its deal lead, Sam, who sends everything on Telegram. Tom himself only uses WhatsApp, usually from the shop floor.',
        ],
      },
      {
        heading: 'How the visit requests arrive',
        blocks: [
          'Within the same week, all three buyers ask to come by. None of them asks the same way.',
          {
            type: 'list',
            items: [
              '**Kevin, on LinkedIn:** “Can I swing by Tuesday and see the shop? Might bring my partner.”',
              '**Priya, on WhatsApp:** “Would love to walk through the operation. Any day next week works.”',
              '**Sam, on Telegram:** “Our ops guy wants to see the CNC line and talk to whoever runs it. Thursday?”',
            ],
          },
          'Each message is reasonable on its own. Read together, they contain one buyer bringing an unnamed second person, one buyer with no time attached, and one buyer who wants to interview a key employee who does not know the shop is for sale.',
        ],
      },
      {
        heading: 'Where it usually breaks',
        blocks: [
          {
            type: 'list',
            items: [
              '**The extra person.** “Might bring my partner” turns into two people Elena has never met, one of whom has not signed an NDA.',
              '**The cover story drifts.** Tom tells his foreman one buyer is an insurance inspector and tells the office manager the next one is a supplier. By the third visit, someone notices the stories do not match.',
              '**Questions go to staff.** A buyer asks a machinist how much overtime he has worked this year. It is a fair question. It is also how rumors start.',
              '**Follow-up questions scatter.** After each visit, the buyer sends questions in their own app, the seller answers some of them in another, and nobody is sure which answers went to whom.',
            ],
          },
        ],
      },
      {
        heading: 'Four things, settled in writing',
        blocks: [
          'Elena does not say yes to any visit until four things are settled, and she settles them in the same chat each buyer used to ask.',
          {
            type: 'steps',
            items: [
              {
                title: 'Who is coming, by name',
                text: 'She replies to Kevin: “Happy to set it up. Who will be with you? I’ll need them on the NDA too.” His partner turns out to be his son, who signs the same day.',
              },
              {
                title: 'When, and what Tom tells his team',
                text: 'Tom and Elena agree one rule for all three visits: after 5 PM, once the crew has left, described to anyone who asks as a meeting with a possible equipment supplier. One story, used every time.',
              },
              {
                title: 'What buyers will not ask staff',
                text: 'She tells Sam the CNC line can be seen, but the conversation with the lead machinist waits until after an LOI, with Tom’s agreement. Until then, questions about people go to Tom.',
              },
              {
                title: 'Where questions go after',
                text: 'Every buyer gets the same line: “After the visit, send me your questions here and I’ll get Tom’s answers back to you in this chat.” Tom answers once; Elena relays.',
              },
            ],
          },
          'Then she sends Tom the details of each visit in his own WhatsApp chat: the day, the time, the names, and anything the buyer said they wanted to see. Tom is never surprised by who walks in.',
        ],
      },
      {
        heading: 'The visits',
        blocks: [
          'Kevin and his son come on Tuesday at 5:30. Priya comes the following Monday at 6. Sam and his operations lead come on Thursday after the line shuts down; they see the CNC machines and the maintenance logs Tom prepared, and the machinist interview goes onto the list for after an LOI.',
          'After each visit, the questions come back in each buyer’s app, as agreed. Elena collects them, sends them to Tom in one message, and returns his answers in the chat each question came from. When two buyers ask the same thing about the lease, Tom answers once and both get the same answer.',
          {
            type: 'callout',
            title: 'The line Elena sends after each visit',
            text: 'Thanks for coming by. Send me anything you want to ask Tom here, and I’ll come back with his answers by Friday. Please keep any questions about the team for him, not the staff.',
          },
          'Eighteen employees go home on three different evenings without knowing anything has changed. Six weeks later, Kevin signs an LOI, and Tom tells his team himself, on a Monday morning, in the way he planned.',
        ],
      },
      {
        heading: 'What made the difference',
        blocks: [
          'None of this needed a new system. It needed Elena to answer three visit requests with the same four questions, in writing, before agreeing to a time. It needed one cover story instead of three. And it needed every follow-up question to come back through one person.',
          'The hard part was keeping track. Three buyers in three apps, one seller in a fourth chat, and visit details that had to match exactly. If you broker sales like this, the guide to [sell-side buyer conversations](/playbooks/business-broker-sell-side-buyer-conversations) covers the wider process, and [sending an NDA without retyping names from chat](/playbooks/send-an-nda-without-retyping-names-from-chat) covers the step before any visit.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts Elena connects sit in one inbox, so Kevin’s LinkedIn thread, Priya’s WhatsApp chat, Sam’s Telegram messages and Tom’s WhatsApp all sit in one list, and she replies to each in its own app. With her own Anthropic API key, Claude can flag a visit request as a possible deal; nothing goes on the Deal Desk until she approves it. Each approved deal keeps its conversation attached, so the visit time, the names and the agreed rules sit next to the messages they came from. NDAs go out from her own DocuSign account.',
          'The four questions are still hers to ask. Merger keeps the answers in one place.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'send-a-seller-an-agenda-before-the-first-call',
    type: T.guide,
    audience: 'Brokers, search funders and acquirers',
    title: 'How to send a seller a three-line agenda before the first call',
    description:
      'A first call with an owner goes better when he knows what is coming. What to put in a three-line agenda, where to send it, an example, and what to do the same day after the call.',
    dek: 'From the owner’s side, a first call is a stranger asking about the thing he spent twenty years building. Without an agenda, it feels like an audit. Three lines, sent the day before in the chat he already uses, change how the call starts.',
    published: '2026-11-20',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why a first call needs an agenda',
        blocks: [
          'Most first calls with business owners are booked in a chat: a LinkedIn reply, a WhatsApp message, a “sure, Thursday works” on Telegram. Then nothing happens until the call. The owner spends the time in between wondering what you will ask, whether you will want his financials, and whether he has already said too much.',
          'He arrives guarded. The first ten minutes go on establishing that you are not about to ask for his tax returns. An agenda sent the day before spends those ten minutes for you.',
          'It also tells him something about how you work. A buyer or broker who writes down what they will cover, and then covers it, is easier to trust with the next step.',
        ],
      },
      {
        heading: 'The three lines',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'What you would like to cover',
                text: 'In a few words, not a list of twenty questions. “I’d like to hear how the business started and what you want next.” Open topics that let him talk about what he knows best.',
              },
              {
                title: 'What you will tell him',
                text: 'The call is two-way. “I’ll share how I work and who I work with.” Owners want to know who they are talking to as much as you want to know about the business.',
              },
              {
                title: 'What you might ask for after',
                text: 'This is the line that matters most. “If it fits, I may ask for last year’s numbers after. Nothing to prepare.” It tells him nothing is being taken from him on the call itself.',
              },
            ],
          },
          'Three lines is enough. Longer agendas read like a checklist, and a checklist reads like diligence. Save that for later.',
        ],
      },
      {
        heading: 'An example',
        blocks: [
          {
            type: 'callout',
            title: 'Sent the day before, on WhatsApp',
            text: 'Looking forward to tomorrow at 10. I’d like to hear how the business started and what you want next. I’ll share how I work and who I work with. If it fits, I may ask for last year’s numbers after. Nothing to prepare.',
          },
          'Four sentences, including the time. It confirms the call, sets the tone and removes the biggest worry before it comes up. If he replies with something he wants to cover, even better: now you know what is on his mind.',
        ],
      },
      {
        heading: 'Where and when to send it',
        blocks: [
          {
            type: 'list',
            items: [
              '**In the chat where he agreed to the call.** Not a new email thread. If he said yes on LinkedIn, send it on LinkedIn. He will find it where he expects it.',
              '**The day before, during working hours.** Early enough that he reads it calmly, late enough that he remembers it.',
              '**With the time in it.** Restating the time doubles as a confirmation, and catches the call that was about to be missed because of a time zone.',
              '**Without attachments.** No deck, no questionnaire. Those can come later if the call goes well.',
            ],
          },
        ],
      },
      {
        heading: 'What to avoid',
        blocks: [
          {
            type: 'list',
            items: [
              '**Asking for documents before the call.** It turns an introduction into a request, and many owners will cancel rather than send anything.',
              '**Talking about valuation.** If the agenda mentions price or multiples, the call becomes a negotiation before either of you knows if there is a deal.',
              '**Fund or firm jargon.** “Investment thesis” and “platform acquisition” mean nothing to most owners. Say what you would actually do.',
              '**Promising things you may not do.** If you are not sure you will ask for numbers, say “might”. Then keep the promise either way.',
            ],
          },
        ],
      },
      {
        heading: 'After the call, the same day',
        blocks: [
          'The agenda is a promise about the call. The follow-up is a promise about what comes next. Before the end of the day, send one short message in the same chat: thank him, name the one thing you will do next, and give it a day.',
          {
            type: 'callout',
            title: 'Example follow-up',
            text: 'Thanks for the time today. As discussed, could you send last year’s P&L when you have a moment? I’ll come back to you by next Thursday with how I’d think about it.',
          },
          'Then write that next step down next to the deal, with a date and an owner. The guide to [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal) covers the habit. If you are running a search, the walkthrough of [search fund outreach without a CRM](/playbooks/search-fund-broker-outreach-without-a-crm) shows how first calls fit into a hundred owner conversations.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so the LinkedIn reply where an owner agreed to a call and the WhatsApp chat where you send the agenda are in the same list. You reply in each person’s own app. With your own Anthropic API key, Claude can flag a conversation that looks like a possible deal, and nothing goes on the Deal Desk until you approve it. Approved deals keep the conversation attached, so the agenda, his reply and the next step you promised sit together.',
          'The three lines are still yours to write. Merger keeps them where you will see them before the next call.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  // ── 2026-11-09 ───────────────────────────────────────────────────────────
  {
    slug: 'conditional-offers-in-chat-read-the-if-before-you-call-it-a-deal',
    type: T.list,
    audience: 'All dealmakers',
    title: '7 conditions hiding inside a chat offer, and how to read each one before you call it a deal',
    description:
      '“I’d do three if the lease transfers” looks like an offer. Seven conditions that often ride along with a number in WhatsApp, Telegram or LinkedIn, and how to pin each one down.',
    dek: 'A number and a name look like a deal. Half the time the real offer is in the clause after the comma. Here are seven conditions that hide in chat offers, and a short reply that brings each one into the open.',
    published: '2026-11-09',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'Why chat offers are easy to misread',
        blocks: [
          'Offers in messaging apps are short. A buyer types one line between meetings: “I’d do three if the lease transfers.” It has a number, a buyer and something that sounds like a yes. It is easy to tell the seller you have an offer at three.',
          'You do not. You have an offer at three on one condition, and nobody has checked whether the condition can be met. In a formal letter of intent the conditions sit in their own numbered section. In chat they sit after a comma, inside a voice note, or in a follow-up message two days later.',
          'The list below covers the conditions that most often travel with a number in a chat offer. For each one there is a short reply that turns it from a clause into a question with an answer.',
        ],
      },
      {
        heading: '1. “If the lease transfers”',
        blocks: [
          'For many small businesses the lease is worth as much as the equipment. A buyer who ties the price to the lease is telling you the deal depends on a landlord who has not been asked yet.',
          '**Read it as:** no offer until the landlord says yes. **Reply:** “Understood. Do you need a new lease on the same terms, or an assignment of the current one? I’ll ask the seller what the landlord has said so far.”',
        ],
      },
      {
        heading: '2. “Subject to financing”',
        blocks: [
          'Almost every buyer needs money from somewhere. The question is how certain that money is. A buyer with a lender who has already seen the numbers is a different buyer from one who plans to start calling banks next week.',
          '**Read it as:** the offer is as strong as the lender. **Reply:** “Who is the lender, and have they seen the financials yet? A short note from them would help me put this in front of the seller.” The habit of asking for a dated letter applies here too.',
        ],
      },
      {
        heading: '3. “Assuming the numbers hold up”',
        blocks: [
          'This one sounds harmless and is the widest condition on the list. It can mean a light review of tax returns or a full quality-of-earnings report, and the buyer may not have decided which.',
          '**Read it as:** a price with no floor yet. **Reply:** “Which numbers matter most to you, and what would make you change the price?” The answer tells you whether you are looking at a price or a starting point.',
        ],
      },
      {
        heading: '4. “If the owner stays on”',
        blocks: [
          'Buyers of owner-run businesses often want the seller to stay for a transition. Sellers often want to leave on closing day. When a buyer ties the price to a transition period, the condition is really a question for the seller.',
          '**Read it as:** two offers, one with a transition and one without. **Reply:** “How long would you need him, and in what role? I’ll check what he is willing to do before we talk price.”',
        ],
      },
      {
        heading: '5. “If my partner agrees”',
        blocks: [
          'A buyer who mentions a partner, a spouse, an investment committee or a co-investor is telling you the person you are talking to does not have the final word. The real decision-maker may never have seen the deal.',
          '**Read it as:** interest, not an offer. **Reply:** “Makes sense. What does your partner need to see, and would it help if I sent a short summary you can forward?” Then note who the partner is, so the next update goes to the right person.',
        ],
      },
      {
        heading: '6. “At that structure”',
        blocks: [
          'Sometimes the number comes with a shape: part paid at closing, part over time, part tied to how the business performs. A headline price with a large deferred piece can be worth much less to the seller than a lower price paid up front.',
          '**Read it as:** a price you cannot compare until you know the split. **Reply:** “How much at closing, how much later, and what does the later part depend on?” Write the answer down in full. Structure is the term most likely to be remembered differently by each side.',
        ],
      },
      {
        heading: '7. “If we can close by year end”',
        blocks: [
          'A timing condition can help you. It gives the buyer a reason to move. It can also sink the deal if the seller cannot be ready in time, and nobody says so until the date has passed.',
          '**Read it as:** a deadline both sides need to agree is real. **Reply:** “What happens to the offer if we close in February instead?” If the price changes, you have learned something important about this buyer.',
        ],
      },
      {
        heading: 'Restate the offer in one message',
        blocks: [
          'Once you have the answers, send one message in the app where the buyer made the offer. Restate the number and every condition in full sentences, and ask the buyer to confirm. For example: “Confirming where we are: three million, subject to an assignment of the current lease, with the owner staying on for three months. Anything I have missed?”',
          'That message is the version you take to the seller. It is also the one you will be glad to find in three weeks, when someone remembers the offer slightly differently. The list of [places deal terms hide in your chats](/playbooks/places-deal-terms-hide-in-your-chats) covers where the rest of the terms tend to go missing.',
        ],
      },
      {
        heading: 'A quick check before you tell the seller',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Find the comma', text: 'Read the offer message again and mark every “if”, “assuming”, “subject to” and “depending on”.' },
              { title: 'Ask one question per condition', text: 'In the buyer’s app, the same day, while the offer is fresh.' },
              { title: 'Restate it in full', text: 'One message with the number and every condition, and a request to confirm.' },
              { title: 'Give it a next step', text: 'Who needs to answer what, and by when. See [writing a next step for every deal](/playbooks/write-a-next-step-for-every-deal).' },
            ],
          },
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so an offer on WhatsApp and the follow-up condition on LinkedIn are read in the same list. With your own Anthropic API key, Claude can flag a message that looks like a possible deal. A flag is a suggestion: you open the conversation, read the condition, and decide whether it goes on the Deal Desk. An approved deal keeps its conversations attached, so the restated offer sits next to the deal it belongs to.',
          'No tool reads the condition for you, though. The habit is what protects the deal: find the “if”, ask about it, and write the answer down.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
  {
    slug: 'forwarded-profile-vs-double-opt-in-vs-group-add-three-kinds-of-intro',
    type: T.comparison,
    audience: 'All dealmakers',
    title: 'Forwarded profile, double opt-in or group add? Three kinds of introduction and how to answer each',
    description:
      'Introductions arrive as a bare LinkedIn link, a polite double opt-in or a new WhatsApp group. How the three compare, what each one is missing, and how to answer it the same day.',
    dek: 'Most deals start with an introduction, and introductions now arrive in three very different shapes. Each one leaves out something different. Here is how they compare and what to do with each.',
    published: '2026-11-09',
    readMinutes: 6,
    illustrative: false,
    sections: [
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'table',
            head: ['Kind of intro', 'What you get', 'What is usually missing'],
            rows: [
              ['Forwarded profile', 'A name and a LinkedIn link, often with no message', 'Why you should talk, and whether the other person knows'],
              ['Double opt-in', 'Context, and both sides already said yes', 'Speed: it can take days to arrive'],
              ['Group add', 'Both people in one chat, right away', 'A clear next step, and a private place to talk'],
            ],
          },
        ],
      },
      {
        heading: 'Why the shape matters',
        blocks: [
          'An introduction is a favor. Someone spent a little of their reputation connecting two people. How it arrives tells you how much context they gave, how much the other side expects, and what you need to do next.',
          'The three shapes below are the ones most dealmakers see every week. None of them is wrong. Each one just leaves a different gap, and the fastest way to waste an introduction is to answer all three the same way.',
        ],
      },
      {
        heading: 'The forwarded profile',
        blocks: [
          'A friend sends a LinkedIn profile on WhatsApp. No message. Sometimes a single word: “Talk.” The person who sent it clearly thinks you two should meet, and forgot to say why.',
          'This is the fastest kind of introduction and the thinnest. You do not know what the person does that matters to you, whether they know your name, or whether your friend has told them to expect you. Writing to them cold, with only “a friend sent me your profile”, puts all of that work on a stranger.',
          '**Answer it by** asking the sender one line first: “What should I know before I reach out, and do they know I’m writing?” Then write to the person the same day and name who sent you. A message that starts with a shared contact is far easier to answer than one that starts with you.',
        ],
      },
      {
        heading: 'The double opt-in',
        blocks: [
          'The careful version. The introducer asks each side privately whether they want to meet, then sends one message to both with a line about each person and why they should talk. Both sides have already agreed.',
          'This is the strongest kind of introduction. The context is written down, expectations are set, and nobody is surprised. The cost is time: by the time it arrives, the moment that made it relevant may have moved on.',
          '**Answer it by** replying the same day, thanking the introducer, and moving them to bcc or out of the thread in your next message, where the app allows. Suggest a specific time to talk. The introducer did the slow part, so the rest should be quick.',
        ],
      },
      {
        heading: 'The group add',
        blocks: [
          'Someone creates a WhatsApp or Telegram group with you, the other person and themselves, and writes “You two should talk.” It is immediate and public. It is also easy to lose: if the group goes quiet, the introduction sits there, and if it gets busy, it scrolls away.',
          'The group add has the opposite gap to the forwarded profile. You have plenty of reach, both people are already in the chat, but nobody owns the next step and there is no private place to discuss terms.',
          '**Answer it by** replying in the group the same day so the introducer sees it, then messaging the other person directly to set up a call. Leave the group for thank-yous and updates.',
        ],
      },
      {
        heading: 'Side by side',
        blocks: [
          {
            type: 'table',
            head: ['Question', 'Forwarded profile', 'Double opt-in', 'Group add'],
            rows: [
              ['Does the other person expect you?', 'Often not', 'Yes', 'Yes, publicly'],
              ['Is the reason to talk written down?', 'Rarely', 'Usually', 'Sometimes'],
              ['How fast does it arrive?', 'Immediately', 'Days', 'Immediately'],
              ['Who owns the next step?', 'You, after asking the sender', 'You, the same day', 'You, in a direct message'],
              ['Where should the conversation go next?', 'A direct message that names the sender', 'A call booked by reply', 'A direct message outside the group'],
            ],
          },
        ],
      },
      {
        heading: 'Three mistakes that waste an introduction',
        blocks: [
          {
            type: 'list',
            items: [
              '**Waiting for a better moment.** An introduction is warmest on the day it arrives. A reply on day four reads as a polite no, even when it is not.',
              '**Pitching in the first message.** The first reply to any introduction should be short: thanks, a line about why you are glad to meet, and a time to talk. The details belong on the call.',
              '**Forgetting the introducer.** Tell the person who connected you what happened, whether it turned into a deal or not. It is the main reason they will introduce you again.',
            ],
          },
        ],
      },
      {
        heading: 'One habit for all three',
        blocks: [
          'Whichever shape it takes, an introduction has two jobs to do after it arrives. The first is a reply the same day, even a short one. The second is a record: who introduced you, when, in which app, and what they said. Six months later, when the deal closes or the person sends you another one, that record is how you remember who opened the door.',
          'If the first message gets no answer, a short follow-up a week later is normal. The guide to [follow-up messages that restart a quiet deal](/playbooks/follow-up-messages-that-restart-a-quiet-deal) has examples that work for introductions too.',
        ],
      },
      {
        heading: 'Where Merger fits',
        blocks: [
          'In Merger, the messaging accounts you connect sit in one inbox, so a profile forwarded on WhatsApp, a double opt-in on LinkedIn and a group add on Telegram land in the same list. When you save the new person to your Rolodex, the contact stays linked to the message the introduction came from, so you can always see who made it and what they said.',
          'The tool keeps the record. The same-day reply is still yours to send.',
          WORTH_KNOWING,
        ],
      },
    ],
  },
];
