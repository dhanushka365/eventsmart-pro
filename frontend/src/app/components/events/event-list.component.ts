import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, Event, Category } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
          <p class="text-gray-600">Find amazing events happening around you</p>
        </div>
        <button 
          routerLink="/events/create"
          class="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Create Event
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Search events..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div class="md:w-64">
            <select
              [(ngModel)]="selectedCategoryId"
              (ngModelChange)="onCategoryChange()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{category.name}}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loading; else loadingTemplate">
        <div *ngFor="let event of events" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <img 
              *ngIf="event.imageUrl" 
              [src]="event.imageUrl" 
              [alt]="event.title"
              class="w-full h-full object-cover">
            <div class="absolute top-4 right-4">
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium text-white"
                [style.background-color]="event.category.color || '#6B7280'">
                {{event.category.name}}
              </span>
            </div>
            <div class="absolute bottom-4 left-4 text-white">
              <div class="text-sm opacity-90">{{formatDate(event.startDate)}}</div>
            </div>
          </div>

          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{event.title}}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{event.description}}</p>
            
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500" *ngIf="event.venue">
                <span class="mr-2">📍</span>
                {{event.venue.name}}, {{event.venue.city}}
              </div>
              
              <div class="flex items-center text-sm text-gray-500">
                <span class="mr-2">👥</span>
                {{event.currentAttendees}} / {{event.maxAttendees}} attendees
              </div>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500" *ngIf="event.ticketPrice; else freeEvent">
                  <span class="font-medium text-green-600">\${{event.ticketPrice}}</span>
                </div>
                <ng-template #freeEvent>
                  <div class="text-sm text-green-600">Free</div>
                </ng-template>
                
                <div class="flex items-center text-sm text-yellow-500" *ngIf="event.averageRating > 0">
                  <span class="mr-1">⭐</span>
                  {{event.averageRating.toFixed(1)}} ({{event.reviewCount}})
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                (click)="viewEvent(event.id)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                View Details
              </button>
              
              <button
                *ngIf="!event.isUserRegistered && event.status === 1"
                (click)="registerForEvent(event.id)"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Register
              </button>
              
              <button
                *ngIf="event.isUserRegistered"
                class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                Registered
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ng-template>

      <div *ngIf="events.length === 0 && !loading" class="text-center py-12">
        <div class="text-6xl mb-4">📅</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No events found</h3>
        <p class="text-gray-500 mb-4">Try adjusting your search criteria or create a new event.</p>
        <button 
          routerLink="/events/create"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Create Your First Event
        </button>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  categories: Category[] = [];
  loading = true;
  searchTerm = '';
  selectedCategoryId: number | null = null;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    const categoryId = this.selectedCategoryId || undefined;
    
    this.eventService.getEvents(this.searchTerm || undefined, categoryId).subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearchChange() {
    setTimeout(() => {
      this.loadEvents();
    }, 300);
  }

  onCategoryChange() {
    this.loadEvents();
  }

  viewEvent(id: number) {
    // Navigate to event details
    window.location.href = `/events/${id}`;
  }

  registerForEvent(id: number) {
    this.eventService.registerForEvent(id).subscribe({
      next: () => {
        this.loadEvents();
        alert('Successfully registered for the event!');
      },
      error: (error) => {
        console.error('Error registering for event:', error);
        alert('Failed to register for the event. Please try again.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
