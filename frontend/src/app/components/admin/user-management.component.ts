import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

interface User {
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

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
          <p class="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        <div class="flex space-x-3">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterUsers()"
            placeholder="Search users..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <select
            [(ngModel)]="roleFilter"
            (ngModelChange)="filterUsers()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="EventOrganizer">Event Organizer</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{totalUsers}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{activeUsers}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Organizers</p>
              <p class="text-2xl font-semibold text-gray-900">{{organizers}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Inactive Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{inactiveUsers}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Users Table -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Users ({{filteredUsers.length}})</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img *ngIf="user.profilePictureUrl" 
                           [src]="user.profilePictureUrl" 
                           [alt]="user.firstName + ' ' + user.lastName"
                           class="h-10 w-10 rounded-full">
                      <div *ngIf="!user.profilePictureUrl" 
                           class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{user.firstName.charAt(0)}}{{user.lastName.charAt(0)}}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{user.firstName}} {{user.lastName}}
                      </div>
                      <div class="text-sm text-gray-500">{{user.email}}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-red-100 text-red-800': user.role === 'Admin',
                          'bg-blue-100 text-blue-800': user.role === 'EventOrganizer',
                          'bg-green-100 text-green-800': user.role === 'User'
                        }">
                    {{user.role}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': user.isActive,
                          'bg-red-100 text-red-800': !user.isActive
                        }">
                    {{user.isActive ? 'Active' : 'Inactive'}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{formatDate(user.registrationDate)}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button (click)="editUser(user)"
                            class="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button (click)="toggleUserStatus(user)"
                            [class]="user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                      {{user.isActive ? 'Deactivate' : 'Activate'}}
                    </button>
                    <button (click)="deleteUser(user)"
                            class="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  searchTerm = '';
  roleFilter = '';

  // Stats
  totalUsers = 0;
  activeUsers = 0;
  organizers = 0;
  inactiveUsers = 0;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    // Mock data for now - replace with actual service call
    setTimeout(() => {
      this.users = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'Admin',
          isActive: true,
          registrationDate: '2024-01-15T10:30:00Z',
          lastLoginDate: '2024-07-06T08:15:00Z'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          role: 'EventOrganizer',
          isActive: true,
          registrationDate: '2024-02-20T14:45:00Z',
          lastLoginDate: '2024-07-05T16:22:00Z'
        },
        {
          id: 3,
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          role: 'User',
          isActive: false,
          registrationDate: '2024-03-10T09:20:00Z',
          lastLoginDate: '2024-06-15T11:30:00Z'
        }
      ];
      
      this.filteredUsers = [...this.users];
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.isActive).length;
    this.organizers = this.users.filter(u => u.role === 'EventOrganizer').length;
    this.inactiveUsers = this.users.filter(u => !u.isActive).length;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  editUser(user: User) {
    // Implement edit user functionality
    console.log('Edit user:', user);
    alert('Edit user functionality coming soon!');
  }

  toggleUserStatus(user: User) {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) {
      user.isActive = !user.isActive;
      this.calculateStats();
      // TODO: Call API to update user status
      console.log(`User ${user.id} ${action}d`);
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.filterUsers();
      this.calculateStats();
      // TODO: Call API to delete user
      console.log('User deleted:', user.id);
    }
  }
}
