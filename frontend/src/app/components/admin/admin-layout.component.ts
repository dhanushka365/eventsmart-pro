import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Admin Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            </div>
            
            <nav class="flex space-x-8">
              <a routerLink="/admin/analytics" 
                 routerLinkActive="text-blue-600 border-blue-600" 
                 class="border-b-2 border-transparent hover:border-gray-300 pb-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Analytics
              </a>
              <a routerLink="/admin/users" 
                 routerLinkActive="text-blue-600 border-blue-600" 
                 class="border-b-2 border-transparent hover:border-gray-300 pb-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Users
              </a>
              <a routerLink="/admin/settings" 
                 routerLinkActive="text-blue-600 border-blue-600" 
                 class="border-b-2 border-transparent hover:border-gray-300 pb-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Settings
              </a>
              <button (click)="goToDashboard()" 
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Exit Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      <!-- Admin Content -->
      <main class="py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
