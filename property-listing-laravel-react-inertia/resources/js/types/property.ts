export type ListingType = 'rent' | 'sale';

export type PropertyType =
    | 'house'
    | 'apartment'
    | 'flat'
    | 'studio'
    | 'bungalow'
    | 'duplex'
    | 'terraced'
    | 'semi-detached'
    | 'detached';

export type PropertyStatus = 'active' | 'inactive' | 'sold' | 'let';

export type PricePeriod = 'per_month' | 'per_week' | 'per_year';

export interface Property {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    listing_type: ListingType;
    property_type: PropertyType;
    status: PropertyStatus;
    price: number;
    price_period: PricePeriod | null;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number | null;
    address: string;
    town: string;
    county: string;
    eircode: string | null;
    images: string[];
    features: string[];
    is_featured: boolean;
    available_from: string | null;
    created_at: string;
    updated_at: string;
    main_image: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedProperties {
    data: Property[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

export interface PropertyFilters {
    search?: string;
    listing_type?: string;
    property_type?: string;
    county?: string;
    min_price?: string;
    max_price?: string;
    bedrooms?: string;
    sort?: string;
}
