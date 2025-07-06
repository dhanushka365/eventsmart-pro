import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface AnalyticsData {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  revenue: number;
  activeEvents: number;
  newUsersThisMonth: number;
  popularCategories: { name: string; count: number; percentage: number }[];
  recentActivity: { type: string; description: string; timestamp: string }[];
  monthlyData: { month: string; events: number; registrations: number; revenue: number }[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-2">Monitor platform performance and user engagement</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading" class="space-y-8">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Events</p>
                <p class="text-2xl font-semibold text-gray-900">{{data.totalEvents | number}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Users</p>
                <p class="text-2xl font-semibold text-gray-900">{{data.totalUsers | number}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Registrations</p>
                <p class="text-2xl font-semibold text-gray-900">{{data.totalRegistrations | number}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Revenue</p>
                <p class="text-2xl font-semibold text-gray-900">\${{data.revenue | number:'1.0-0'}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Events</p>
                <p class="text-2xl font-semibold text-gray-900">{{data.activeEvents | number}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">New Users</p>
                <p class="text-2xl font-semibold text-gray-900">{{data.newUsersThisMonth | number}}</p>
                <p class="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Monthly Trends -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
            <div class="space-y-4">
              <div *ngFor="let month of data.monthlyData" class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-900">{{month.month}}</span>
                    <span class="text-sm text-gray-600">{{month.events}} events</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" 
                         [style.width.%]="(month.events / getMaxEvents() * 100)"></div>
                  </div>
                </div>
                <div class="ml-4 text-right">
                  <div class="text-sm font-medium text-gray-900">\${{month.revenue | number:'1.0-0'}}</div>
                  <div class="text-xs text-gray-500">{{month.registrations}} reg.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Categories -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Popular Categories</h3>
            <div class="space-y-4">
              <div *ngFor="let category of data.popularCategories" class="flex items-center">
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-900">{{category.name}}</span>
                    <span class="text-sm text-gray-600">{{category.count}} events</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" 
                         [style.width.%]="category.percentage"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div class="space-y-4">
            <div *ngFor="let activity of data.recentActivity" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': activity.type === 'registration',
                            'bg-blue-100 text-blue-800': activity.type === 'event',
                            'bg-purple-100 text-purple-800': activity.type === 'user',
                            'bg-yellow-100 text-yellow-800': activity.type === 'payment'
                          }">
                      {{activity.type | titlecase}}
                    </span>
                    <p class="text-sm text-gray-900 mt-1">{{activity.description}}</p>
                  </div>
                  <span class="text-xs text-gray-500">{{formatTime(activity.timestamp)}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  loading = true;
  
  data: AnalyticsData = {
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    revenue: 0,
    activeEvents: 0,
    newUsersThisMonth: 0,
    popularCategories: [],
    recentActivity: [],
    monthlyData: []
  };

  constructor() {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.data = {
        totalEvents: 1247,
        totalUsers: 8534,
        totalRegistrations: 15672,
        revenue: 234567,
        activeEvents: 89,
        newUsersThisMonth: 234,
        popularCategories: [
          { name: 'Technology', count: 45, percentage: 85 },
          { name: 'Business', count: 38, percentage: 72 },
          { name: 'Entertainment', count: 32, percentage: 60 },
          { name: 'Sports', count: 28, percentage: 53 },
          { name: 'Education', count: 23, percentage: 43 }
        ],
        recentActivity: [
          {
            type: 'registration',
            description: 'John Doe registered for "Tech Conference 2025"',
            timestamp: '2025-07-06T08:30:00Z'
          },
          {
            type: 'event',
            description: 'New event "AI Workshop" was created by Jane Smith',
            timestamp: '2025-07-06T08:15:00Z'
          },
          {
            type: 'payment',
            description: 'Payment of $299 received for event registration',
            timestamp: '2025-07-06T08:00:00Z'
          },
          {
            type: 'user',
            description: 'New user Sarah Johnson registered',
            timestamp: '2025-07-06T07:45:00Z'
          },
          {
            type: 'registration',
            description: 'Mike Wilson registered for "Startup Pitch Night"',
            timestamp: '2025-07-06T07:30:00Z'
          }
        ],
        monthlyData: [
          { month: 'January', events: 95, registrations: 1240, revenue: 18750 },
          { month: 'February', events: 87, registrations: 1156, revenue: 17340 },
          { month: 'March', events: 102, registrations: 1389, revenue: 20835 },
          { month: 'April', events: 78, registrations: 1067, revenue: 16005 },
          { month: 'May', events: 115, registrations: 1523, revenue: 22845 },
          { month: 'June', events: 98, registrations: 1298, revenue: 19470 }
        ]
      };
      
      this.loading = false;
    }, 1000);
  }

  getMaxEvents(): number {
    return Math.max(...this.data.monthlyData.map(m => m.events));
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }
}
