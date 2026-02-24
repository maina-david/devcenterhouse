import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './property-form.component.html',
})
export class PropertyFormComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEdit = signal(false);
  propertyId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    title: '',
    description: '',
    price: null as number | null,
    propertyType: 'apartment',
    bedrooms: null as number | null,
    bathrooms: null as number | null,
    areaSqft: null as number | null,
    address: '',
    city: '',
    county: '',
    eircode: '',
    status: 'for_rent',
    images: [''],
    latitude: null as number | null,
    longitude: null as number | null,
    availableFrom: '',
    isFeatured: false,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.propertyId.set(Number(id));
      this.propertyService.getProperty(Number(id)).subscribe({
        next: (p) => {
          this.form = {
            title: p.title,
            description: p.description,
            price: p.price,
            propertyType: p.propertyType,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            areaSqft: p.areaSqft,
            address: p.address,
            city: p.city,
            county: p.county,
            eircode: p.eircode ?? '',
            status: p.status,
            images: p.images.length ? p.images : [''],
            latitude: p.latitude,
            longitude: p.longitude,
            availableFrom: p.availableFrom ?? '',
            isFeatured: p.isFeatured,
          };
        },
      });
    }
  }

  addImage() {
    this.form.images = [...this.form.images, ''];
  }

  removeImage(index: number) {
    this.form.images = this.form.images.filter((_, i) => i !== index);
  }

  trackByIndex(index: number) {
    return index;
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    const payload: Partial<Property> = {
      ...this.form,
      images: this.form.images.filter((url) => url.trim()),
      price: this.form.price ?? undefined,
      bedrooms: this.form.bedrooms ?? undefined,
      bathrooms: this.form.bathrooms ?? undefined,
      areaSqft: this.form.areaSqft ?? undefined,
      latitude: this.form.latitude ?? undefined,
      longitude: this.form.longitude ?? undefined,
    };

    const request = this.isEdit()
      ? this.propertyService.updateProperty(this.propertyId()!, payload)
      : this.propertyService.createProperty(payload);

    request.subscribe({
      next: () => this.router.navigate(['/admin/properties']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to save property');
        this.loading.set(false);
      },
    });
  }
}
