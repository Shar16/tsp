import { Component, signal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'auth-register',
  imports: [FormsModule],
  template: `
    <div class="register-container">
      <h1>Audio Emailer Regiser</h1>
      <form (submit)="registerUser()">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            class="input-field"
            type="email"
            id="email"
            name="email"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
          />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            class="input-field"
            type="password"
            id="password"
            name="password"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
          />
        </div>
        <div class="button-group">
          <button type="submit" class="register-button">Register</button>
          <button type="button" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .register-container {
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

    .register-button, .cancel-button {
      padding: 10px 20px;

      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .register-button {
      background-color: #007bff;
      color: white;
    }

    .cancel-button {
      background-color: #6c757d;
      color: white;
    }
  `,
})
export class registerPage {
  email = signal('');
  password = signal('');

  registerUser() {
    console.log('Sending data');
    console.log(this.email());
    console.log(this.password());
  }
}
