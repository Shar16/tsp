import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard-layout',
  imports: [RouterModule],
  standalone: true,
  template: `
    <main class="flex flex-col min-h-screen w-full">
      <router-outlet></router-outlet>
      <ng-content></ng-content>
    </main>
  `,
})
export class LayoutComponent {}
