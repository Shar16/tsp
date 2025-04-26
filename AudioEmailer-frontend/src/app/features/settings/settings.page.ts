import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../dashboard/components/dashbooard-layout.component';
import { SettingsService } from '../../services/settings.service';

interface Settings {
  colorMode: 'LIGHT' | 'DARK';
  contrastMode: 'LOW' | 'HIGH';
  readingSpeed: number;
  amplitude: number;
  pauseDuration: number;
  assistantVoice: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <dashboard-layout>
      <div class="settings-container w-full">
        <div class=" h-[80px] flex items-center justify-between  p-4 border-b">
          <h1 class=" text-3xl font-bold ">Settings</h1>
        </div>

        <div class="p-4 flex flex-col gap-4">
          <h2 class="text-xl pb-1">Appearance</h2>

          <div class="flex gap-2 items-center">
            <label>Color Mode: </label>
            <div class="flex gap-2">
              <button
                class="border rounded-lg py-3 px-6"
                [class]="
                  colorMode() === 'LIGHT'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                (click)="updateColorMode('LIGHT')"
              >
                Light
              </button>
              <button
                class="border rounded-lg py-3 px-6"
                [class]="
                  colorMode() === 'DARK'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                (click)="updateColorMode('DARK')"
              >
                Dark
              </button>
            </div>
          </div>

          <div class="flex gap-2 items-center">
            <label>Contrast Mode: </label>
            <div class="flex gap-2">
              <button
                class="border rounded-lg py-3 px-6"
                [class]="
                  contrastMode() === 'LOW'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                (click)="updateContrastMode('LOW')"
              >
                Low
              </button>
              <button
                class="border rounded-lg py-3 px-6"
                [class]="
                  contrastMode() === 'HIGH'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                (click)="updateContrastMode('HIGH')"
              >
                High
              </button>
            </div>
          </div>
        </div>

        <div class="p-4">
          <h2 class=" text-xl">Voice Settings</h2>

          <div class="setting-item">
            <label>Reading Speed: {{ readingSpeed() }}</label>
            <input
              type="range"
              min="50"
              max="200"
              [value]="readingSpeed()"
              (input)="updateReadingSpeed($event)"
            />
          </div>

          <div class="setting-item">
            <label>Volume: {{ amplitude() }}</label>
            <input
              type="range"
              min="0"
              max="100"
              [value]="amplitude()"
              (input)="updateAmplitude($event)"
            />
          </div>

          <div class="setting-item">
            <label>Pause Duration: {{ pauseDuration() }}ms</label>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              [value]="pauseDuration()"
              (input)="updatePauseDuration($event)"
            />
          </div>

          <div class="setting-item">
            <label>Voice</label>
            <select
              [value]="assistantVoice()"
              (change)="updateAssistantVoice($event)"
            >
              @for (voice of availableVoices(); track voice) {
              <option [value]="voice">{{ voice }}</option>
              }
            </select>
          </div>
        </div>

        <div class="flex gap-4 p-4">
          <button
            class="py-3 px-6 border rounded-lg"
            (click)="cancelChanges()"
            [disabled]="!hasChanges()"
          >
            Cancel
          </button>
          <button
            class="py-3 px-6 border rounded-lg bg-black text-white disabled:bg-gray-300"
            (click)="saveSettings()"
            [disabled]="!hasChanges()"
          >
            Save Changes
          </button>
        </div>
      </div>
    </dashboard-layout>
  `,
})
export class SettingsPage {
  settingsService = inject(SettingsService);
  private originalSettings: Settings = {
    colorMode: 'DARK',
    contrastMode: 'HIGH',
    readingSpeed: 100,
    amplitude: 50,
    pauseDuration: 1000,
    assistantVoice: 'ALICE',
  };

  colorMode = signal<'LIGHT' | 'DARK'>(this.originalSettings.colorMode);
  contrastMode = signal<'LOW' | 'HIGH'>(this.originalSettings.contrastMode);
  readingSpeed = signal<number>(this.originalSettings.readingSpeed);
  amplitude = signal<number>(this.originalSettings.amplitude);
  pauseDuration = signal<number>(this.originalSettings.pauseDuration);
  assistantVoice = signal<string>(this.originalSettings.assistantVoice);

  availableVoices = signal<string[]>([
    'ALICE',
    'BOB',
    'CHARLIE',
    'DAVE',
    'EVE',
    'FRANK',
  ]);

  hasChanges = computed(
    () =>
      this.colorMode() !== this.originalSettings.colorMode ||
      this.contrastMode() !== this.originalSettings.contrastMode ||
      this.readingSpeed() !== this.originalSettings.readingSpeed ||
      this.amplitude() !== this.originalSettings.amplitude ||
      this.pauseDuration() !== this.originalSettings.pauseDuration ||
      this.assistantVoice() !== this.originalSettings.assistantVoice
  );

  currentSettings = computed<Settings>(() => ({
    colorMode: this.colorMode(),
    contrastMode: this.contrastMode(),
    readingSpeed: this.readingSpeed(),
    amplitude: this.amplitude(),
    pauseDuration: this.pauseDuration(),
    assistantVoice: this.assistantVoice(),
  }));

  // Update a single setting
  updateColorMode(mode: 'LIGHT' | 'DARK'): void {
    this.colorMode.set(mode);
  }

  updateContrastMode(mode: 'LOW' | 'HIGH'): void {
    this.contrastMode.set(mode);
  }

  updateReadingSpeed($event: Event): void {
    const value = +($event.target as HTMLInputElement).value;
    this.readingSpeed.set(value);
  }

  updateAmplitude($event: Event): void {
    const value = +($event.target as HTMLInputElement).value;
    this.amplitude.set(value);
  }

  updatePauseDuration($event: Event): void {
    const value = +($event.target as HTMLInputElement).value;
    this.pauseDuration.set(value);
  }

  updateAssistantVoice($event: Event): void {
    const value = ($event.target as HTMLInputElement).value;
    this.assistantVoice.set(value);
  }

  saveSettings(): void {
    this.settingsService.updateSettings(this.currentSettings()).subscribe({
      next: (settings) => {
        console.log('Settings saved:', settings);
      },
      error: (error) => {
        console.error('Error saving settings:', error);
      },
    });

    this.originalSettings = {
      ...this.currentSettings(),
    };
  }

  cancelChanges(): void {
    this.colorMode.set(this.originalSettings.colorMode);
    this.contrastMode.set(this.originalSettings.contrastMode);
    this.readingSpeed.set(this.originalSettings.readingSpeed);
    this.amplitude.set(this.originalSettings.amplitude);
    this.pauseDuration.set(this.originalSettings.pauseDuration);
    this.assistantVoice.set(this.originalSettings.assistantVoice);
  }
}
