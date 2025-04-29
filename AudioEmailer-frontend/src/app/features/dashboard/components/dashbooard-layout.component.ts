import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main class="min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <router-outlet></router-outlet>
      <ng-content></ng-content>
    </main>
  `,
})
export class LayoutComponent {}
