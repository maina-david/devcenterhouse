import { router } from '@inertiajs/react';
import { SearchIcon } from 'lucide-react';
import { useRef } from 'react';
import { FilterBar } from '@/components/properties/filter-bar';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';
import type { PaginatedProperties, PropertyFilters } from '@/types';

interface Props {
    properties: PaginatedProperties;
    filters: PropertyFilters;
    counties: string[];
}

export default function PropertiesIndex({ properties, filters, counties }: Props) {
    const searchRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const updated = { ...filters, search: search || undefined };
            const cleaned = Object.fromEntries(
                Object.entries(updated).filter(([, v]) => v !== '' && v !== undefined),
            );
            router.get('/properties', cleaned, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);
    };

    const listingTypeLabel =
        filters.listing_type === 'rent'
            ? 'For Rent'
            : filters.listing_type === 'sale'
              ? 'For Sale'
              : '';

    const locationLabel = filters.county ?? filters.search ?? 'Ireland';

    const resultsHeading = [
        properties.total.toLocaleString(),
        'Propert' + (properties.total === 1 ? 'y' : 'ies'),
        listingTypeLabel,
        'in',
        locationLabel,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <PublicLayout>
            <section className="bg-linear-to-br from-primary/10 via-primary/5 to-background py-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Find Your Perfect Property
                    </h1>
                    <p className="mb-6 text-muted-foreground">
                        Search thousands of properties across Ireland
                    </p>

                    <div className="relative max-w-2xl">
                        <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            type="search"
                            placeholder="Search by location, county or address…"
                            defaultValue={filters.search ?? ''}
                            onChange={handleSearchChange}
                            className="h-12 pl-10 text-base shadow-sm"
                        />
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        {resultsHeading}
                    </h2>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <FilterBar filters={filters} counties={counties} />

                    <div className="min-w-0 flex-1">
                        {properties.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
                                <p className="text-lg font-medium text-foreground">
                                    No properties found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {properties.data.map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                        />
                                    ))}
                                </div>

                                <PropertyPagination meta={properties} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
