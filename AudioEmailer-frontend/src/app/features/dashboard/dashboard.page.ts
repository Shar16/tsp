import { AuthService } from './../../services/auth.service';
import {
  Component,
  computed,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmailPreviewComponent } from './components/email-preview.component';
import { EmailDescriptionComponent } from './components/email-description.component';
import { EmailService } from '../../services/email.service';
import { SpeechSynthesisService } from '../../services/speechSynthesis.service';
import { LayoutComponent } from './components/dashbooard-layout.component';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule,
    EmailPreviewComponent,
    EmailDescriptionComponent,
    LayoutComponent,
  ],
  template: `
    <dashboard-layout>
      @if (!this.settingsService.isLoading()) {
      <div class=" h-[80px] flex items-center justify-between  p-4 border-b">
        <h1 class=" text-3xl font-bold ">
          Hello, {{ settingsService.settings().name }}
        </h1>
        <div class=" flex gap-4">
          <div class=" flex gap-4 items-center">
            <label for="voice-select">Choose a voice:</label>

            <select
              (change)="onVoiceChange($event)"
              name="voices"
              id="voice-select"
              class=" px-4 py-3 rounded-lg border"
            >
              @for (voice of this.speakSynthesisService.getVoices(); track
              $index) {
              <option
                [value]="voice.name"
                [selected]="
                  voice.name ===
                  this.speakSynthesisService.selectedVoice()?.name
                "
              >
                {{ voice.name }}
              </option>
              }
            </select>
          </div>

          @if (this.speakSynthesisService.speaking()) {

          <button
            (click)="this.speakSynthesisService.cancel()"
            class=" text-white font-bold bg-red-500 px-6 py-3 rounded-xl "
          >
            Stop Reading
          </button>
          }
          <button
            (click)="speak()"
            class=" text-white font-bold bg-black px-6 py-3 rounded-xl"
          >
            Read Email
          </button>
        </div>
      </div>
      <div class=" grid grid-cols-4 h-[calc(100vh-80px)]">
        <div
          class="col-span-1 h-[calc(100vh-80px)] overflow-hidden overflow-y-scroll"
        >
          @for (email of this.emailService.emails(); track $index) {
          <a (click)="this.emailService.selectEmail(email.threadId)">
            <dashboard-email-preview [email]="email" />
          </a>
          }
        </div>
        <div class="col-span-3">
          @if (emailService.selectedEmail()) {
          <dashboard-email-description
            [email]="emailService.selectedEmail()!"
          />
          }
        </div>
      </div>
      @if (this.showOnboarding()) {
      <!-- show popup saying welcome and two buttons add gmail and add outlook -->
      <div
        class="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-gray-100 p-4 ">
          <h2 class="text-xl font-bold mb-4">Welcome to AudioEmailer!</h2>
          <p class="mb-4">Please link your email account to get started.</p>
          <button
            (click)="this.authService.redirectToAuthUrl('GMAIL')"
            class="bg-black text-white px-4 py-2  mr-2"
          >
            Link Gmail
          </button>
          <button
            (click)="this.authService.redirectToAuthUrl('OUTLOOK')"
            class="bg-black text-white px-4 py-2 "
          >
            Link Outlook
          </button>
        </div>
      </div>
      }} @else {
      <!-- add a loading that pulses -->
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50"
      >
        <div class="animate-pulse text-2xl rounded-lg">Loading...</div>
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

  ngOnInit() {
    console.log('Dashboard page initialized');
    this.settingsService.getUserSettings();
  }

  fetchEmails = effect(() => {
    console.log('Settings', this.settingsService.settings());
    if (
      this.settingsService.isLoading() === false &&
      this.settingsService.linkedAccounts().length > 0
    ) {
      console.log(
        'Linked Accounts:',
        this.settingsService.linkedAccounts()[0].email
      );
      console.log('Getting emails');
      this.emailService.loadEmails(
        'GMAIL',
        0,
        10,
        'INBOX',
        this.settingsService.linkedAccounts()[0].email
      );
    }

    if (
      this.settingsService.isLoading() === false &&
      this.settingsService.linkedAccounts().length == 0
    ) {
      //this.showOnboarding.set(true); //
    }
  });

  showEmails() {
    this.emailService.emails().map((email) => {
      console.log(email);
    });
  }

  onVoiceChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedVoiceName = selectElement.value;
    console.log(selectedVoiceName);
    const selectedVoice = this.speakSynthesisService
      .getVoices()
      .find((voice) => voice.name === selectedVoiceName);

    if (selectedVoice) {
      console.log(selectedVoice);
      this.speakSynthesisService.selectVoice(selectedVoice);
    }
  }

  speak() {
    this.speakSynthesisService.speak(
      this.emailService.selectedEmail()!.texts[0] || '',
      {
        rate: 0.9,
        pitch: 0.6,
        volume: 0.5,
      }
    );
  }
}
