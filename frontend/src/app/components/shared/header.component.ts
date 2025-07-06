import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <nav class="navbar">
        <!-- Logo and Brand -->
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <div class="logo">
              <span class="logo-icon">🎯</span>
              <span class="brand-text">EventSmart Pro</span>
            </div>
          </a>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" [class.active]="isMobileMenuOpen">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Navigation Links -->
        <div class="navbar-nav" [class.mobile-open]="isMobileMenuOpen">
          <!-- Public Navigation -->
          <div class="nav-section" *ngIf="!(currentUser$ | async)">
            <a routerLink="/events" routerLinkActive="active" class="nav-link">
              <i class="icon">📅</i>
              <span>Events</span>
            </a>
            <a routerLink="/login" routerLinkActive="active" class="nav-link login-btn">
              <i class="icon">👤</i>
              <span>Login</span>
            </a>
            <a routerLink="/register" routerLinkActive="active" class="nav-link register-btn">
              <i class="icon">✨</i>
              <span>Sign Up</span>
            </a>
          </div>

          <!-- Authenticated Navigation -->
          <div class="nav-section" *ngIf="currentUser$ | async as user">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <i class="icon">🏠</i>
              <span>Dashboard</span>
            </a>
            <a routerLink="/events" routerLinkActive="active" class="nav-link">
              <i class="icon">📅</i>
              <span>Events</span>
            </a>
            <a routerLink="/my-events" routerLinkActive="active" class="nav-link">
              <i class="icon">📋</i>
              <span>My Events</span>
            </a>
            
            <!-- Event Organizer/Admin specific -->
            <a 
              *ngIf="isOrganizerOrAdmin(user)" 
              routerLink="/events/create" 
              routerLinkActive="active" 
              class="nav-link create-event-btn">
              <i class="icon">➕</i>
              <span>Create Event</span>
            </a>

            <!-- Admin specific -->
            <a 
              *ngIf="user.role === UserRole.Admin" 
              routerLink="/admin" 
              routerLinkActive="active" 
              class="nav-link admin-link">
              <i class="icon">⚙️</i>
              <span>Admin</span>
            </a>

            <!-- User Profile Dropdown -->
            <div class="user-dropdown" [class.open]="isUserDropdownOpen">
              <button class="user-profile-btn" (click)="toggleUserDropdown()">
                <div class="user-avatar">
                  <img 
                    *ngIf="user.profileImageUrl" 
                    [src]="user.profileImageUrl" 
                    [alt]="user.firstName + ' ' + user.lastName"
                    class="avatar-img">
                  <span *ngIf="!user.profileImageUrl" class="avatar-initials">
                    {{ getInitials(user) }}
                  </span>
                </div>
                <span class="user-name">{{ user.firstName }}</span>
                <i class="dropdown-arrow">▼</i>
              </button>

              <div class="dropdown-menu" *ngIf="isUserDropdownOpen">
                <div class="user-info">
                  <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-role">{{ getRoleDisplayName(user.role) }}</div>
                </div>
                <hr class="dropdown-divider">
                <a routerLink="/profile" class="dropdown-item" (click)="closeDropdowns()">
                  <i class="icon">👤</i>
                  <span>Profile</span>
                </a>
                <a routerLink="/recommendations" class="dropdown-item" (click)="closeDropdowns()">
                  <i class="icon">⭐</i>
                  <span>Recommendations</span>
                </a>
                <hr class="dropdown-divider">
                <button class="dropdown-item logout-btn" (click)="logout()">
                  <i class="icon">🚪</i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .main-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      max-width: 1200px;
      margin: 0 auto;
      height: 70px;
    }

    /* Brand */
    .navbar-brand {
      flex-shrink: 0;
    }

    .brand-link {
      text-decoration: none;
      color: white;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #ffffff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      gap: 4px;
    }

    .hamburger-line {
      width: 25px;
      height: 3px;
      background: white;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    /* Navigation */
    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 25px;
      transition: all 0.3s ease;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-link:hover {
      color: white;
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .nav-link .icon {
      font-size: 1.1rem;
    }

    /* Special Button Styles */
    .login-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .register-btn {
      background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
      color: white;
      font-weight: 600;
    }

    .register-btn:hover {
      background: linear-gradient(45deg, #ff5252, #ff7979);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    .create-event-btn {
      background: linear-gradient(45deg, #4ecdc4, #44a08d);
      color: white;
      font-weight: 600;
    }

    .create-event-btn:hover {
      background: linear-gradient(45deg, #45b7aa, #3d8b7a);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(78, 205, 196, 0.4);
    }

    .admin-link {
      background: linear-gradient(45deg, #ffeaa7, #fdcb6e);
      color: #2d3436;
      font-weight: 600;
    }

    .admin-link:hover {
      background: linear-gradient(45deg, #fdcb6e, #e17055);
      color: white;
    }

    /* User Dropdown */
    .user-dropdown {
      position: relative;
    }

    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .user-profile-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .user-name {
      font-weight: 500;
    }

    .dropdown-arrow {
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }

    .user-dropdown.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      padding: 1rem 0;
      min-width: 250px;
      margin-top: 8px;
      z-index: 1000;
    }

    .user-info {
      padding: 0 1rem 0.5rem;
    }

    .user-info .user-name {
      font-weight: 600;
      color: #2d3436;
      font-size: 1.1rem;
    }

    .user-info .user-email {
      color: #636e72;
      font-size: 0.9rem;
      margin-top: 2px;
    }

    .user-info .user-role {
      color: #00b894;
      font-size: 0.8rem;
      font-weight: 500;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dropdown-divider {
      border: none;
      height: 1px;
      background: #ddd;
      margin: 0.5rem 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 1rem;
      color: #2d3436;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    .logout-btn {
      color: #e74c3c;
    }

    .logout-btn:hover {
      background: #fff5f5;
      color: #c0392b;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .navbar {
        padding: 0 1rem;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .navbar-nav {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-direction: column;
        padding: 1rem;
        gap: 0.5rem;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .navbar-nav.mobile-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-section {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
      }

      .nav-link {
        width: 100%;
        justify-content: center;
        padding: 16px;
      }

      .user-profile-btn {
        width: 100%;
        justify-content: center;
      }

      .dropdown-menu {
        position: static;
        box-shadow: none;
        background: rgba(255, 255, 255, 0.95);
        margin-top: 0.5rem;
        border-radius: 8px;
      }

      .brand-text {
        font-size: 1.3rem;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        height: 60px;
      }

      .brand-text {
        font-size: 1.1rem;
      }

      .logo-icon {
        font-size: 1.5rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        this.isUserDropdownOpen = false;
      }
      if (!target.closest('.navbar-nav') && !target.closest('.mobile-menu-toggle')) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeDropdowns() {
    this.isUserDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  isOrganizerOrAdmin(user: User): boolean {
    return user.role === UserRole.Admin || user.role === UserRole.EventOrganizer;
  }

  getInitials(user: User): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'Administrator';
      case UserRole.EventOrganizer: return 'Event Organizer';
      case UserRole.Vendor: return 'Vendor';
      case UserRole.Attendee: return 'Attendee';
      default: return 'User';
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.closeDropdowns();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails on server, clear local storage and redirect
        this.closeDropdowns();
        this.router.navigate(['/login']);
      }
    });
  }
}
