import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import jwt_decode from 'jwt-decode';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  isGoogleAuth: boolean;
}

export enum UserRole {
  Admin = 0,
  EventOrganizer = 1,
  Vendor = 2,
  Attendee = 3
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

export interface GoogleAuthRequest {
  googleToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't access localStorage on server
    }

    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(token);
      } catch (error) {
        this.clearAuth();
      }
    } else {
      this.clearAuth();
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  googleAuth(googleToken: string): Observable<AuthResponse> {
    const request: GoogleAuthRequest = { googleToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/google-auth`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    const refreshToken = isPlatformBrowser(this.platformId) ? localStorage.getItem('refreshToken') : null;

    if (!token || !refreshToken) {
      this.logout();
      return throwError(() => new Error('No tokens available'));
    }

    const request = { token, refreshToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    const request = { token, password, confirmPassword };
    return this.http.post(`${this.baseUrl}/reset-password`, request)
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => this.clearAuth()),
        catchError(() => {
          this.clearAuth();
          return throwError(() => new Error('Logout failed'));
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.Admin);
  }

  isEventOrganizer(): boolean {
    return this.hasRole(UserRole.EventOrganizer);
  }

  isVendor(): boolean {
    return this.hasRole(UserRole.Vendor);
  }

  isAttendee(): boolean {
    return this.hasRole(UserRole.Attendee);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't access localStorage on server
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.currentUserSubject.next(response.user);
    this.tokenSubject.next(response.token);
  }

  private clearAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't access localStorage on server
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
