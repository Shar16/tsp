import { Routes } from '@angular/router';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { SettingsPage } from './features/settings/settings.page';
import { loginPage } from './features/auth/login.component';
import { registerPage } from './features/auth/register.component';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'settings', component: SettingsPage, canActivate: [authGuard] },
  { path: 'login', component: loginPage },
  { path: 'register', component: registerPage },
  { path: '**', redirectTo: 'dashboard' },
];
