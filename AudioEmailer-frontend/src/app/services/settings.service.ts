import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSettings {
  _id: string;
  name: string;
  email: string;
  colorMode: 'LIGHT' | 'DARK';
  contrastMode: 'LOW' | 'HIGH';
  readingSpeed: number;
  amplitude: number;
  pauseDuration: number;
  assistantVoice: string;
  linkedAccounts: LinkedAccounts[];
}

export interface LinkedAccounts {
  email: string;
  accessToken: string;
  refreshToken: string;
  _id: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = 'https://audio-emailer-dev.onrender.com/api/settings';

  private http = inject(HttpClient);
  settings = signal<UserSettings>({} as UserSettings);
  linkedAccounts = signal<LinkedAccounts[]>([]);
  isLoading = signal(true);

  getUserSettings() {
    console.log('Fetching user settings...');
    this.isLoading.set(true);
    this.http.get<UserSettings>(this.apiUrl).subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.linkedAccounts.set(settings.linkedAccounts);
        console.log(settings.linkedAccounts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching user settings:', error);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
        console.log('User settings fetched');
      },
    });
  }

  updateSettings(settings: {
    colorMode?: 'LIGHT' | 'DARK';
    contrastMode?: 'LOW' | 'HIGH';
    readingSpeed?: number;
    amplitude?: number;
    assistantVoice?: string;
  }): Observable<UserSettings> {
    let params = new HttpParams();

    if (settings.colorMode) {
      params = params.set('colorMode', settings.colorMode);
    }

    if (settings.contrastMode) {
      params = params.set('contrastMode', settings.contrastMode);
    }

    if (settings.readingSpeed !== undefined) {
      params = params.set('readingSpeed', settings.readingSpeed.toString());
    }

    if (settings.amplitude !== undefined) {
      params = params.set('amplitude', settings.amplitude.toString());
    }

    if (settings.assistantVoice) {
      params = params.set('assistantVoice', settings.assistantVoice);
    }

    // Send PATCH request with params
    return this.http.patch<UserSettings>(this.apiUrl, null, { params });
  }
}
