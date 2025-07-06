import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your EventSmart Pro account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="Enter your email"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <small *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</small>
              <small *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="Enter your password"
            >
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <small *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="google-signin">
          <div #googleButton class="google-button"></div>
        </div>

        <div class="login-footer">
          <p><a routerLink="/forgot-password">Forgot your password?</a></p>
          <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #333;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .login-header p {
      color: #666;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.invalid {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      margin-top: 6px;
    }

    .error-message small {
      font-size: 14px;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      margin: 24px 0;
      text-align: center;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e5e9;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #666;
    }

    .google-signin {
      margin-bottom: 24px;
    }

    .google-button {
      width: 100%;
    }

    .login-footer {
      text-align: center;
    }

    .login-footer p {
      margin: 8px 0;
      color: #666;
    }

    .login-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButton') googleButton!: ElementRef;
  
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private layoutService: LayoutService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Hide header and footer for auth pages
    this.layoutService.showAuthLayout();
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Initialize Google Auth
    this.googleAuthService.initialize().catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button
    setTimeout(() => {
      try {
        this.googleAuthService.renderButton(this.googleButton.nativeElement, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with'
          // Removed width: '100%' as it's not supported by Google Sign-In
        });
      } catch (error) {
        console.error('Failed to render Google button:', error);
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const loginData = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          
          // Handle different types of errors
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Invalid login credentials.';
          } else if (error.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error occurred. Please try again later.';
          } else {
            this.errorMessage = error.message || 'Login failed. Please try again.';
          }
        }
      });
    }
  }

  onGoogleSignIn(): void {
    this.loading = true;
    this.errorMessage = '';

    this.googleAuthService.signIn()
      .then(googleToken => {
        return this.authService.googleAuth(googleToken).toPromise();
      })
      .then(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      })
      .catch(error => {
        this.loading = false;
        this.errorMessage = error.message || 'Google sign-in failed. Please try again.';
      });
  }

  ngOnDestroy(): void {
    // Restore main layout when leaving login page
    this.layoutService.showMainLayout();
  }
}
