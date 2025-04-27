import { Component, signal, model, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-login',
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <h1>Audio Emailer Login</h1>
      <form (submit)="loginUser()">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            class="input-field disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            type="email"
            id="email"
            name="email"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
            [disabled]="isLoading()"
          />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            class="input-field disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            type="password"
            id="password"
            name="password"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            [disabled]="isLoading()"
          />
        </div>
        @if( errorMessage() ){
        <div style="color: red; margin-bottom: 15px;">{{ errorMessage() }}</div>
        }
        <div class="button-group">
          <button type="submit" class="login-button">Login</button>
          <button type="button" class="register-button">Register</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh; 
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
      width: 300px; 
    }

    .input-field {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      width: 300px;
    }

    .login-button, .register-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .login-button {
      background-color: #007bff;
      color: white;
    }

    .register-button {
      background-color: #6c757d;
      color: white;
    }
  `,
})
export class loginPage {
  authService = inject(AuthService);

  email = signal('');
  password = signal('');
  isLoading = this.authService.isLoading;
  errorMessage = this.authService.errorMessage;

  router = inject(Router);

  constructor() {
    this.authService.logout();
  }

  loginUser() {
    this.errorMessage.set('');
  
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }
  
    this.isLoading.set(true);
  
    this.authService.login(this.email(), this.password()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage.set('Login failed. Please try again.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  
}
