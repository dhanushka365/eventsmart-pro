import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User, UserRole } from './services/auth.service';
import { EventService, Event } from './services/event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, {{user?.firstName}}!</h1>
          <p class="user-role">{{getRoleDisplayName(user?.role)}}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="goToProfile()">
            Edit Profile
          </button>
          <button class="btn btn-danger" (click)="logout()">
            Logout
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>Total Users</h3>
              <p class="stat-number">1,247</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎉</div>
            <div class="stat-info">
              <h3>Active Events</h3>
              <p class="stat-number">23</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏪</div>
            <div class="stat-info">
              <h3>Vendors</h3>
              <p class="stat-number">89</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>Revenue</h3>
              <p class="stat-number">$45,678</p>
            </div>
          </div>
        </div>

        <!-- Role-based content -->
        <div class="role-content">
          <!-- Admin Content -->
          <div *ngIf="isAdmin()" class="admin-section">
            <h2>Administrator Dashboard</h2>
            <div class="action-cards">
              <div class="action-card">
                <h3>User Management</h3>
                <p>Manage user accounts, roles, and permissions</p>
                <button class="btn btn-primary" (click)="goToUserManagement()">
                  Manage Users
                </button>
              </div>
              <div class="action-card">
                <h3>System Settings</h3>
                <p>Configure system-wide settings and preferences</p>
                <button class="btn btn-primary" (click)="goToSettings()">
                  Settings
                </button>
              </div>
              <div class="action-card">
                <h3>Analytics</h3>
                <p>View detailed analytics and reports</p>
                <button class="btn btn-primary" (click)="goToAnalytics()">
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          <!-- Event Organizer Content -->
          <div *ngIf="isEventOrganizer()" class="organizer-section">
            <h2>Event Organizer Dashboard</h2>
            <div class="action-cards">
              <div class="action-card">
                <h3>Create Event</h3>
                <p>Plan and create new events</p>
                <button class="btn btn-primary" routerLink="/events/create">
                  Create Event
                </button>
              </div>
              <div class="action-card">
                <h3>My Events</h3>
                <p>Manage your existing events</p>
                <button class="btn btn-primary" (click)="goToMyEvents()">
                  View Events
                </button>
              </div>
              <div class="action-card">
                <h3>Vendor Management</h3>
                <p>Manage vendors for your events</p>
                <button class="btn btn-primary">
                  Manage Vendors
                </button>
              </div>
            </div>
          </div>

          <!-- Vendor Content -->
          <div *ngIf="isVendor()" class="vendor-section">
            <h2>Vendor Dashboard</h2>
            <div class="action-cards">
              <div class="action-card">
                <h3>My Services</h3>
                <p>Manage your service offerings</p>
                <button class="btn btn-primary">
                  Manage Services
                </button>
              </div>
              <div class="action-card">
                <h3>Event Opportunities</h3>
                <p>Browse available event opportunities</p>
                <button class="btn btn-primary">
                  Browse Events
                </button>
              </div>
              <div class="action-card">
                <h3>Booking Requests</h3>
                <p>Manage incoming booking requests</p>
                <button class="btn btn-primary">
                  View Requests
                </button>
              </div>
            </div>
          </div>

          <!-- Attendee Content -->
          <div *ngIf="isAttendee()" class="attendee-section">
            <h2>Welcome to EventSmart Pro</h2>
            <div class="action-cards">
              <div class="action-card">
                <h3>Browse Events</h3>
                <p>Discover exciting events happening near you</p>
                <button class="btn btn-primary" routerLink="/events">
                  Browse Events
                </button>
              </div>
              <div class="action-card">
                <h3>My Events</h3>
                <p>View and manage your registered events</p>
                <button class="btn btn-primary" (click)="goToMyEvents()">
                  My Events
                </button>
              </div>
              <div class="action-card">
                <h3>Recommendations</h3>
                <p>AI-powered event recommendations for you</p>
                <button class="btn btn-primary" (click)="goToRecommendations()">
                  Get Recommendations
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🎉</div>
              <div class="activity-content">
                <p><strong>New event created:</strong> Summer Music Festival</p>
                <span class="activity-time">2 hours ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">👤</div>
              <div class="activity-content">
                <p><strong>New user registered:</strong> John Smith</p>
                <span class="activity-time">4 hours ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">🏪</div>
              <div class="activity-content">
                <p><strong>Vendor approved:</strong> Premium Catering Co.</p>
                <span class="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .welcome-section h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .user-role {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .stat-info h3 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .stat-number {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .role-content {
      margin-bottom: 32px;
    }

    .role-content h2 {
      margin-bottom: 24px;
      color: #333;
      font-weight: 600;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
    }

    .action-card h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-weight: 600;
    }

    .action-card p {
      margin: 0 0 20px 0;
      color: #666;
      line-height: 1.5;
    }

    .recent-activity {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .recent-activity h2 {
      margin: 0 0 24px 0;
      color: #333;
      font-weight: 600;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .activity-icon {
      font-size: 24px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 8px;
    }

    .activity-content p {
      margin: 0 0 4px 0;
      color: #333;
    }

    .activity-time {
      font-size: 12px;
      color: #666;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn-outline {
      background: transparent;
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
    }

    .btn-outline:hover {
      background: rgba(255,255,255,0.1);
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  recentEvents: Event[] = [];
  statsLoading = true;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadRecentEvents();
  }

  loadRecentEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.recentEvents = events.slice(0, 5); // Get first 5 events
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.statsLoading = false;
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToUserManagement(): void {
    this.router.navigate(['/admin/users']);
  }

  goToSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  goToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  goToMyEvents(): void {
    this.router.navigate(['/my-events']);
  }

  goToRecommendations(): void {
    this.router.navigate(['/recommendations']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails on server, clear local data
        this.router.navigate(['/login']);
      }
    });
  }

  getRoleDisplayName(role: UserRole | undefined): string {
    if (!role && role !== 0) return 'Unknown';
    
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isEventOrganizer(): boolean {
    return this.authService.isEventOrganizer();
  }

  isVendor(): boolean {
    return this.authService.isVendor();
  }

  isAttendee(): boolean {
    return this.authService.isAttendee();
  }
}
