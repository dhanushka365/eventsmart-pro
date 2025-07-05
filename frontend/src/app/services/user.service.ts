import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService, User } from './auth.service';
import { environment } from '../../environments/environment';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UsersResponse {
  users: User[];
  totalUsers: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl + '/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProfile(): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<User>(`${this.baseUrl}/profile`, { headers })
      .pipe(catchError(this.handleError));
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<User>(`${this.baseUrl}/profile`, request, { headers })
      .pipe(catchError(this.handleError));
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/change-password`, request, { headers })
      .pipe(catchError(this.handleError));
  }

  // Admin only methods
  getAllUsers(page: number = 1, pageSize: number = 10): Observable<UsersResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<UsersResponse>(`${this.baseUrl}/users?page=${page}&pageSize=${pageSize}`, { headers })
      .pipe(catchError(this.handleError));
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/users/${userId}/status`, isActive, { headers })
      .pipe(catchError(this.handleError));
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
