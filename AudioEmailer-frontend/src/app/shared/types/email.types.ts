interface Attachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
}

export interface Email {
  threadId: string;
  labelIds: string[];
  snippet: string;
  from: string;
  to: string;
  date: string;
  subject: string;
  texts: string[];
  attachments: Attachment[];
}

export type EmailAccount = 'GMAIL' | 'OUTLOOK';
