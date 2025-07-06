import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../services/auth.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>Create Account</h2>
          <p>Join EventSmart Pro today</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="form-control"
                [class.invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                placeholder="Enter your first name"
              >
              <div class="error-message" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                <small *ngIf="registerForm.get('firstName')?.errors?.['required']">First name is required</small>
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="form-control"
                [class.invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                placeholder="Enter your last name"
              >
              <div class="error-message" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                <small *ngIf="registerForm.get('lastName')?.errors?.['required']">Last name is required</small>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="Enter your email"
            >
            <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <small *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</small>
              <small *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</small>
            </div>
          </div>

          <div class="form-group">
            <label for="role">Account Type</label>
            <select
              id="role"
              formControlName="role"
              class="form-control"
              [class.invalid]="registerForm.get('role')?.invalid && registerForm.get('role')?.touched"
            >
              <option value="">Select account type</option>
              <option [value]="UserRole.Attendee">Attendee</option>
              <option [value]="UserRole.Vendor">Vendor</option>
              <option [value]="UserRole.EventOrganizer">Event Organizer</option>
            </select>
            <div class="error-message" *ngIf="registerForm.get('role')?.invalid && registerForm.get('role')?.touched">
              <small *ngIf="registerForm.get('role')?.errors?.['required']">Please select an account type</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              placeholder="Enter your password"
            >
            <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <small *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</small>
              <small *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</small>
              <small *ngIf="registerForm.get('password')?.errors?.['pattern']">Password must contain uppercase, lowercase, number and special character</small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-control"
              [class.invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              placeholder="Confirm your password"
            >
            <div class="error-message" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <small *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</small>
            </div>
            <div class="error-message" *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched">
              <small>Passwords do not match</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>
        </form>

        <div class="register-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 500px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .register-header h2 {
      color: #333;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .register-header p {
      color: #666;
      margin: 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row .form-group {
      flex: 1;
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

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 12px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 40px;
    }

    .error-message {
      color: #e74c3c;
      margin-top: 6px;
    }

    .error-message small {
      font-size: 14px;
    }

    .success-message {
      color: #27ae60;
      margin-top: 6px;
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

    .register-footer {
      text-align: center;
      margin-top: 24px;
    }

    .register-footer p {
      margin: 0;
      color: #666;
    }

    .register-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .register-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  UserRole = UserRole;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerData = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          
          // Handle different types of errors
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Invalid registration data. Please check your inputs.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error occurred. Please try again later.';
          } else {
            this.errorMessage = error.message || 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
