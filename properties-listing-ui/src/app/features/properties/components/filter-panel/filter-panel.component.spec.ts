import { TestBed } from '@angular/core/testing';
import { FilterPanelComponent } from './filter-panel.component';
import { PropertyFilters } from '../../../../core/models/property.model';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── Static option lists ─────────────────────────────────────────────────────

  describe('option lists', () => {
    it('should include "All Types" as first property type option', () => {
      expect(component.propertyTypes[0].value).toBe('');
      expect(component.propertyTypes[0].label).toBe('All Types');
    });

    it('should expose all 5 property types', () => {
      const values = component.propertyTypes.map((o) => o.value).filter(Boolean);
      expect(values).toEqual(
        expect.arrayContaining(['house', 'apartment', 'studio', 'townhouse', 'bungalow']),
      );
    });

    it('should include "Any" as first bedroom option', () => {
      expect(component.bedroomOptions[0].label).toBe('Any');
      expect(component.bedroomOptions[0].value).toBeUndefined();
    });

    it('should include "Any" as first bathroom option', () => {
      expect(component.bathroomOptions[0].label).toBe('Any');
      expect(component.bathroomOptions[0].value).toBeUndefined();
    });
  });

  // ─── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should copy input filters to local on init', () => {
      const inputFilters: PropertyFilters = {
        type: 'apartment',
        minPrice: 800,
        bedrooms: 2,
      };

      const fixture = TestBed.createComponent(FilterPanelComponent);
      fixture.componentInstance.filters = inputFilters;
      fixture.detectChanges(); // triggers ngOnInit

      expect(fixture.componentInstance.local).toEqual(inputFilters);
    });

    it('should initialise local as empty object when no filters provided', () => {
      const fixture = TestBed.createComponent(FilterPanelComponent);
      fixture.componentInstance.filters = {};
      fixture.detectChanges();

      expect(fixture.componentInstance.local).toEqual({});
    });

    it('should not share reference with the input filters object', () => {
      const inputFilters: PropertyFilters = { type: 'house' };
      const fixture = TestBed.createComponent(FilterPanelComponent);
      fixture.componentInstance.filters = inputFilters;
      fixture.detectChanges();

      // mutate local — input should be unaffected
      fixture.componentInstance.local.type = 'studio';
      expect(inputFilters.type).toBe('house');
    });
  });

  // ─── apply() ────────────────────────────────────────────────────────────────

  describe('apply()', () => {
    it('should emit filtersChange with local filters merged with page: 1', () => {
      component.local = { type: 'house', minPrice: 500 };
      const spy = vi.spyOn(component.filtersChange, 'emit');

      component.apply();

      expect(spy).toHaveBeenCalledWith({ type: 'house', minPrice: 500, page: 1 });
    });

    it('should emit close after applying filters', () => {
      const spy = vi.spyOn(component.close, 'emit');

      component.apply();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should always reset page to 1 regardless of local.page', () => {
      component.local = { page: 5, type: 'apartment' };
      const spy = vi.spyOn(component.filtersChange, 'emit');

      component.apply();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    });
  });

  // ─── reset() ────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('should clear local filters', () => {
      component.local = { type: 'house', minPrice: 600, bedrooms: 3 };

      component.reset();

      expect(component.local).toEqual({});
    });

    it('should emit filtersChange with only page: 1', () => {
      component.local = { type: 'house', minPrice: 500 };
      const spy = vi.spyOn(component.filtersChange, 'emit');

      component.reset();

      expect(spy).toHaveBeenCalledWith({ page: 1 });
    });

    it('should emit close after resetting', () => {
      const spy = vi.spyOn(component.close, 'emit');

      component.reset();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
