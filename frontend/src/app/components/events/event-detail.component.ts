import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService, Event, RegistrationStatus } from '../../services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="event; else loadingTemplate">
      <!-- Back Button -->
      <button 
        (click)="goBack()"
        class="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Events
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Event Header -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div class="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <img 
                *ngIf="event.imageUrl" 
                [src]="event.imageUrl" 
                [alt]="event.title"
                class="w-full h-full object-cover">
              <div class="absolute top-4 right-4">
                <span 
                  class="px-3 py-1 rounded-full text-sm font-medium text-white"
                  [style.background-color]="event.category.color || '#6B7280'">
                  {{event.category.name}}
                </span>
              </div>
              <div class="absolute bottom-4 left-4 text-white">
                <h1 class="text-3xl font-bold mb-2">{{event.title}}</h1>
                <p class="text-lg opacity-90">{{formatDate(event.startDate)}} - {{formatDate(event.endDate)}}</p>
              </div>
            </div>
          </div>

          <!-- Event Description -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <div class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed">{{event.description}}</p>
              
              <div *ngIf="event.aiGeneratedDescription" class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="text-sm font-medium text-blue-800 mb-2">AI-Enhanced Description</h3>
                <p class="text-blue-700 text-sm">{{event.aiGeneratedDescription}}</p>
              </div>
            </div>

            <div *ngIf="event.requirements" class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
              <p class="text-gray-700">{{event.requirements}}</p>
            </div>
          </div>

          <!-- Organizer Info -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Organizer</h2>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {{getInitials(event.organizerName)}}
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-gray-900">{{event.organizerName}}</h3>
                <p class="text-gray-500 text-sm">Event Organizer</p>
              </div>
            </div>
          </div>

          <!-- Venue Information -->
          <div *ngIf="event.venue" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Venue</h2>
            <div class="space-y-2">
              <h3 class="font-medium text-gray-900">{{event.venue.name}}</h3>
              <p class="text-gray-600">{{event.venue.address}}</p>
              <p class="text-gray-600">{{event.venue.city}}, {{event.venue.state}} {{event.venue.country}}</p>
              <p class="text-sm text-gray-500">Capacity: {{event.venue.capacity}} people</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Registration Card -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-6">
            <div class="text-center mb-6">
              <div class="text-3xl font-bold text-gray-900 mb-1">
                <span *ngIf="event.ticketPrice; else freeEvent">\${{event.ticketPrice}}</span>
                <ng-template #freeEvent>Free</ng-template>
              </div>
              <p class="text-gray-500 text-sm">per person</p>
            </div>

            <!-- Attendance Info -->
            <div class="mb-6">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Attendees</span>
                <span>{{event.currentAttendees}} / {{event.maxAttendees}}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full"
                  [style.width.%]="(event.currentAttendees / event.maxAttendees) * 100">
                </div>
              </div>
            </div>

            <!-- Registration Button -->
            <div class="space-y-3">
              <button
                *ngIf="!event.isUserRegistered && event.status === 1"
                (click)="registerForEvent()"
                [disabled]="registering"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                <span *ngIf="!registering">Register Now</span>
                <span *ngIf="registering">Registering...</span>
              </button>

              <button
                *ngIf="event.isUserRegistered && event.userRegistrationStatus === 0"
                (click)="unregisterFromEvent()"
                class="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Cancel Registration
              </button>

              <button
                *ngIf="event.isUserRegistered && event.userRegistrationStatus === 1"
                class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium cursor-not-allowed">
                Checked In
              </button>

              <button
                *ngIf="event.isUserRegistered && canCheckIn()"
                (click)="checkInToEvent()"
                class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Check In
              </button>

              <div *ngIf="event.status !== 1" class="text-center">
                <span class="text-gray-500 text-sm">
                  {{getStatusText(event.status)}}
                </span>
              </div>
            </div>

            <!-- Event Status -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium" [class]="getStatusClass(event.status)">
                  {{getStatusText(event.status)}}
                </span>
              </div>
            </div>
          </div>

          <!-- Event Stats -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Event Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Created:</span>
                <span class="font-medium">{{formatDate(event.createdAt)}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-medium">{{getDuration()}}</span>
              </div>
              <div class="flex justify-between" *ngIf="event.averageRating > 0">
                <span class="text-gray-600">Rating:</span>
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-medium">{{event.averageRating.toFixed(1)}} ({{event.reviewCount}})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </ng-template>
  `
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  registering = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(parseInt(id));
    }
  }

  loadEvent(id: number) {
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.router.navigate(['/events']);
      }
    });
  }

  registerForEvent() {
    if (!this.event) return;
    
    this.registering = true;
    this.eventService.registerForEvent(this.event.id).subscribe({
      next: () => {
        this.registering = false;
        this.loadEvent(this.event!.id);
        alert('Successfully registered for the event!');
      },
      error: (error) => {
        this.registering = false;
        console.error('Error registering for event:', error);
        alert('Failed to register for the event. Please try again.');
      }
    });
  }

  unregisterFromEvent() {
    if (!this.event) return;
    
    if (confirm('Are you sure you want to cancel your registration?')) {
      this.eventService.unregisterFromEvent(this.event.id).subscribe({
        next: () => {
          this.loadEvent(this.event!.id);
          alert('Registration cancelled successfully.');
        },
        error: (error) => {
          console.error('Error unregistering from event:', error);
          alert('Failed to cancel registration. Please try again.');
        }
      });
    }
  }

  checkInToEvent() {
    if (!this.event) return;
    
    this.eventService.checkInToEvent(this.event.id).subscribe({
      next: () => {
        this.loadEvent(this.event!.id);
        alert('Successfully checked in to the event!');
      },
      error: (error) => {
        console.error('Error checking in to event:', error);
        alert('Failed to check in. Please try again.');
      }
    });
  }

  canCheckIn(): boolean {
    if (!this.event) return false;
    
    const now = new Date();
    const startDate = new Date(this.event.startDate);
    const dayBeforeStart = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    
    return now >= dayBeforeStart && this.event.userRegistrationStatus === RegistrationStatus.Registered;
  }

  getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Draft',
      1: 'Published',
      2: 'In Progress',
      3: 'Completed',
      4: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  }

  getStatusClass(status: number): string {
    const classMap: { [key: number]: string } = {
      0: 'text-gray-600',
      1: 'text-green-600',
      2: 'text-blue-600',
      3: 'text-purple-600',
      4: 'text-red-600'
    };
    return classMap[status] || 'text-gray-600';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(): string {
    if (!this.event) return '';
    
    const start = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  goBack() {
    this.router.navigate(['/events']);
  }
}
