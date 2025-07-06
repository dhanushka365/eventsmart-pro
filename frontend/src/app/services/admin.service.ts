import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  registrationDate: string;
  lastLoginDate?: string;
  profilePictureUrl?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  usersByRole: { role: string; count: number }[];
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  maxEventDuration: number;
  maxAttendeesPerEvent: number;
  enableGoogleAuth: boolean;
  enableEmailNotifications: boolean;
  enableSms: boolean;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // User Management
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/admin/users/stats`);
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/users/${userId}/status`, { isActive });
  }

  updateUserRole(userId: number, role: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/users/${userId}/role`, { role });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}`);
  }

  // Settings Management
  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${this.apiUrl}/admin/settings`);
  }

  updateSettings(settings: SystemSettings): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.apiUrl}/admin/settings`, settings);
  }

  // Analytics
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/analytics`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-stats`);
  }
}
