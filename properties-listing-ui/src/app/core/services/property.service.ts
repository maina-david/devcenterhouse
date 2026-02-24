import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, PropertyFilters, PaginatedResponse } from '../models/property.model';
import { PropertyStats } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/properties`;

  getProperties(filters: PropertyFilters): Observable<PaginatedResponse<Property>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Property>>(this.apiUrl, { params });
  }

  getProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<PropertyStats> {
    return this.http.get<PropertyStats>(`${this.apiUrl}/stats`);
  }

  createProperty(data: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }

  updateProperty(id: number, data: Partial<Property>): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, data);
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  seedDatabase(): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(`${this.apiUrl}/seed`, {});
  }
}
