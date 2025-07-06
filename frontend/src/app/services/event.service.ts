import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Event {
  id: number;
  title: string;
  description: string;
  aiGeneratedDescription?: string;
  startDate: string;
  endDate: string;
  organizerId: string;
  organizerName: string;
  venue?: Venue;
  category: Category;
  ticketPrice?: number;
  maxAttendees: number;
  currentAttendees: number;
  status: EventStatus;
  imageUrl?: string;
  requirements?: string;
  isPublic: boolean;
  allowWaitlist: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
  isUserRegistered: boolean;
  userRegistrationStatus?: RegistrationStatus;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  eventCount?: number;
}

export enum EventStatus {
  Draft = 0,
  Published = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export enum RegistrationStatus {
  Registered = 0,
  CheckedIn = 1,
  CheckedOut = 2,
  Cancelled = 3,
  NoShow = 4
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venueId?: number;
  categoryId: number;
  ticketPrice?: number;
  maxAttendees: number;
  imageUrl?: string;
  requirements?: string;
  isPublic: boolean;
  allowWaitlist: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venueId?: number;
  categoryId?: number;
  ticketPrice?: number;
  maxAttendees?: number;
  status?: EventStatus;
  imageUrl?: string;
  requirements?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(search?: string, categoryId?: number): Observable<Event[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    
    return this.http.get<Event[]>(this.apiUrl, { params });
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: number, event: UpdateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyEvents(asOrganizer: boolean = false): Observable<Event[]> {
    const params = new HttpParams().set('asOrganizer', asOrganizer.toString());
    return this.http.get<Event[]>(`${this.apiUrl}/my-events`, { params });
  }

  registerForEvent(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/register`, {});
  }

  unregisterFromEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/register`);
  }

  checkInToEvent(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/checkin`, {});
  }

  getRecommendedEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/recommendations`);
  }

  generateEventDescription(id: number): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(`${this.apiUrl}/${id}/generate-description`, {});
  }

  getEventPlanningTips(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/planning-tips`);
  }

  generateEventSummary(id: number): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.apiUrl}/${id}/generate-summary`, {});
  }
}
