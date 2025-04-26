export interface Attachment {
  title: string;
  body: string;
}

export interface DummyEmail {
  _id: number;
  senderName: string;
  recipient: string;
  title?: string;
  subject: string;
  body: string;
  date: string;
  timestamp?: string;
  read: boolean;
  important: boolean;
  attachments: Attachment[];
}

const dummyEmails: DummyEmail[] = [
  {
    _id: 1,
    senderName: 'john.doe@company.com',
    recipient: 'user@example.com',
    subject: 'Weekly Team Meeting',
    body: "Dear [Hiring Manager's Name], \n I hope you're doing well. I am writing to express my interest in the [Job Title] position at [Company Name]. With my background in [mention relevant skills or experience], I am excited about the opportunity to contribute to your team. \n I have attached my resume for your review. I would love the chance to discuss how my skills align with this role. Please let me know if we could arrange a time to talk. Thank you for your time and cons_ideration. I look forward to your response. \n Best regards, Alice",
    date: '2023-10-15T09:30:00',
    read: true,
    important: false,
    attachments: [
      { title: 'agenda.pdf', body: 'Meeting agenda content' },
      { title: 'minutes.docx', body: 'Previous meeting minutes' }
    ],
  },
  {
    _id: 2,
    senderName: 'marketing@newsletter.com',
    recipient: 'user@example.com',
    subject: 'October Newsletter: New Product Features',
    body: 'Check out our latest product updates.\nSee upcoming features that will enhance your experience.',
    date: '2023-10-14T14:15:00',
    read: false,
    important: false,
    attachments: [
      { title: 'newsletter-october.pdf', body: 'Newsletter content' }
    ],
  },
  {
    _id: 3,
    senderName: 'support@service.com',
    recipient: 'user@example.com',
    subject: 'Your Support Ticket #45678',
    body: "We've resolved your recent support request.\nPlease let us know if you need further assistance.",
    date: '2023-10-13T11:45:00',
    read: true,
    important: true,
    attachments: [
      { title: 'ticket-details.txt', body: 'Ticket details content' }
    ],
  },
  {
    _id: 4,
    senderName: 'notifications@github.com',
    recipient: 'user@example.com',
    subject: 'Pull Request: Feature/user-authentication',
    body: 'A new pull request has been opened in your repository.\nPlease review the changes and prov_ide feedback.',
    date: '2023-10-12T16:20:00',
    read: false,
    important: true,
    attachments: [
      { title: 'pull-request-details.md', body: 'Pull request details content' }
    ],
  },
  {
    _id: 5,
    senderName: 'jane.smith@partner.org',
    recipient: 'user@example.com',
    subject: 'Partnership Opportunity',
    body: "I'd like to discuss a potential partnership between our organizations.\nThis could benefit both parties.",
    date: '2023-10-11T10:00:00',
    read: true,
    important: false,
    attachments: [
      { title: 'proposal.pdf', body: 'Partnership proposal content' }
    ],
  },
];

export default dummyEmails;
