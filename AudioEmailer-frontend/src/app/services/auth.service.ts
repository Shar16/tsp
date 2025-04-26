import { EmailService } from './email.service';
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

export interface EmailAuthResponse {
  message: string;
  authUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'https://audio-emailer-dev.onrender.com';
  private readonly TOKEN_KEY = 'auth_token';
  router = inject(Router);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isLoggedIn = signal(false);
  emailService = inject(EmailService);

  constructor(private http: HttpClient) {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.isLoading.set(true);
    const token = this.getToken();
    if (token) {
      this.isLoggedIn.set(true);
    } else {
      this.isLoggedIn.set(false);
    }
    this.isLoading.set(false);
  }

  login(credentials: LoginCredentials): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.http
      .post<LoginResponse>(`${this.API_URL}/api/users/login`, credentials)
      .subscribe({
        next: (response) => {
          console.log('Storing token:', response.accessToken);
          this.storeToken(response.accessToken);
          this.isLoggedIn.set(true);
          this.isLoading.set(false);
          this.errorMessage.set(null);
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set('Invalid email or password');
          console.error('Login failed:', error);
        },
      });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
    this.emailService.clearEmails();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getAuthUrl(accountType: string): Observable<EmailAuthResponse> {
    return this.http.get<EmailAuthResponse>(`${this.API_URL}/api/emails/auth`, {
      params: { accountType },
    });
  }

  redirectToAuthUrl(mailService: string): void {
    this.getAuthUrl(mailService).subscribe({
      next: (response) => {
        const authUrl = response.authUrl;
        if (authUrl) {
          window.location.href = authUrl;
        }
      },
      error: (error) => {
        console.error('Error fetching Outlook auth URL:', error);
      },
    });
  }
}
