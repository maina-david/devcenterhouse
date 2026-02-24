import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PropertyService } from '../../../../core/services/property.service';
import { Property, PropertyFilters, PaginationMeta } from '../../../../core/models/property.model';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-property-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent, FilterPanelComponent, PaginationComponent],
  templateUrl: './property-listing.component.html',
})
export class PropertyListingComponent implements OnInit, OnDestroy {
  private readonly propertyService = inject(PropertyService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  properties = signal<Property[]>([]);
  meta = signal<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 0 });
  loading = signal(false);
  error = signal<string | null>(null);
  showFilters = signal(false);

  filters = signal<PropertyFilters>({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'DESC' });
  searchInput = '';

  readonly sortOptions = [
    { value: 'createdAt_DESC', label: 'Newest First' },
    { value: 'createdAt_ASC', label: 'Oldest First' },
    { value: 'price_ASC', label: 'Price: Low to High' },
    { value: 'price_DESC', label: 'Price: High to Low' },
    { value: 'bedrooms_DESC', label: 'Most Bedrooms' },
  ];

  selectedSort = 'createdAt_DESC';

  skeletons = Array(12).fill(0);

  get activeFilterCount(): number {
    const f = this.filters();
    let count = 0;
    if (f.type) count++;
    if (f.status) count++;
    if (f.minPrice !== undefined) count++;
    if (f.maxPrice !== undefined) count++;
    if (f.bedrooms !== undefined) count++;
    if (f.bathrooms !== undefined) count++;
    if (f.county) count++;
    return count;
  }

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.filters.update((f) => ({ ...f, search: search || undefined, page: 1 }));
        this.loadProperties();
      });

    this.loadProperties();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties() {
    this.loading.set(true);
    this.error.set(null);

    this.propertyService
      .getProperties(this.filters())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.properties.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load properties. Please ensure the API server is running.');
          this.loading.set(false);
          console.error(err);
        },
      });
  }

  onSearchChange(value: string) {
    this.searchInput = value;
    this.searchSubject.next(value);
  }

  onFiltersChange(newFilters: PropertyFilters) {
    this.filters.update((f) => ({ ...f, ...newFilters }));
    this.loadProperties();
  }

  onSortChange(value: string) {
    this.selectedSort = value;
    const [sortBy, sortOrder] = value.split('_') as [string, 'ASC' | 'DESC'];
    this.filters.update((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
    this.loadProperties();
  }

  onPageChange(page: number) {
    this.filters.update((f) => ({ ...f, page }));
    this.loadProperties();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  seedDatabase() {
    this.propertyService
      .seedDatabase()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res.message);
          this.loadProperties();
        },
        error: (err) => console.error(err),
      });
  }
}
