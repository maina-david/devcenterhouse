import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyFilters } from '../../../../core/models/property.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
})
export class FilterPanelComponent implements OnInit {
  @Input() filters: PropertyFilters = {};
  @Output() filtersChange = new EventEmitter<PropertyFilters>();
  @Output() close = new EventEmitter<void>();

  local: PropertyFilters = {};

  readonly propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'studio', label: 'Studio' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'bungalow', label: 'Bungalow' },
  ];

  readonly bedroomOptions = [
    { value: undefined, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' },
  ];

  readonly bathroomOptions = [
    { value: undefined, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
  ];

  readonly statusOptions = [
    { value: '', label: 'For Rent & Sale' },
    { value: 'for_rent', label: 'For Rent' },
    { value: 'for_sale', label: 'For Sale' },
  ];

  ngOnInit() {
    this.local = { ...this.filters };
  }

  apply() {
    this.filtersChange.emit({ ...this.local, page: 1 });
    this.close.emit();
  }

  reset() {
    this.local = {};
    this.filtersChange.emit({ page: 1 });
    this.close.emit();
  }
}
