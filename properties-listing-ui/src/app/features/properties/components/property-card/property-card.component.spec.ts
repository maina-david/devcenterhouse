import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PropertyCardComponent } from './property-card.component';
import { Property } from '../../../../core/models/property.model';

const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 1,
  title: '3 Bed House in Dublin',
  description: 'A great family home',
  price: 2500,
  propertyType: 'house',
  bedrooms: 3,
  bathrooms: 2,
  areaSqft: 1200,
  address: '42 Maple Drive',
  city: 'Dublin',
  county: 'Dublin',
  eircode: 'D04 XY99',
  status: 'for_rent',
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  latitude: 53.34,
  longitude: -6.26,
  availableFrom: '2025-06-01',
  isFeatured: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('PropertyCardComponent', () => {
  let component: PropertyCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCardComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    const fixture = TestBed.createComponent(PropertyCardComponent);
    component = fixture.componentInstance;
    component.property = makeProperty();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── imageUrl ───────────────────────────────────────────────────────────────

  describe('imageUrl', () => {
    it('should return the first image from the images array', () => {
      component.property = makeProperty({ images: ['https://img.example.com/first.jpg'] });
      expect(component.imageUrl).toBe('https://img.example.com/first.jpg');
    });

    it('should fall back to picsum URL when images array is empty', () => {
      component.property = makeProperty({ id: 7, images: [] });
      expect(component.imageUrl).toBe('https://picsum.photos/seed/7/800/600');
    });

    it('should fall back to picsum URL when images is undefined', () => {
      component.property = makeProperty({ id: 3, images: undefined as unknown as string[] });
      expect(component.imageUrl).toBe('https://picsum.photos/seed/3/800/600');
    });
  });

  // ─── priceLabel ─────────────────────────────────────────────────────────────

  describe('priceLabel', () => {
    it('should append /mo for for_rent properties', () => {
      component.property = makeProperty({ price: 1500, status: 'for_rent' });
      expect(component.priceLabel).toContain('/mo');
    });

    it('should not append /mo for for_sale properties', () => {
      component.property = makeProperty({ price: 350000, status: 'for_sale' });
      expect(component.priceLabel).not.toContain('/mo');
    });

    it('should format price with euro symbol', () => {
      component.property = makeProperty({ price: 2000, status: 'for_rent' });
      expect(component.priceLabel).toContain('€');
    });

    it('should format large prices with locale separators', () => {
      component.property = makeProperty({ price: 1500000, status: 'for_sale' });
      // toLocaleString adds commas/dots depending on locale, but should contain digits
      expect(component.priceLabel).toMatch(/€[\d,\.]+/);
    });
  });

  // ─── typeLabel ──────────────────────────────────────────────────────────────

  describe('typeLabel', () => {
    it.each([
      ['house', 'House'],
      ['apartment', 'Apartment'],
      ['studio', 'Studio'],
      ['townhouse', 'Townhouse'],
      ['bungalow', 'Bungalow'],
    ])('should map "%s" to "%s"', (type, expected) => {
      component.property = makeProperty({ propertyType: type });
      expect(component.typeLabel).toBe(expected);
    });

    it('should return the raw type for unknown property types', () => {
      component.property = makeProperty({ propertyType: 'penthouse' });
      expect(component.typeLabel).toBe('penthouse');
    });
  });

  // ─── Template rendering ──────────────────────────────────────────────────────

  describe('template', () => {
    it('should render the Featured badge when isFeatured is true', async () => {
      const fixture = TestBed.createComponent(PropertyCardComponent);
      fixture.componentInstance.property = makeProperty({ isFeatured: true });
      fixture.detectChanges();
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Featured');
    });

    it('should not render the Featured badge when isFeatured is false', async () => {
      const fixture = TestBed.createComponent(PropertyCardComponent);
      fixture.componentInstance.property = makeProperty({ isFeatured: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Featured');
    });

    it('should render "For Rent" badge for for_rent status', async () => {
      const fixture = TestBed.createComponent(PropertyCardComponent);
      fixture.componentInstance.property = makeProperty({ status: 'for_rent' });
      fixture.detectChanges();
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('For Rent');
    });

    it('should render "For Sale" badge for for_sale status', async () => {
      const fixture = TestBed.createComponent(PropertyCardComponent);
      fixture.componentInstance.property = makeProperty({ status: 'for_sale' });
      fixture.detectChanges();
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('For Sale');
    });

    it('should render the property title', async () => {
      const fixture = TestBed.createComponent(PropertyCardComponent);
      fixture.componentInstance.property = makeProperty({ title: 'Beautiful Cottage' });
      fixture.detectChanges();
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Beautiful Cottage');
    });
  });
});
