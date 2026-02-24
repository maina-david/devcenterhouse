import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() limit = 12;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): (number | '...')[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (this.currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, this.currentPage - 1);
      i <= Math.min(this.totalPages - 1, this.currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (this.currentPage < this.totalPages - 2) pages.push('...');
    pages.push(this.totalPages);
    return pages;
  }

  get fromItem(): number {
    return (this.currentPage - 1) * this.limit + 1;
  }

  get toItem(): number {
    return Math.min(this.currentPage * this.limit, this.total);
  }

  goTo(page: number | '...') {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  prev() {
    if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1);
  }

  next() {
    if (this.currentPage < this.totalPages) this.pageChange.emit(this.currentPage + 1);
  }
}
