import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

// Password match validator
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  
  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h2>My Profile</h2>
        <p>Manage your account information and settings</p>
      </div>

      <div class="profile-content">
        <!-- Profile Information Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Profile Information</h3>
            <button 
              class="btn btn-outline" 
              (click)="toggleEditMode()"
              *ngIf="!editMode"
            >
              Edit Profile
            </button>
          </div>

          <div class="profile-info" *ngIf="!editMode && user">
            <div class="info-item">
              <label>Full Name</label>
              <span>{{user.firstName}} {{user.lastName}}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{user.email}}</span>
            </div>
            <div class="info-item">
              <label>Role</label>
              <span class="role-badge" [class]="'role-' + user.role">{{getRoleDisplayName(user.role)}}</span>
            </div>
            <div class="info-item">
              <label>Account Type</label>
              <span>{{user.isGoogleAuth ? 'Google Account' : 'Email Account'}}</span>
            </div>
            <div class="info-item">
              <label>Member Since</label>
              <span>{{user.createdAt | date:'mediumDate'}}</span>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" *ngIf="editMode" class="edit-form">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="form-control"
                [class.invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
              >
              <div class="error-message" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                <small *ngIf="profileForm.get('firstName')?.errors?.['required']">First name is required</small>
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="form-control"
                [class.invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
              >
              <div class="error-message" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                <small *ngIf="profileForm.get('lastName')?.errors?.['required']">Last name is required</small>
              </div>
            </div>

            <div class="form-group">
              <label for="profileImageUrl">Profile Image URL (Optional)</label>
              <input
                type="url"
                id="profileImageUrl"
                formControlName="profileImageUrl"
                class="form-control"
                placeholder="https://example.com/image.jpg"
              >
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancelEdit()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || updating">
                <span *ngIf="updating" class="spinner"></span>
                {{ updating ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="success-message" *ngIf="successMessage">
              {{ successMessage }}
            </div>
          </form>
        </div>

        <!-- Change Password Card -->
        <div class="profile-card" *ngIf="user && !user.isGoogleAuth">
          <div class="card-header">
            <h3>Change Password</h3>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="password-form">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                class="form-control"
                [class.invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched"
              >
              <div class="error-message" *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                <small *ngIf="passwordForm.get('currentPassword')?.errors?.['required']">Current password is required</small>
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                class="form-control"
                [class.invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
              >
              <div class="error-message" *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                <small *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</small>
                <small *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters</small>
                <small *ngIf="passwordForm.get('newPassword')?.errors?.['pattern']">Password must contain uppercase, lowercase, number and special character</small>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-control"
                [class.invalid]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
              >
              <div class="error-message" *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
                <small *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your new password</small>
              </div>
              <div class="error-message" *ngIf="passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched">
                <small>Passwords do not match</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || changingPassword">
                <span *ngIf="changingPassword" class="spinner"></span>
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>

            <div class="error-message" *ngIf="passwordErrorMessage">
              {{ passwordErrorMessage }}
            </div>

            <div class="success-message" *ngIf="passwordSuccessMessage">
              {{ passwordSuccessMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .profile-header {
      margin-bottom: 32px;
    }

    .profile-header h2 {
      color: #333;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .profile-header p {
      color: #666;
      margin: 0;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 24px;
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e1e5e9;
    }

    .card-header h3 {
      margin: 0;
      color: #333;
      font-weight: 600;
    }

    .profile-info {
      display: grid;
      gap: 20px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item label {
      font-weight: 500;
      color: #555;
      min-width: 120px;
    }

    .info-item span {
      color: #333;
      flex: 1;
      text-align: right;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-0 { background: #e8f5e8; color: #2d5016; } /* Admin */
    .role-1 { background: #e3f2fd; color: #1565c0; } /* EventOrganizer */
    .role-2 { background: #fff3e0; color: #ef6c00; } /* Vendor */
    .role-3 { background: #f3e5f5; color: #7b1fa2; } /* Attendee */

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

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
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

    .error-message {
      color: #e74c3c;
      margin-top: 8px;
      font-size: 14px;
    }

    .success-message {
      color: #27ae60;
      margin-top: 8px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .info-item span {
        text-align: left;
      }

      .form-actions {
        flex-direction: column;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  editMode = false;
  updating = false;
  changingPassword = false;
  errorMessage = '';
  successMessage = '';
  passwordErrorMessage = '';
  passwordSuccessMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      profileImageUrl: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        profileImageUrl: this.user.profileImageUrl || ''
      });
    }
  }

  toggleEditMode(): void {
    this.editMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadUserProfile(); // Reset form values
    this.errorMessage = '';
    this.successMessage = '';
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateData = this.profileForm.value;
      
      this.userService.updateProfile(updateData).subscribe({
        next: (updatedUser) => {
          this.updating = false;
          this.editMode = false;
          this.user = updatedUser;
          this.successMessage = 'Profile updated successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.updating = false;
          this.errorMessage = error.message || 'Failed to update profile. Please try again.';
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.changingPassword = true;
      this.passwordErrorMessage = '';
      this.passwordSuccessMessage = '';

      const passwordData = this.passwordForm.value;
      
      this.userService.changePassword(passwordData).subscribe({
        next: (response) => {
          this.changingPassword = false;
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.passwordSuccessMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.changingPassword = false;
          this.passwordErrorMessage = error.message || 'Failed to change password. Please try again.';
        }
      });
    }
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return 'Administrator';
      case UserRole.EventOrganizer:
        return 'Event Organizer';
      case UserRole.Vendor:
        return 'Vendor';
      case UserRole.Attendee:
        return 'Attendee';
      default:
        return 'Unknown';
    }
  }
}
