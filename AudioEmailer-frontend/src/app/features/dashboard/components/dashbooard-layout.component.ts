import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dashboard-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div class="flex flex-col items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <h2 class="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">User Name</h2>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button class="w-full py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium">Settings</button>
          </div>

          <!-- Theme Toggle Switch -->
          <div class="mt-6 flex items-center">
            <label for="themeToggle" class="mr-2 text-sm text-gray-800 dark:text-gray-200">Dark Mode</label>
            <input type="checkbox" id="themeToggle" class="toggle-checkbox hidden" (change)="toggleTheme()" [checked]="isDarkMode" />
            <label for="themeToggle" class="toggle-label block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer relative">
              <span class="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto">
        <router-outlet></router-outlet>
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked + .toggle-label {
      background-color: #4f46e5;
    }
    .toggle-checkbox:checked + .toggle-label .dot {
      transform: translateX(1.5rem);
    }
  `]
})
export class LayoutComponent implements OnInit {
  isDarkMode = false;

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    this.isDarkMode = theme === 'dark';
    this.updateThemeClass();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateThemeClass();
  }

  private updateThemeClass() {
    const root = document.documentElement;
    if (this.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
