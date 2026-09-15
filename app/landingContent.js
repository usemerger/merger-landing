export const features = [
  {
    number: '01', icon: 'messages', label: 'Connected conversations',
    title: 'Stay in the conversation.',
    description: 'Read and reply to connected messages from one desktop workspace. Keep the conversation close when it becomes part of a deal.',
    note: 'Available networks and messaging actions vary by service during alpha.',
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
  { question: 'What is available in this alpha?', answer: 'The current release is the Merger desktop app for Windows: connected messaging, the Deal Desk, Rolodex, and in-app DocuSign. It is an early release, and network availability and individual messaging actions can vary. Other platforms and team plans are not included in this launch.' },
  { question: 'Do I need a Claude subscription?', answer: 'Claude features require your own Anthropic API key. Anthropic API usage is billed separately from your Merger subscription; a Claude chat subscription is not an API key. You can use messaging and organize deals manually without enabling Claude features.' },
  { question: 'Does Merger file deals or send documents automatically?', answer: 'You review detected deal suggestions before filing them. In DocuSign, you choose a field before inserting a value, or copy and paste it yourself. You control sending and signing inside your own DocuSign account.' },
  { question: 'Which messaging accounts can I connect?', answer: 'Use the connection options available in the Windows app. The supported accounts, history coverage, and messaging actions vary by service during alpha. Contact support if a particular network is essential to your workflow.', link: { href: '/support', label: 'Ask about your workflow' } },
  { question: 'Can I use my existing DocuSign account and templates?', answer: 'Yes. Sign in to your own DocuSign account in the embedded browser. Your Rolodex is beside it for recipient names, emails, and other available details. Copy and paste works as a fallback for fields that do not accept Insert. DocuSign access and any charges are separate from Merger.' },
  { question: 'What does the alpha cost?', offer: true },
];
