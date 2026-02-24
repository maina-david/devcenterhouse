import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PropertyListingComponent } from './property-listing.component';
import { PropertyService } from '../../../../core/services/property.service';
import { Property, PaginatedResponse } from '../../../../core/models/property.model';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeProperty = (id = 1): Property => ({
  id,
  title: `Property ${id}`,
  description: 'Test',
  price: 1200 + id * 100,
  propertyType: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  areaSqft: 700,
  address: `${id} Test Street`,
  city: 'Dublin',
  county: 'Dublin',
  eircode: 'D01 XX11',
  status: 'for_rent',
  images: [],
  latitude: 53.34,
  longitude: -6.26,
  availableFrom: '2025-06-01',
  isFeatured: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
});

const makePaginatedResponse = (
  count = 3,
  page = 1,
  limit = 12,
): PaginatedResponse<Property> => ({
  data: Array.from({ length: count }, (_, i) => makeProperty(i + 1)),
  meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('PropertyListingComponent', () => {
  let component: PropertyListingComponent;
  let mockService: { getProperties: ReturnType<typeof vi.fn>; seedDatabase: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      getProperties: vi.fn().mockReturnValue(of(makePaginatedResponse(3))),
      seedDatabase: vi.fn().mockReturnValue(of({ message: 'Seeded', count: 40 })),
    };

    // Suppress window.scrollTo errors in jsdom
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [PropertyListingComponent],
      providers: [
        provideRouter([]),
        { provide: PropertyService, useValue: mockService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PropertyListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── Initialisation ─────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getProperties on init with default filters', () => {
      expect(mockService.getProperties).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'DESC' }),
      );
    });

    it('should populate properties signal after successful load', () => {
      expect(component.properties().length).toBe(3);
    });

    it('should populate meta signal after successful load', () => {
      expect(component.meta().total).toBe(3);
      expect(component.meta().page).toBe(1);
    });

    it('should set loading to false after successful load', () => {
      expect(component.loading()).toBe(false);
    });

    it('should set error to null after successful load', () => {
      expect(component.error()).toBeNull();
    });
  });

  // ─── Error handling ──────────────────────────────────────────────────────────

  describe('error state', () => {
    it('should set error signal when API call fails', async () => {
      mockService.getProperties.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      const fixture = TestBed.createComponent(PropertyListingComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.error()).toBeTruthy();
      expect(fixture.componentInstance.loading()).toBe(false);
    });
  });

  // ─── loadProperties ──────────────────────────────────────────────────────────

  describe('loadProperties()', () => {
    it('should set loading to true then false', () => {
      const calls: boolean[] = [];
      // Capture the loading state at the time of the API call
      mockService.getProperties.mockImplementation(() => {
        calls.push(component.loading());
        return of(makePaginatedResponse(1));
      });

      component.loadProperties();

      expect(calls[calls.length - 1]).toBe(true);
      expect(component.loading()).toBe(false);
    });

    it('should reset error before each load', () => {
      // Seed an error first
      mockService.getProperties.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );
      component.loadProperties();

      // Then success
      mockService.getProperties.mockReturnValue(of(makePaginatedResponse(2)));
      component.loadProperties();

      expect(component.error()).toBeNull();
      expect(component.properties().length).toBe(2);
    });
  });

  // ─── onSearchChange ──────────────────────────────────────────────────────────

  describe('onSearchChange()', () => {
    it('should update searchInput immediately', () => {
      component.onSearchChange('antrim');
      expect(component.searchInput).toBe('antrim');
    });

    it('should debounce and reload after 400ms', async () => {
      vi.useFakeTimers();
      const callCountBefore = (mockService.getProperties as ReturnType<typeof vi.fn>).mock.calls.length;

      component.onSearchChange('ant');
      component.onSearchChange('antr');
      component.onSearchChange('antri');
      component.onSearchChange('antrim');

      // Not called yet (debounce pending)
      expect((mockService.getProperties as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callCountBefore,
      );

      await vi.advanceTimersByTimeAsync(400);

      // Called exactly once after debounce
      expect((mockService.getProperties as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callCountBefore + 1,
      );

      vi.useRealTimers();
    });
  });

  // ─── onFiltersChange ─────────────────────────────────────────────────────────

  describe('onFiltersChange()', () => {
    it('should merge new filters and reload properties', () => {
      const callsBefore = mockService.getProperties.mock.calls.length;

      component.onFiltersChange({ type: 'house', page: 1 });

      expect(mockService.getProperties).toHaveBeenCalledTimes(callsBefore + 1);
      const lastCall = mockService.getProperties.mock.calls[callsBefore][0];
      expect(lastCall.type).toBe('house');
    });
  });

  // ─── onSortChange ────────────────────────────────────────────────────────────

  describe('onSortChange()', () => {
    it('should parse price_ASC into sortBy=price and sortOrder=ASC', () => {
      component.onSortChange('price_ASC');

      const lastCall = mockService.getProperties.mock.lastCall![0];
      expect(lastCall.sortBy).toBe('price');
      expect(lastCall.sortOrder).toBe('ASC');
    });

    it('should parse createdAt_DESC into correct values', () => {
      component.onSortChange('createdAt_DESC');

      const lastCall = mockService.getProperties.mock.lastCall![0];
      expect(lastCall.sortBy).toBe('createdAt');
      expect(lastCall.sortOrder).toBe('DESC');
    });

    it('should reset page to 1 on sort change', () => {
      component.onSortChange('price_ASC');

      const lastCall = mockService.getProperties.mock.lastCall![0];
      expect(lastCall.page).toBe(1);
    });

    it('should update selectedSort', () => {
      component.onSortChange('bedrooms_DESC');
      expect(component.selectedSort).toBe('bedrooms_DESC');
    });
  });

  // ─── onPageChange ────────────────────────────────────────────────────────────

  describe('onPageChange()', () => {
    it('should update filters page and reload', () => {
      component.onPageChange(3);

      const lastCall = mockService.getProperties.mock.lastCall![0];
      expect(lastCall.page).toBe(3);
    });

    it('should call window.scrollTo', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo');
      component.onPageChange(2);
      expect(scrollSpy).toHaveBeenCalled();
    });
  });

  // ─── toggleFilters ───────────────────────────────────────────────────────────

  describe('toggleFilters()', () => {
    it('should toggle showFilters from false to true', () => {
      expect(component.showFilters()).toBe(false);
      component.toggleFilters();
      expect(component.showFilters()).toBe(true);
    });

    it('should toggle showFilters back to false on second call', () => {
      component.toggleFilters();
      component.toggleFilters();
      expect(component.showFilters()).toBe(false);
    });
  });

  // ─── activeFilterCount ───────────────────────────────────────────────────────

  describe('activeFilterCount', () => {
    it('should return 0 with default empty filters', () => {
      component['filters'].set({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'DESC' });
      expect(component.activeFilterCount).toBe(0);
    });

    it('should count each active filter separately', () => {
      component['filters'].set({
        type: 'house',
        status: 'for_rent',
        minPrice: 500,
        maxPrice: 2000,
        bedrooms: 2,
        bathrooms: 1,
        county: 'Dublin',
      });
      expect(component.activeFilterCount).toBe(7);
    });

    it('should not count page, limit, sortBy, sortOrder as filters', () => {
      component['filters'].set({ page: 2, limit: 6, sortBy: 'price', sortOrder: 'ASC' });
      expect(component.activeFilterCount).toBe(0);
    });

    it('should count only set filters', () => {
      component['filters'].set({ type: 'apartment', county: 'Cork' });
      expect(component.activeFilterCount).toBe(2);
    });
  });

  // ─── seedDatabase ────────────────────────────────────────────────────────────

  describe('seedDatabase()', () => {
    it('should call seedDatabase on the service', () => {
      component.seedDatabase();
      expect(mockService.seedDatabase).toHaveBeenCalledTimes(1);
    });

    it('should reload properties after seeding', () => {
      const callsBefore = mockService.getProperties.mock.calls.length;
      component.seedDatabase();
      expect(mockService.getProperties.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
