import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SavedPropertiesService } from '../../../core/services/saved-properties.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models/property.model';
import { PropertyCardComponent } from '../../properties/components/property-card/property-card.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyCardComponent],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit {
  private readonly savedService = inject(SavedPropertiesService);
  readonly authService = inject(AuthService);

  savedProperties = signal<Property[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.savedService.getSavedProperties().subscribe({
      next: (entries) => {
        this.savedProperties.set(entries.map((e) => e.property));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
