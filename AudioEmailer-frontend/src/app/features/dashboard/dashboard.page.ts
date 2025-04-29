import {
  Component,
  OnInit,
  inject,
  signal,
  effect,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../services/email.service';
import { SpeechSynthesisService } from '../../services/speechSynthesis.service';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { LayoutComponent } from './components/dashbooard-layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, LayoutComponent],
  template: `
    <dashboard-layout>
      <div class="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors">
        
        <!-- Sidebar -->
        <div class="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col justify-between">
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
            <h2 class="text-lg font-semibold mb-6">{{ settingsService.settings().name || 'User Name' }}</h2>

            <button
              *ngFor="let tab of tabs"
              class="w-full py-3 mb-3 rounded-lg font-medium transition-all text-center"
              [ngClass]="{
                'bg-gray-300 dark:bg-gray-700 text-black dark:text-white': selectedTab() === tab.value,
                'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600':
                  selectedTab() !== tab.value
              }"
              (click)="selectTab(tab.value)"
            >
              {{ tab.label }}
            </button>

            <!-- Theme toggle -->
            <button
              class="w-full py-3 mt-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              (click)="toggleTheme()"
            >
              Toggle Theme
            </button>
          </div>

          <button
            class="w-full py-3 rounded-lg bg-white dark:bg-gray-900 border dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
          >
            Settings
          </button>
        </div>

        <!-- Email List -->
        <div class="flex-1 max-w-md border-r overflow-y-auto">
          <div class="p-4 border-b">
            <h1 class="text-xl font-bold">All Emails</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">222 messages 44 unread</p>
          </div>

          <div class="divide-y">
            @for (email of emailService.emails(); track $index) {
              <div class="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" (click)="selectEmail(email.threadId)">
                <div>
                  <div class="font-semibold">{{ email.from }}</div>
                  <div class="text-sm text-gray-500">{{ email.subject }}</div>
                  <div class="text-xs text-gray-400">{{ email.snippet.slice(0, 40) }}...</div>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-xs text-gray-400">{{ email.date.split('T')[1].slice(0, 5) }}</span>
                  <button
                    (click)="speakEmail(email)"
                    class="mt-2 p-3 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    ▶️
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Email Detail or GIF -->
        <div class="flex-1 p-6 overflow-y-auto">
          @if (emailService.selectedEmail()) {
            <div class="flex justify-between mb-4">
              <div>
                <div class="font-semibold">
                  From: {{ emailService.selectedEmail()!.from }}
                </div>
                <div>Subject: {{ emailService.selectedEmail()!.subject }}</div>
                <div class="text-sm text-gray-500">To: {{ settingsService.settings().name }}</div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs text-gray-400">{{ emailService.selectedEmail()!.date.split('T')[0] }}</span>
                <button
                  (click)="speak()"
                  class="mt-2 p-3 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  ▶️
                </button>
              </div>
            </div>
            <hr class="mb-4 border-gray-300 dark:border-gray-600" />
            <div class="whitespace-pre-line text-gray-800 dark:text-gray-200">
              {{ emailService.selectedEmail()!.texts[0] || '' }}
            </div>
          } @else {
            <div class="flex justify-center items-center h-full">
              <img
                src="assets/reading-mail.gif"
                alt="Reading Mail"
                onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<p>GIF missing</p>')"
                class="max-w-xs"
              />
            </div>
          }
        </div>
      </div>
    </dashboard-layout>
  `,
})
export class DashboardPage implements OnInit {
  emailService = inject(EmailService);
  speakSynthesisService = inject(SpeechSynthesisService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);

  selectedTab = signal('INBOX');
  tabs = [
    { label: 'All Emails', value: 'INBOX' },
    { label: 'Starred Emails', value: 'STARRED' },
    { label: 'Sent Emails', value: 'SENT' },
    { label: 'Trash Emails', value: 'TRASH' }
  ];

  ngOnInit() {
    this.settingsService.getUserSettings();
    this.emailService.emails.set(this.emailService.getDummyEmails());

    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  selectTab(tab: string) {
    this.selectedTab.set(tab);
    this.emailService.loadEmails('GMAIL', 0, 10, tab, this.settingsService.linkedAccounts()[0]?.email || '');
  }

  selectEmail(threadId: string) {
    this.emailService.selectEmail(threadId);
  }

  speakEmail(email: any) {
    this.speakSynthesisService.speak(email.texts[0] || '', {
      rate: 0.9,
      pitch: 0.6,
      volume: 0.5,
    });
  }

  speak() {
    const email = this.emailService.selectedEmail();
    if (email) {
      this.speakSynthesisService.speak(email.texts[0] || '', {
        rate: 0.9,
        pitch: 0.6,
        volume: 0.5,
      });
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
