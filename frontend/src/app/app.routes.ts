import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password.component';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './components/user/profile.component';
import { EventListComponent } from './components/events/event-list.component';
import { EventDetailComponent } from './components/events/event-detail.component';
import { EventCreateComponent } from './components/events/event-create.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { SettingsComponent } from './components/admin/settings.component';
import { AnalyticsComponent } from './components/admin/analytics.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard] 
  },
  // Event routes
  {
    path: 'events',
    component: EventListComponent
  },
  {
    path: 'events/create',
    component: EventCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'events/:id',
    component: EventDetailComponent
  },
  {
    path: 'my-events',
    component: EventListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'recommendations',
    component: EventListComponent,
    canActivate: [AuthGuard]
  },
  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
