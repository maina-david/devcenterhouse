import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../../core/models/property.model';
import { SavedPropertiesService } from '../../../../core/services/saved-properties.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.component.html',
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;

  readonly savedService = inject(SavedPropertiesService);
  readonly authService = inject(AuthService);

  get imageUrl(): string {
    return this.property.images?.[0] ?? `https://picsum.photos/seed/${this.property.id}/800/600`;
  }

  get priceLabel(): string {
    return this.property.status === 'for_rent'
      ? `€${Number(this.property.price).toLocaleString()}/mo`
      : `€${Number(this.property.price).toLocaleString()}`;
  }

  get typeLabel(): string {
    const map: Record<string, string> = {
      house: 'House',
      apartment: 'Apartment',
      studio: 'Studio',
      townhouse: 'Townhouse',
      bungalow: 'Bungalow',
    };
    return map[this.property.propertyType] ?? this.property.propertyType;
  }

  toggleSave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) return;
    this.savedService.toggle(this.property.id).subscribe();
  }
}
