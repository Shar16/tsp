import { Component, input, model, effect } from '@angular/core';
import { formatDate } from '@angular/common';
import { Email } from '../../../shared/types/email.types';

@Component({
  selector: 'dashboard-email-preview',
  imports: [],
  template: `<div class="p-4 border-b hover:bg-gray-100">
    <button class="w-full text-left" (click)="selectedEmailId.set(email().threadId)">
      <h3>{{ email().from }}</h3>
      <h4>{{ email().subject }}</h4>
      <p class="line-clamp-2">{{ email().texts[0] }}</p>
      <p>{{ email().date }}</p>
    </button>
  </div>`,
  styles: ``,
})
export class EmailPreviewComponent {
  email = input.required<Email>();

  selectedEmailId = model('');

  formatDate(date?: string) {
    return date ? formatDate(date, 'short', 'en-US') : '2025-04-02T09:30:00';
  }
}
