import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  defaultEventVisibility: string;
  maxEventDuration: number;
  maxAttendeesPerEvent: number;
  enableGoogleAuth: boolean;
  googleClientId: string;
  enableEmailNotifications: boolean;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  enableSms: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  maintenanceMode: boolean;
  cacheTimeout: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">System Settings</h1>
        <p class="text-gray-600 mt-2">Manage your event platform configuration</p>
      </div>

      <div class="space-y-8">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                [(ngModel)]="settings.siteName"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input
                type="email"
                [(ngModel)]="settings.adminEmail"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
              <textarea
                [(ngModel)]="settings.siteDescription"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="allowUserRegistration"
                [(ngModel)]="settings.allowUserRegistration"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="allowUserRegistration" class="ml-2 block text-sm text-gray-900">
                Allow user registration
              </label>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                [(ngModel)]="settings.requireEmailVerification"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="requireEmailVerification" class="ml-2 block text-sm text-gray-900">
                Require email verification
              </label>
            </div>
          </div>
        </div>

        <!-- Authentication Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Authentication Settings</h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Enable Google OAuth</h3>
                <p class="text-sm text-gray-500">Allow users to sign in with Google</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.enableGoogleAuth" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div *ngIf="settings.enableGoogleAuth">
              <label class="block text-sm font-medium text-gray-700 mb-2">Google Client ID</label>
              <input
                type="text"
                [(ngModel)]="settings.googleClientId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Google OAuth Client ID">
            </div>
          </div>
        </div>

        <!-- Email Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Email Settings</h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Enable Email Notifications</h3>
                <p class="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.enableEmailNotifications" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div *ngIf="settings.enableEmailNotifications" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                <input
                  type="text"
                  [(ngModel)]="settings.smtpServer"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="number"
                  [(ngModel)]="settings.smtpPort"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                <input
                  type="text"
                  [(ngModel)]="settings.smtpUsername"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                <input
                  type="password"
                  [(ngModel)]="settings.smtpPassword"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>
          </div>
        </div>

        <!-- SMS Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">SMS Settings</h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Enable SMS Notifications</h3>
                <p class="text-sm text-gray-500">Send SMS notifications via Twilio</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.enableSms" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div *ngIf="settings.enableSms" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Twilio Account SID</label>
                <input
                  type="text"
                  [(ngModel)]="settings.twilioAccountSid"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Twilio Auth Token</label>
                <input
                  type="password"
                  [(ngModel)]="settings.twilioAuthToken"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                <p class="text-sm text-gray-500">Put the system in maintenance mode</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.maintenanceMode" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cache Timeout (minutes)</label>
              <input
                type="number"
                [(ngModel)]="settings.cacheTimeout"
                min="1"
                max="1440"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            (click)="resetSettings()"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Reset to Defaults
          </button>
          
          <button
            type="button"
            (click)="saveSettings()"
            [disabled]="saving"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors">
            <span *ngIf="!saving">Save Settings</span>
            <span *ngIf="saving">Saving...</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  saving = false;
  
  settings: SystemSettings = {
    siteName: 'EventSmart Pro',
    siteDescription: 'Professional event management platform',
    adminEmail: 'admin@eventsmart.com',
    allowUserRegistration: true,
    requireEmailVerification: true,
    defaultEventVisibility: 'public',
    maxEventDuration: 24,
    maxAttendeesPerEvent: 1000,
    enableGoogleAuth: true,
    googleClientId: '',
    enableEmailNotifications: true,
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    enableSms: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    maintenanceMode: false,
    cacheTimeout: 30
  };

  constructor() {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Load settings from backend
    // For now, using default values
    console.log('Loading settings...');
  }

  saveSettings() {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Settings saved:', this.settings);
      alert('Settings saved successfully!');
      this.saving = false;
    }, 1000);
  }

  resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      this.settings = {
        siteName: 'EventSmart Pro',
        siteDescription: 'Professional event management platform',
        adminEmail: 'admin@eventsmart.com',
        allowUserRegistration: true,
        requireEmailVerification: true,
        defaultEventVisibility: 'public',
        maxEventDuration: 24,
        maxAttendeesPerEvent: 1000,
        enableGoogleAuth: true,
        googleClientId: '',
        enableEmailNotifications: true,
        smtpServer: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        enableSms: false,
        twilioAccountSid: '',
        twilioAuthToken: '',
        maintenanceMode: false,
        cacheTimeout: 30
      };
    }
  }
}
