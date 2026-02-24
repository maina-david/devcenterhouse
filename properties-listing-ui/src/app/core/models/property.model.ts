export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  address: string;
  city: string;
  county: string;
  eircode: string;
  status: string;
  images: string[];
  latitude: number;
  longitude: number;
  availableFrom: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  search?: string;
  type?: string;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
