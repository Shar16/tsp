import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Email } from '../shared/types/email.types';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'https://audio-emailer-dev.onrender.com';

  selectedEmail = signal<Email | null>(null);
  emails = signal<Email[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  http = inject(HttpClient);

  getEmails(
    accountType: string = 'GMAIL',
    skip: number = 0,
    limit: number = 10,
    labelIds: string = 'INBOX',
    email: string
  ): Observable<Email[]> {
    const params = {
      accountType,
      skip: skip.toString(),
      limit: limit.toString(),
      labelIds,
      email,
    };

    return this.http.get<any>(`${this.apiUrl}/api/emails`, { params }).pipe(
      map((response) => {
        if (response.data?.messages && accountType === 'GMAIL') {
          return this.parseGmailMessages(response.data.messages);
        }
        return response.data || [];
      })
    );
  }

  loadEmails(
    accountType: string = 'GMAIL',
    skip: number = 0,
    limit: number = 10,
    labelIds: string = 'INBOX',
    email: string
  ): void {
    this.loading.set(true);
    this.error.set(null);
    this.getEmails(accountType, skip, limit, labelIds, email).subscribe({
      next: (emails) => {
        this.emails.set(emails);
        this.loading.set(false);
        if (emails.length > 0) {
          this.selectedEmail.set(emails[0]);
        } else {
          this.selectedEmail.set(null);
        }
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  private parseGmailMessages(messages: any[]): Email[] {
    return messages.map((message) => {
      const headers = message.payload.headers || [];
      const subject =
        headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const fromHeader = headers.find((h: any) => h.name === 'From')?.value || '';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';

      let body = '';
      let attachments: any[] = [];

      if (message.payload.mimeType === 'text/plain') {
        body = this.decodeBase64(message.payload.body.data || '');
      } else if (message.payload.parts) {
        const textPart = message.payload.parts.find(
          (part: any) =>
            part.mimeType === 'text/plain' ||
            (part.parts &&
              part.parts.find((p: any) => p.mimeType === 'text/plain'))
        );

        if (textPart) {
          if (textPart.body.data) {
            body = this.decodeBase64(textPart.body.data);
          } else if (textPart.parts) {
            const innerTextPart = textPart.parts.find(
              (p: any) => p.mimeType === 'text/plain'
            );
            if (innerTextPart && innerTextPart.body.data) {
              body = this.decodeBase64(innerTextPart.body.data);
            }
          }
        }

        attachments = message.payload.parts
          .filter((part: any) => part.filename && part.filename.length > 0)
          .map((part: any) => ({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
          }));
      }

      return {
        threadId: message.threadId || message.id,
        labelIds: message.labelIds || [],
        snippet: message.snippet || '',
        from: fromHeader,
        to: '', // could be parsed later
        subject,
        texts: [body],
        timestamp: dateHeader || new Date(parseInt(message.internalDate)).toISOString(),
        date: dateHeader || new Date(parseInt(message.internalDate)).toISOString(),
        attachments,
        raw: message,
      };
    });
  }

  private decodeBase64(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      console.error('Error decoding base64 content', e);
      return '';
    }
  }

  selectEmail(id: string): void {
    const email = this.emails().find((email) => email.threadId === id);
    if (email) {
      this.selectedEmail.set(email);
    }
  }

  public getDummyEmails(): Email[] {
    return [
      {
        threadId: 'dummy-thread-1',
        labelIds: ['INBOX'],
        snippet: 'Welcome to AudioEmailer!',
        from: 'AudioEmailer Team <contact@audioemailer.com>',
        to: 'you@example.com',
        subject: 'Welcome to AudioEmailer',
        texts: ['Welcome to AudioEmailer! We are excited to have you on board.'],
        date: new Date().toISOString(),
        attachments: [],
      },
      {
        threadId: 'dummy-thread-2',
        labelIds: ['INBOX'],
        snippet: 'Weekly Digest - Top Stories',
        from: 'AudioEmailer Team <contact@audioemailer.com>',
        to: 'you@example.com',
        subject: 'Your Weekly Digest',
        texts: ['Here are the top stories from this week...'],
        date: new Date().toISOString(),
        attachments: [],
      }
    ];
  }

  clearEmails(): void {
    this.emails.set([]);
    this.selectedEmail.set(null);
  }
}
