import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);

  property = signal<Property | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getProperty(id).subscribe({
      next: (p) => {
        this.property.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Property not found.');
        this.loading.set(false);
      },
    });
  }

  get priceLabel(): string {
    const p = this.property();
    if (!p) return '';
    return p.status === 'for_rent'
      ? `€${Number(p.price).toLocaleString()}/mo`
      : `€${Number(p.price).toLocaleString()}`;
  }

  get typeLabel(): string {
    const map: Record<string, string> = {
      house: 'House',
      apartment: 'Apartment',
      studio: 'Studio',
      townhouse: 'Townhouse',
      bungalow: 'Bungalow',
    };
    const t = this.property()?.propertyType ?? '';
    return map[t] ?? t;
  }
}
