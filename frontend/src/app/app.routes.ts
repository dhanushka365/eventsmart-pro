import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password.component';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './components/user/profile.component';
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
  // Admin routes (will be expanded later)
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'users', component: DashboardComponent } // Placeholder for user management
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
