import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PropertyCardComponent } from '../properties/components/property-card/property-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PropertyCardComponent],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);

  featuredProperties = signal<Property[]>([]);
  searchQuery = '';

  ngOnInit() {
    this.propertyService
      .getProperties({ isFeatured: true as unknown as undefined, limit: 6 } as Parameters<typeof this.propertyService.getProperties>[0])
      .subscribe({ next: (res) => this.featuredProperties.set(res.data) });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/properties'], { queryParams: { search: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/properties']);
    }
  }
}
