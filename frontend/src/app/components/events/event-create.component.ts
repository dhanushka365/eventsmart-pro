import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventService, CreateEventRequest, Category, Venue } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
import { VenueService } from '../../services/venue.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="mb-8">
        <button 
          routerLink="/events"
          class="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span class="mr-2">←</span>
          Back to Events
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p class="text-gray-600 mt-2">Fill in the details below to create your event</p>
      </div>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event title">
              <div *ngIf="eventForm.get('title')?.invalid && eventForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
                Event title is required
              </div>
            </div>

            <div class="md:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your event..."></textarea>
              <div *ngIf="eventForm.get('description')?.invalid && eventForm.get('description')?.touched" class="mt-1 text-sm text-red-600">
                Event description is required
              </div>
            </div>

            <div>
              <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                id="categoryId"
                formControlName="categoryId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select a category</option>
                <option *ngFor="let category of categories" [value]="category.id">
                  {{category.name}}
                </option>
              </select>
              <div *ngIf="eventForm.get('categoryId')?.invalid && eventForm.get('categoryId')?.touched" class="mt-1 text-sm text-red-600">
                Please select a category
              </div>
            </div>

            <div>
              <label for="venueId" class="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <select
                id="venueId"
                formControlName="venueId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select a venue (optional)</option>
                <option *ngFor="let venue of venues" [value]="venue.id">
                  {{venue.name}} - {{venue.city}}, {{venue.state}}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Date & Time</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                id="startDate"
                formControlName="startDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <div *ngIf="eventForm.get('startDate')?.invalid && eventForm.get('startDate')?.touched" class="mt-1 text-sm text-red-600">
                Start date is required
              </div>
            </div>

            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                id="endDate"
                formControlName="endDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <div *ngIf="eventForm.get('endDate')?.invalid && eventForm.get('endDate')?.touched" class="mt-1 text-sm text-red-600">
                End date is required
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Event Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="maxAttendees" class="block text-sm font-medium text-gray-700 mb-2">Maximum Attendees *</label>
              <input
                type="number"
                id="maxAttendees"
                formControlName="maxAttendees"
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 100">
              <div *ngIf="eventForm.get('maxAttendees')?.invalid && eventForm.get('maxAttendees')?.touched" class="mt-1 text-sm text-red-600">
                Please enter a valid number of attendees
              </div>
            </div>

            <div>
              <label for="ticketPrice" class="block text-sm font-medium text-gray-700 mb-2">Ticket Price ($)</label>
              <input
                type="number"
                id="ticketPrice"
                formControlName="ticketPrice"
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00 (leave empty for free event)">
            </div>

            <div class="md:col-span-2">
              <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">Event Image URL</label>
              <input
                type="url"
                id="imageUrl"
                formControlName="imageUrl"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg">
            </div>

            <div class="md:col-span-2">
              <label for="requirements" class="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                id="requirements"
                formControlName="requirements"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements for attendees..."></textarea>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Event Settings</h2>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                formControlName="isPublic"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="isPublic" class="ml-2 block text-sm text-gray-900">
                Make this event public
              </label>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="allowWaitlist"
                formControlName="allowWaitlist"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="allowWaitlist" class="ml-2 block text-sm text-gray-900">
                Allow waitlist when event is full
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            routerLink="/events"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          
          <button
            type="submit"
            [disabled]="eventForm.invalid || creating"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors">
            <span *ngIf="!creating">Create Event</span>
            <span *ngIf="creating">Creating...</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class EventCreateComponent implements OnInit {
  eventForm: FormGroup;
  categories: Category[] = [];
  venues: Venue[] = [];
  creating = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private eventService: EventService,
    private categoryService: CategoryService,
    private venueService: VenueService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      categoryId: ['', Validators.required],
      venueId: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      maxAttendees: ['', [Validators.required, Validators.min(1)]],
      ticketPrice: [''],
      imageUrl: [''],
      requirements: [''],
      isPublic: [true],
      allowWaitlist: [false]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadVenues();
    this.setDefaultDates();
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

  loadVenues() {
    this.venueService.getVenues().subscribe({
      next: (venues) => {
        this.venues = venues;
      },
      error: (error) => {
        console.error('Error loading venues:', error);
      }
    });
  }

  setDefaultDates() {
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000);

    this.eventForm.patchValue({
      startDate: this.formatDateForInput(defaultStart),
      endDate: this.formatDateForInput(defaultEnd)
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.creating = true;
    const formValue = this.eventForm.value;

    const eventRequest: CreateEventRequest = {
      title: formValue.title,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      categoryId: parseInt(formValue.categoryId),
      venueId: formValue.venueId ? parseInt(formValue.venueId) : undefined,
      maxAttendees: parseInt(formValue.maxAttendees),
      ticketPrice: formValue.ticketPrice ? parseFloat(formValue.ticketPrice) : undefined,
      imageUrl: formValue.imageUrl || undefined,
      requirements: formValue.requirements || undefined,
      isPublic: formValue.isPublic,
      allowWaitlist: formValue.allowWaitlist
    };

    this.eventService.createEvent(eventRequest).subscribe({
      next: (event) => {
        this.creating = false;
        alert('Event created successfully!');
        this.router.navigate(['/events', event.id]);
      },
      error: (error) => {
        this.creating = false;
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
      }
    });
  }

  markAllFieldsAsTouched() {
    Object.keys(this.eventForm.controls).forEach(key => {
      this.eventForm.get(key)?.markAsTouched();
    });
  }
}
