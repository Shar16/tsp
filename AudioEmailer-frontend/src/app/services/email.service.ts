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
          return response.data.messages;
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

  // private parseGmailMessages(messages: any[]): Email[] {
  //   return messages.map((message) => {
  //     const headers = message.payload.headers || [];
  //     const subject =
  //       headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
  //     const sender = headers.find((h: any) => h.name === 'From')?.value || '';
  //     const date = headers.find((h: any) => h.name === 'Date')?.value || '';

  //     // Extract sender name and email address
  //     const senderMatch = sender.match(
  //       /^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/
  //     );
  //     const senderName = senderMatch?.[1] || sender;
  //     const senderAddress = senderMatch?.[2] || sender;

  //     let body = '';
  //     let attachments: any[] = [];

  //     if (message.payload.mimeType === 'text/plain') {
  //       body = this.decodeBase64(message.payload.body.data || '');
  //     } else if (message.payload.parts) {
  //       const textPart = message.payload.parts.find(
  //         (part: any) =>
  //           part.mimeType === 'text/plain' ||
  //           (part.parts &&
  //             part.parts.find((p: any) => p.mimeType === 'text/plain'))
  //       );

  //       if (textPart) {
  //         if (textPart.body.data) {
  //           body = this.decodeBase64(textPart.body.data);
  //         } else if (textPart.parts) {
  //           const innerTextPart = textPart.parts.find(
  //             (p: any) => p.mimeType === 'text/plain'
  //           );
  //           if (innerTextPart && innerTextPart.body.data) {
  //             body = this.decodeBase64(innerTextPart.body.data);
  //           }
  //         }
  //       }

  //       attachments = message.payload.parts
  //         .filter((part: any) => part.filename && part.filename.length > 0)
  //         .map((part: any) => ({
  //           id: part.body.attachmentId,
  //           filename: part.filename,
  //           mimeType: part.mimeType,
  //           size: part.body.size,
  //         }));
  //     }

  //     return {
  //       _id: message.id,
  //       title: subject,
  //       body,
  //       senderName,
  //       senderAddress,
  //       timestamp:
  //         date || new Date(parseInt(message.internalDate)).toISOString(),
  //       attachments,
  //       raw: message,
  //     };
  //   });
  // }

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

  // private getDummyEmails(): Email[] {
  //   return [
  //     {
  //       _id: '1',
  //       title: 'Welcome to AudioEmailer',
  //       body: 'Welcome to AudioEmailer! We are excited to have you on board...',
  //       senderName: 'AudioEmailer Team',
  //       senderAddress: 'contact@audioemailer.com',
  //       timestamp: '2023-10-15T09:30:00',
  //       attachments: [],
  //     },
  //     {
  //       _id: '2',
  //       title: 'Your Weekly Digest',
  //       body: 'Here are the top stories from this week...',
  //       senderName: 'AudioEmailer Team',
  //       senderAddress: 'contact@audioemailer.com',
  //       timestamp: '2023-10-15T09:30:00',
  //       attachments: [],
  //     },
  //   ];
  // }

  clearEmails(): void {
    this.emails.set([]);
    this.selectedEmail.set(null);
  }
}
