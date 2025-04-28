import { AuthService } from './../../services/auth.service';
import {
  Component,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { SpeechSynthesisService } from '../../services/speechSynthesis.service';
import { LayoutComponent } from './components/dashbooard-layout.component';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, LayoutComponent],
  template: `
    <dashboard-layout>
      @if (!this.settingsService.isLoading()) {
      <div class="grid grid-cols-6 h-screen">

        <!-- Sidebar -->
        <div class="col-span-1 flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4 justify-between">
          <div class="flex flex-col items-center gap-4">
            <div class="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ settingsService.settings().name || 'User Name' }}
            </h2>

            <div class="flex flex-col gap-4 mt-6 w-full">
              <button (click)="filterEmails('INBOX')" [class.bg-gray-700]="currentFilter() === 'INBOX'"
                class="w-full py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                All Emails
              </button>
              <button (click)="filterEmails('STARRED')" [class.bg-gray-700]="currentFilter() === 'STARRED'"
                class="w-full py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                Starred Emails
              </button>
              <button (click)="filterEmails('SENT')" [class.bg-gray-700]="currentFilter() === 'SENT'"
                class="w-full py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                Sent Emails
              </button>
              <button (click)="filterEmails('TRASH')" [class.bg-gray-700]="currentFilter() === 'TRASH'"
                class="w-full py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                Trash Emails
              </button>
            </div>
          </div>

          <button class="w-full py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
            Settings
          </button>
        </div>

        <!-- Email List -->
        <div class="col-span-2 h-screen overflow-y-auto border-r">
          <div class="p-4 border-b">
            <h1 class="text-xl font-bold">All Emails</h1>
            <p class="text-sm text-gray-500">222 messages 44 unread</p>
          </div>

          <div class="flex flex-col">
            @for (email of this.emailService.emails(); track $index) {
            <div class="flex items-center justify-between border-b p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div class="font-semibold">{{ email.from }}</div>
                <div class="text-gray-500">{{ email.subject }}</div>
                <div class="text-xs text-gray-400">
                  {{ email.snippet.slice(0, 40) }}...
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-400">
                  {{ email.date.split('T')[1].slice(0,5) }}
                </span>
                <button (click)="speakEmail(email)" class="mt-2 p-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500">
                  ▶️
                </button>
              </div>
            </div>
            }
          </div>
        </div>

        <!-- Email Detail -->
        <div class="col-span-3 p-6 overflow-y-auto">
          <div class="h-[80px] flex items-center justify-between p-4 border-b">
            <div class="flex gap-4 items-center">
              <label for="voice-select">Choose a voice:</label>
              <select (change)="onVoiceChange($event)" name="voices" id="voice-select" class="px-4 py-3 rounded-lg border">
                @for (voice of this.speakSynthesisService.getVoices(); track $index) {
                <option [value]="voice.name" [selected]="voice.name === this.speakSynthesisService.selectedVoice()?.name">
                  {{ voice.name }}
                </option>
                }
              </select>
            </div>
            <div class="flex gap-4">
              @if (this.speakSynthesisService.speaking()) {
              <button (click)="this.speakSynthesisService.cancel()" class="text-white font-bold bg-red-500 px-6 py-3 rounded-xl">
                Stop Reading
              </button>
              }
              <button (click)="speak()" class="text-white font-bold bg-black px-6 py-3 rounded-xl">
                Read Email
              </button>
            </div>
          </div>

          @if (emailService.selectedEmail()) {
          <div class="flex justify-between items-center mb-4">
            <div>
              <div class="text-lg font-semibold">From: {{ emailService.selectedEmail()!.from }}</div>
              <div class="text-md">Subject: {{ emailService.selectedEmail()!.subject }}</div>
              <div class="text-sm text-gray-500">To: {{ settingsService.settings().name }}</div>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-xs text-gray-400">{{ emailService.selectedEmail()!.date.split('T')[0] }}</span>
              <button (click)="speak()" class="mt-2 p-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500">
                ▶️
              </button>
            </div>
          </div>

          <hr class="mb-4">
          <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ emailService.selectedEmail()!.texts[0] || '' }}
          </div>
          }
        </div>

      </div>
      }
    </dashboard-layout>
  `,
})
export class DashboardPage implements OnInit {
  emailService = inject(EmailService);
  speakSynthesisService = inject(SpeechSynthesisService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  showOnboarding = signal(false);
  currentFilter = signal('INBOX');

  ngOnInit() {
    console.log('Dashboard initialized');
    this.settingsService.getUserSettings();
    this.emailService.emails.set(this.emailService.getDummyEmails());
  }

  fetchEmails = effect(() => {
    if (!this.settingsService.isLoading() && this.settingsService.linkedAccounts().length > 0) {
      this.emailService.loadEmails('GMAIL', 0, 10, 'INBOX', this.settingsService.linkedAccounts()[0].email);
    }
  });

  filterEmails(label: string) {
    this.currentFilter.set(label);
    this.emailService.emails.set(this.emailService.getDummyEmails()); 
  }

  onVoiceChange(event: Event) {
    const selectedVoiceName = (event.target as HTMLSelectElement).value;
    const selectedVoice = this.speakSynthesisService.getVoices().find(voice => voice.name === selectedVoiceName);
    if (selectedVoice) {
      this.speakSynthesisService.selectVoice(selectedVoice);
    }
  }

  speak() {
    this.speakSynthesisService.speak(this.emailService.selectedEmail()?.texts[0] || '', {
      rate: 0.9,
      pitch: 0.6,
      volume: 0.5,
    });
  }

  speakEmail(email: any) {
    this.speakSynthesisService.speak(email.texts?.[0] || '', {
      rate: 0.9,
      pitch: 0.6,
      volume: 0.5,
    });
  }
}
