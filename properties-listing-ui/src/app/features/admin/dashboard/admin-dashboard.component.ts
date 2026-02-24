import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyStats } from '../../../core/models/user.model';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);

  stats = signal<PropertyStats | null>(null);
  recentProperties = signal<Property[]>([]);

  ngOnInit() {
    this.propertyService.getStats().subscribe({ next: (s) => this.stats.set(s) });
    this.propertyService
      .getProperties({ limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' })
      .subscribe({ next: (res) => this.recentProperties.set(res.data) });
  }
}
