import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property } from '../models/property.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SavedPropertiesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/saved-properties`;

  private readonly _savedIds = signal<Set<number>>(new Set());
  readonly savedIds = this._savedIds.asReadonly();

  isSaved(id: number): boolean {
    return this._savedIds().has(id);
  }

  loadSavedIds() {
    if (!this.authService.isAuthenticated()) return;
    this.http.get<number[]>(`${this.apiUrl}/ids`).subscribe((ids) => {
      this._savedIds.set(new Set(ids));
    });
  }

  getSavedProperties(): Observable<{ property: Property }[]> {
    return this.http.get<{ property: Property }[]>(this.apiUrl);
  }

  toggle(propertyId: number): Observable<unknown> {
    if (this._savedIds().has(propertyId)) {
      return this.http.delete(`${this.apiUrl}/${propertyId}`).pipe(
        tap(() => {
          const next = new Set(this._savedIds());
          next.delete(propertyId);
          this._savedIds.set(next);
        }),
      );
    }
    return this.http.post(`${this.apiUrl}/${propertyId}`, {}).pipe(
      tap(() => {
        const next = new Set(this._savedIds());
        next.add(propertyId);
        this._savedIds.set(next);
      }),
    );
  }
}
