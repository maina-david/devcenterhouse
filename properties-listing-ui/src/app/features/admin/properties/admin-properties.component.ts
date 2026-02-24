import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-properties.component.html',
})
export class AdminPropertiesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);

  properties = signal<Property[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);

  ngOnInit() {
    this.load();
  }

  load() {
    this.propertyService
      .getProperties({ page: this.page(), limit: 15, sortBy: 'createdAt', sortOrder: 'DESC' })
      .subscribe({
        next: (res) => {
          this.properties.set(res.data);
          this.totalPages.set(res.meta.totalPages);
          this.loading.set(false);
        },
      });
  }

  delete(id: number) {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    this.propertyService.deleteProperty(id).subscribe(() => this.load());
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }
}
