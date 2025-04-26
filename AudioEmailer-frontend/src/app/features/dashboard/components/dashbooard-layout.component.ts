import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'dashboard-layout',
  imports: [RouterModule],
  standalone: true,
  template: `
    <div class="flex h-screen">
      <nav class="border-r ">
        <ul class="flex flex-col gap-4 p-4">
          <li>
            <a [routerLink]="['/']" routerLinkActive="font-bold">Dashboard</a>
          </li>
          <li>
            <a [routerLink]="['/settings']" routerLinkActive="font-bold"
              >Settings</a
            >
          </li>
          <li>
            <button class="" (click)="this.authService.logout()">Log out</button>
          </li>
        </ul>
      </nav>

      <main class="main-content w-full">
        <ng-content></ng-content>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  authService = inject(AuthService);
}
