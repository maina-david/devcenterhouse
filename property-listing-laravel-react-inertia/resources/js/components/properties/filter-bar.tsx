import { router } from '@inertiajs/react';
import { FilterIcon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PropertyFilters } from '@/types';

interface FilterBarProps {
    filters: PropertyFilters;
    counties: string[];
}

const PROPERTY_TYPES = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'flat', label: 'Flat' },
    { value: 'studio', label: 'Studio' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'terraced', label: 'Terraced' },
    { value: 'semi-detached', label: 'Semi-Detached' },
    { value: 'detached', label: 'Detached' },
];

const BEDROOM_OPTIONS = [
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

export function FilterBar({ filters, counties }: FilterBarProps) {
    const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
    const [mobileOpen, setMobileOpen] = useState(false);

    const hasActiveFilters = Object.values(localFilters).some(
        (v) => v !== undefined && v !== '',
    );

    const applyFilters = useCallback(
        (updated: PropertyFilters) => {
            const cleaned = Object.fromEntries(
                Object.entries(updated).filter(([, v]) => v !== '' && v !== undefined),
            );
            router.get('/properties', cleaned, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [],
    );

    const handleChange = (key: keyof PropertyFilters, value: string) => {
        const updated = { ...localFilters, [key]: value || undefined };
        setLocalFilters(updated);
        applyFilters(updated);
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/properties', {}, { preserveState: false, replace: true });
    };

    const filterContent = (
        <div className="flex flex-col gap-4">
            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Listing Type
                </label>
                <div className="flex gap-2">
                    {[
                        { value: '', label: 'All' },
                        { value: 'rent', label: 'For Rent' },
                        { value: 'sale', label: 'For Sale' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleChange('listing_type', opt.value)}
                            className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                                (localFilters.listing_type ?? '') === opt.value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background hover:bg-accent'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Property Type
                </label>
                <Select
                    value={localFilters.property_type ?? ''}
                    onValueChange={(v) => handleChange('property_type', v === 'all' ? '' : v)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {PROPERTY_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    County
                </label>
                <Select
                    value={localFilters.county ?? ''}
                    onValueChange={(v) => handleChange('county', v === 'all' ? '' : v)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All counties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Counties</SelectItem>
                        {counties.map((county) => (
                            <SelectItem key={county} value={county}>
                                {county}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Price Range (€)
                </label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={localFilters.min_price ?? ''}
                        min={0}
                        onChange={(e) => handleChange('min_price', e.target.value)}
                        className="w-full"
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        value={localFilters.max_price ?? ''}
                        min={0}
                        onChange={(e) => handleChange('max_price', e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bedrooms
                </label>
                <Select
                    value={localFilters.bedrooms ?? ''}
                    onValueChange={(v) => handleChange('bedrooms', v === 'any' ? '' : v)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        {BEDROOM_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sort By
                </label>
                <Select
                    value={localFilters.sort ?? 'newest'}
                    onValueChange={(v) => handleChange('sort', v)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Newest First" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full gap-2"
                >
                    <XIcon className="size-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );

    return (
        <>
            <div className="mb-4 lg:hidden">
                <Button
                    variant="outline"
                    onClick={() => setMobileOpen((o) => !o)}
                    className="gap-2"
                >
                    <FilterIcon className="size-4" />
                    {mobileOpen ? 'Hide Filters' : 'Show Filters'}
                    {hasActiveFilters && (
                        <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {
                                Object.values(localFilters).filter(
                                    (v) => v !== undefined && v !== '',
                                ).length
                            }
                        </span>
                    )}
                </Button>

                {mobileOpen && (
                    <div className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
                        {filterContent}
                    </div>
                )}
            </div>

            <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-6 rounded-xl border bg-card p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold">Filters</h2>
                    {filterContent}
                </div>
            </aside>
        </>
    );
}
