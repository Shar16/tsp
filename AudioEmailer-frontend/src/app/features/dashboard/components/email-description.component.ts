import { Component, input } from '@angular/core';
import { formatDate } from '@angular/common';
import { Email } from '../../../shared/types/email.types';

@Component({
  selector: 'dashboard-email-description',
  imports: [],
  template: `
    <div class=" border-l h-full max-h-[calc(100vh-80px)] overflow-hidden overflow-y-scroll">
      <div class="border-b p-4">
        <div class="flex justify-between">
          <div class="flex items-center gap-1">
            <p class=" font-bold">From:</p>
            <h3>{{ email().from }}</h3>
          </div>
          <p>{{ email().date }}</p>
        </div>
        <div class="flex items-center gap-1">
          <p class=" font-bold">Subject:</p>
          <h4>{{ email().subject }}</h4>
        </div>
      </div>
      <div class="p-4">
        <div [innerHTML]="paragraphify(email().texts[0])"></div>
      </div>
      @if (email().attachments.length > 0) {
      <div class="p-4 border-t">
        <p class=" font-bold">
          {{ email().attachments.length > 1 ? 'Attachments: ' : 'Attachment:' }}
        </p>
        <div class=" flex gap-4 pt-2">
          @for (attachment of email().attachments; track $index) {
          <a class=" border rounded-lg p-4" href="#" target="_blank">
            {{ attachment.filename }}
          </a>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: ``,
})
export class EmailDescriptionComponent {
  email = input.required<Email>();

  formatDate(date?: string) {
    return date ? formatDate(date, 'medium', 'en-UK') : '2023-10-15T09:30:00';
  }

  paragraphify(text: string | undefined): string {
    if (!text) return '';

    return text;
  }
}
