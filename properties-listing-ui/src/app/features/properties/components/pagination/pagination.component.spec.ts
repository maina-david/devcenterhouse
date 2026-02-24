import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    // sensible defaults
    component.currentPage = 1;
    component.totalPages = 5;
    component.total = 50;
    component.limit = 12;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── pages getter ───────────────────────────────────────────────────────────

  describe('pages', () => {
    it('should return all page numbers when totalPages <= 7', () => {
      component.totalPages = 5;
      component.currentPage = 1;
      expect(component.pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return exactly [1..N] for 7 pages', () => {
      component.totalPages = 7;
      component.currentPage = 4;
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should show leading ellipsis when currentPage > 3 on large set', () => {
      component.totalPages = 10;
      component.currentPage = 6;
      const pages = component.pages;
      expect(pages[0]).toBe(1);
      expect(pages[1]).toBe('...');
    });

    it('should show trailing ellipsis when currentPage < totalPages - 2 on large set', () => {
      component.totalPages = 10;
      component.currentPage = 3;
      const pages = component.pages;
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages[pages.length - 2]).toBe('...');
    });

    it('should always include first and last page in large sets', () => {
      component.totalPages = 20;
      component.currentPage = 10;
      const pages = component.pages;
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(20);
    });

    it('should not show leading ellipsis when currentPage is close to start', () => {
      component.totalPages = 10;
      component.currentPage = 2;
      const pages = component.pages;
      expect(pages[1]).not.toBe('...');
    });
  });

  // ─── fromItem ───────────────────────────────────────────────────────────────

  describe('fromItem', () => {
    it('should return 1 for page 1', () => {
      component.currentPage = 1;
      component.limit = 12;
      expect(component.fromItem).toBe(1);
    });

    it('should return 13 for page 2 with limit 12', () => {
      component.currentPage = 2;
      component.limit = 12;
      expect(component.fromItem).toBe(13);
    });

    it('should return correct value for arbitrary page and limit', () => {
      component.currentPage = 4;
      component.limit = 6;
      expect(component.fromItem).toBe(19); // (4-1)*6 + 1
    });
  });

  // ─── toItem ─────────────────────────────────────────────────────────────────

  describe('toItem', () => {
    it('should return limit for the first full page', () => {
      component.currentPage = 1;
      component.limit = 12;
      component.total = 50;
      expect(component.toItem).toBe(12);
    });

    it('should cap at total on the last page when fewer items remain', () => {
      component.currentPage = 5;
      component.limit = 12;
      component.total = 50;
      expect(component.toItem).toBe(50); // 5*12=60 > 50
    });

    it('should return page*limit when not the last page', () => {
      component.currentPage = 2;
      component.limit = 10;
      component.total = 100;
      expect(component.toItem).toBe(20);
    });
  });

  // ─── prev / next ────────────────────────────────────────────────────────────

  describe('prev()', () => {
    it('should emit currentPage - 1 when not on first page', () => {
      component.currentPage = 3;
      component.totalPages = 5;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.prev();

      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should NOT emit when already on page 1', () => {
      component.currentPage = 1;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.prev();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('next()', () => {
    it('should emit currentPage + 1 when not on last page', () => {
      component.currentPage = 2;
      component.totalPages = 5;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.next();

      expect(spy).toHaveBeenCalledWith(3);
    });

    it('should NOT emit when already on the last page', () => {
      component.currentPage = 5;
      component.totalPages = 5;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.next();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ─── goTo ───────────────────────────────────────────────────────────────────

  describe('goTo()', () => {
    it('should emit the target page number', () => {
      component.currentPage = 1;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.goTo(4);

      expect(spy).toHaveBeenCalledWith(4);
    });

    it('should NOT emit when target is the current page', () => {
      component.currentPage = 3;
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.goTo(3);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT emit when called with ellipsis string', () => {
      const spy = vi.spyOn(component.pageChange, 'emit');

      component.goTo('...');

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
