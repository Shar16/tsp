import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-outlook-button',
  standalone: true,
  template: `
    <button (click)="this.authService.redirectToAuthUrl('OUTLOOK')" class="bg-black text-white px-4 py-2 mr-2">Link Gmail</button>
  `,
})
export class OutlookButtonComponent {
  authService = inject(AuthService);
}
