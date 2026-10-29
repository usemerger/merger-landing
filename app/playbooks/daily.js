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
];
