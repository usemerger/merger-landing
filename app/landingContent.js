export const features = [
  {
    number: '01', icon: 'messages', label: 'Connected conversations',
    title: 'Stay in the conversation.',
    description: 'Read and reply to connected messages from one desktop workspace. Keep the conversation close when it becomes part of a deal.',
    note: 'Available networks and messaging actions vary by service.',
  },
  {
    number: '02', icon: 'review', label: 'Claude + your judgment',
    title: 'A suggestion. Your decision.',
    description: 'Use your own Anthropic API key to find potential deals in conversation history. Review the source, then file the suggestions you want on your Deal Desk.',
    note: 'Anthropic API usage is billed separately from Merger.',
  },
  {
    number: '03', icon: 'contact', label: 'A useful Rolodex',
    title: 'Keep the introduction.',
    description: 'Pick up names, emails, phone numbers, and company details shared in introductions. See where a detail came from and correct it when needed.',
    note: 'Contact details stay connected to their conversation context.',
  },
  {
    number: '04', icon: 'document', label: 'DocuSign inside Merger',
    title: 'Put the details beside the document.',
    description: 'Open your own DocuSign account in the app with your Rolodex alongside it. Select a field and Insert, or Copy and paste details into a template.',
    note: 'You review, send, and sign in DocuSign. A DocuSign account is required.',
  },
];

export const workflowSteps = [
  { id: 'messages', label: 'Converse', title: 'The opportunity starts here.', description: 'Keep connected conversations in view. This example follows one introduction and one proposal.', detail: 'Sample conversation' },
  { id: 'review', label: 'Review', title: 'Decide what makes the desk.', description: 'Claude surfaces a possible deal with its source. Review it before filing, or dismiss it.', detail: 'Review before filing' },
  { id: 'rolodex', label: 'Remember', title: 'The introduction becomes useful.', description: 'Contact details shared in a message can become Rolodex fields, with the source available to check.', detail: 'Details from the conversation' },
  { id: 'documents', label: 'Prepare', title: 'Keep the people beside the paperwork.', description: 'Use your own DocuSign account inside Merger. Copy recipient details or insert them into the field you select.', detail: 'Your DocuSign account' },
];

export const faqs = [
  { question: 'What is Merger?', answer: 'Merger is a unified inbox and deal desk for dealmakers. It brings WhatsApp, Telegram, LinkedIn, Slack and other messaging accounts into one workspace, uses Claude (with your own Anthropic API key) to flag messages that look like deals for you to review, and keeps the conversation, contacts and your own DocuSign account beside each deal. It is built for brokers, searchers, investors, family offices and others whose deals start in chat.' },
  { question: 'How do I get started?', answer: 'Click Download, create your Merger account and verify your email. From your account, choose monthly ($50) or annual ($480) and complete checkout, then download Merger for Windows or get it on the App Store for iPhone. If Merger is not for you, email support within 30 days of your first payment for a full refund.' },
  { question: 'What’s available today?', answer: 'Merger is available for Windows and iPhone (on the App Store as “Merger: Inbox for Dealmakers”): connected messaging, the Deal Desk, Rolodex, and in-app DocuSign. It is an early release, and network availability and individual messaging actions can vary. Mac, Android and team plans are not included in this launch.' },
  { question: 'Do I need a Claude subscription?', answer: 'Claude features require your own Anthropic API key. Anthropic API usage is billed separately from your Merger subscription; a Claude chat subscription is not an API key. You can use messaging and organize deals manually without enabling Claude features.' },
  { question: 'Does Merger file deals or send documents automatically?', answer: 'You review detected deal suggestions before filing them. In DocuSign, you choose a field before inserting a value, or copy and paste it yourself. You control sending and signing inside your own DocuSign account.' },
  { question: 'Which messaging accounts can I connect?', answer: 'Merger is built for the networks dealmakers use, including WhatsApp, Telegram, LinkedIn, Slack, Signal, Instagram, Messenger, Discord, X and LINE. The connection options are in the app, and the supported accounts, history coverage, and messaging actions vary by service. SMS and iMessage are not included. Contact support if a particular network is essential to your workflow.', link: { href: '/support', label: 'Ask about your workflow' } },
  { question: 'Can I use my existing DocuSign account and templates?', answer: 'Yes. Sign in to your own DocuSign account in the embedded browser. Your Rolodex is beside it for recipient names, emails, and other available details. Copy and paste works as a fallback for fields that do not accept Insert. DocuSign access and any charges are separate from Merger.' },
  { question: 'What does Merger cost?', offer: true },
];
