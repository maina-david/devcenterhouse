import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PropertyService } from './property.service';
import { PropertyFilters } from '../models/property.model';

const API_URL = 'http://localhost:3000/api/properties';

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PropertyService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unexpected requests were made
  });

  // ─── getProperties ──────────────────────────────────────────────────────────

  describe('getProperties', () => {
    it('should GET the base properties URL with no extra params when filters are empty', () => {
      service.getProperties({}).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } });
    });

    it('should append search param when provided', () => {
      const filters: PropertyFilters = { search: 'antrim' };
      service.getProperties(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('search')).toBe('antrim');
      req.flush({ data: [], meta: {} });
    });

    it('should append type param when provided', () => {
      service.getProperties({ type: 'house' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('type')).toBe('house');
      req.flush({ data: [], meta: {} });
    });

    it('should append county param when provided', () => {
      service.getProperties({ county: 'Dublin' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('county')).toBe('Dublin');
      req.flush({ data: [], meta: {} });
    });

    it('should append numeric minPrice and maxPrice params', () => {
      service.getProperties({ minPrice: 500, maxPrice: 2000 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('minPrice')).toBe('500');
      expect(req.request.params.get('maxPrice')).toBe('2000');
      req.flush({ data: [], meta: {} });
    });

    it('should append bedrooms and bathrooms params', () => {
      service.getProperties({ bedrooms: 3, bathrooms: 2 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('bedrooms')).toBe('3');
      expect(req.request.params.get('bathrooms')).toBe('2');
      req.flush({ data: [], meta: {} });
    });

    it('should append page and limit params', () => {
      service.getProperties({ page: 2, limit: 6 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('6');
      req.flush({ data: [], meta: {} });
    });

    it('should append sortBy and sortOrder params', () => {
      service.getProperties({ sortBy: 'price', sortOrder: 'ASC' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.get('sortBy')).toBe('price');
      expect(req.request.params.get('sortOrder')).toBe('ASC');
      req.flush({ data: [], meta: {} });
    });

    it('should omit undefined params', () => {
      service.getProperties({ search: undefined, type: 'house' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.get('type')).toBe('house');
      req.flush({ data: [], meta: {} });
    });

    it('should omit empty string params', () => {
      service.getProperties({ search: '', county: 'Antrim' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.get('county')).toBe('Antrim');
      req.flush({ data: [], meta: {} });
    });

    it('should return the response as an observable', () => {
      const mockResponse = {
        data: [{ id: 1, title: 'Test Property' }],
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      };

      let result: unknown;
      service.getProperties({}).subscribe((r) => (result = r));

      const req = httpMock.expectOne((r) => r.url === API_URL);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });

  // ─── getProperty ────────────────────────────────────────────────────────────

  describe('getProperty', () => {
    it('should GET the correct URL for a property by id', () => {
      service.getProperty(42).subscribe();

      const req = httpMock.expectOne(`${API_URL}/42`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 42 });
    });

    it('should return the property object from the response', () => {
      const mockProperty = { id: 7, title: 'Studio in Cork' };
      let result: unknown;

      service.getProperty(7).subscribe((r) => (result = r));
      httpMock.expectOne(`${API_URL}/7`).flush(mockProperty);

      expect(result).toEqual(mockProperty);
    });
  });

  // ─── seedDatabase ───────────────────────────────────────────────────────────

  describe('seedDatabase', () => {
    it('should POST to the seed endpoint', () => {
      service.seedDatabase().subscribe();

      const req = httpMock.expectOne(`${API_URL}/seed`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Seeded successfully', count: 40 });
    });

    it('should return the seed response', () => {
      let result: unknown;
      service.seedDatabase().subscribe((r) => (result = r));

      httpMock.expectOne(`${API_URL}/seed`).flush({ message: 'Seeded successfully', count: 40 });

      expect(result).toEqual({ message: 'Seeded successfully', count: 40 });
    });
  });
});
