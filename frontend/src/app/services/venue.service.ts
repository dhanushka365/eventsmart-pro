import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venue } from './event.service';

export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity: number;
  description?: string;
  amenities?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private apiUrl = `${environment.apiUrl}/venues`;

  constructor(private http: HttpClient) {}

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }

  getVenue(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  createVenue(venue: CreateVenueRequest): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, venue);
  }
}
