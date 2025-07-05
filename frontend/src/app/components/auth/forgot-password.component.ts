import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h2>Forgot Password?</h2>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form" *ngIf="!emailSent">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
              placeholder="Enter your email address"
            >
            <div class="error-message" *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
              <small *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</small>
              <small *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Please enter a valid email</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="forgotPasswordForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <div class="success-card" *ngIf="emailSent">
          <div class="success-icon">✓</div>
          <h3>Check Your Email</h3>
          <p>We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.</p>
          <p class="note">Didn't receive the email? Check your spam folder or <a href="#" (click)="resendEmail()">try again</a>.</p>
        </div>

        <div class="forgot-password-footer">
          <p><a routerLink="/login">← Back to Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-password-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .forgot-password-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .forgot-password-header h2 {
      color: #333;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .forgot-password-header p {
      color: #666;
      margin: 0;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 24px;
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

    .success-card {
      text-align: center;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: #27ae60;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      margin: 0 auto 20px;
    }

    .success-card h3 {
      color: #333;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .success-card p {
      color: #666;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .success-card .note {
      font-size: 14px;
      color: #888;
    }

    .success-card a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .success-card a:hover {
      text-decoration: underline;
    }

    .forgot-password-footer {
      text-align: center;
      margin-top: 24px;
    }

    .forgot-password-footer p {
      margin: 0;
      color: #666;
    }

    .forgot-password-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-password-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';
  emailSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const email = this.forgotPasswordForm.get('email')?.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.emailSent = true;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to send reset email. Please try again.';
        }
      });
    }
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }
}
