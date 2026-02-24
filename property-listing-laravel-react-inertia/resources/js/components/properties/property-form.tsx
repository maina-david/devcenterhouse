import { useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Property } from '@/types';

type PropertyFormData = {
    title: string;
    slug: string;
    description: string;
    listing_type: string;
    property_type: string;
    status: string;
    price: string;
    price_period: string;
    bedrooms: string;
    bathrooms: string;
    area_sqft: string;
    address: string;
    town: string;
    county: string;
    eircode: string;
    images: string[];
    features: string[];
    is_featured: boolean;
    available_from: string;
};

interface Props {
    property?: Property;
    onSubmit: (data: PropertyFormData) => void;
    submitLabel?: string;
    processing?: boolean;
    errors?: Partial<Record<keyof PropertyFormData | 'images.*' | 'features.*', string>>;
}

function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function PropertyForm({ property, onSubmit, submitLabel = 'Save', processing = false, errors = {} }: Props) {
    const { data, setData, errors: formErrors } = useForm<PropertyFormData>({
        title:          property?.title          ?? '',
        slug:           property?.slug           ?? '',
        description:    property?.description    ?? '',
        listing_type:   property?.listing_type   ?? 'rent',
        property_type:  property?.property_type  ?? 'apartment',
        status:         property?.status         ?? 'active',
        price:          property ? String(property.price) : '',
        price_period:   property?.price_period   ?? 'per_month',
        bedrooms:       property ? String(property.bedrooms) : '',
        bathrooms:      property ? String(property.bathrooms) : '',
        area_sqft:      property?.area_sqft ? String(property.area_sqft) : '',
        address:        property?.address        ?? '',
        town:           property?.town           ?? '',
        county:         property?.county         ?? '',
        eircode:        property?.eircode        ?? '',
        images:         property?.images         ?? [''],
        features:       property?.features       ?? [],
        is_featured:    property?.is_featured    ?? false,
        available_from: property?.available_from ?? '',
    });

    // Auto-generate slug from title if creating (no existing property)
    useEffect(() => {
        if (!property) {
            setData('slug', slugify(data.title));
        }
    }, [data.title, property, setData]);

    const combinedErrors = { ...formErrors, ...errors };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    const addImage = () => setData('images', [...data.images, '']);
    const removeImage = (i: number) => setData('images', data.images.filter((_, idx) => idx !== i));
    const updateImage = (i: number, val: string) => {
        const imgs = [...data.images];
        imgs[i] = val;
        setData('images', imgs);
    };

    const addFeature = () => setData('features', [...data.features, '']);
    const removeFeature = (i: number) => setData('features', data.features.filter((_, idx) => idx !== i));
    const updateFeature = (i: number, val: string) => {
        const feats = [...data.features];
        feats[i] = val;
        setData('features', feats);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic info */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="3 Bedroom Semi-Detached in Sandymount"
                            aria-required="true"
                        />
                        {combinedErrors.title && <p className="text-xs text-destructive">{combinedErrors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="slug">Slug <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                            placeholder="3-bedroom-semi-detached-sandymount"
                        />
                        {combinedErrors.slug && <p className="text-xs text-destructive">{combinedErrors.slug}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        placeholder="Describe the property…"
                        rows={5}
                    />
                </div>
            </section>

            {/* Listing details */}
            <section className="space-y-4 border-t pt-6">
                <h2 className="text-base font-semibold text-foreground">Listing Details</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="listing_type">Listing Type <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Select value={data.listing_type} onValueChange={v => setData('listing_type', v)}>
                            <SelectTrigger id="listing_type" aria-label="Listing type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rent">For Rent</SelectItem>
                                <SelectItem value="sale">For Sale</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="property_type">Property Type <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Select value={data.property_type} onValueChange={v => setData('property_type', v)}>
                            <SelectTrigger id="property_type" aria-label="Property type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['house','apartment','flat','studio','bungalow','duplex','terraced','semi-detached','detached'].map(t => (
                                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="status">Status <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Select value={data.status} onValueChange={v => setData('status', v)}>
                            <SelectTrigger id="status" aria-label="Listing status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="let">Let</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="price">Price (€) <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            placeholder="2500"
                            aria-required="true"
                        />
                        {combinedErrors.price && <p className="text-xs text-destructive">{combinedErrors.price}</p>}
                    </div>

                    {data.listing_type === 'rent' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="price_period">Price Period</Label>
                            <Select value={data.price_period} onValueChange={v => setData('price_period', v)}>
                                <SelectTrigger id="price_period" aria-label="Price period">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per_month">Per Month</SelectItem>
                                    <SelectItem value="per_week">Per Week</SelectItem>
                                    <SelectItem value="per_year">Per Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </section>

            {/* Property specs */}
            <section className="space-y-4 border-t pt-6">
                <h2 className="text-base font-semibold text-foreground">Property Specs</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="bedrooms">Bedrooms <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="bedrooms"
                            type="number"
                            min="0"
                            max="20"
                            value={data.bedrooms}
                            onChange={e => setData('bedrooms', e.target.value)}
                            aria-required="true"
                        />
                        {combinedErrors.bedrooms && <p className="text-xs text-destructive">{combinedErrors.bedrooms}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="bathrooms">Bathrooms <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="bathrooms"
                            type="number"
                            min="0"
                            max="20"
                            value={data.bathrooms}
                            onChange={e => setData('bathrooms', e.target.value)}
                            aria-required="true"
                        />
                        {combinedErrors.bathrooms && <p className="text-xs text-destructive">{combinedErrors.bathrooms}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="area_sqft">Area (sq ft)</Label>
                        <Input
                            id="area_sqft"
                            type="number"
                            min="0"
                            value={data.area_sqft}
                            onChange={e => setData('area_sqft', e.target.value)}
                            placeholder="850"
                        />
                    </div>
                </div>
            </section>

            {/* Location */}
            <section className="space-y-4 border-t pt-6">
                <h2 className="text-base font-semibold text-foreground">Location</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="address">Address <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            placeholder="14 Strand Road"
                            aria-required="true"
                        />
                        {combinedErrors.address && <p className="text-xs text-destructive">{combinedErrors.address}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="town">Town <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="town"
                            value={data.town}
                            onChange={e => setData('town', e.target.value)}
                            placeholder="Sandymount"
                            aria-required="true"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="county">County <span aria-hidden="true" className="text-destructive">*</span></Label>
                        <Input
                            id="county"
                            value={data.county}
                            onChange={e => setData('county', e.target.value)}
                            placeholder="Dublin"
                            aria-required="true"
                        />
                        {combinedErrors.county && <p className="text-xs text-destructive">{combinedErrors.county}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="eircode">Eircode</Label>
                        <Input
                            id="eircode"
                            value={data.eircode}
                            onChange={e => setData('eircode', e.target.value)}
                            placeholder="D04 Y2K3"
                        />
                    </div>
                </div>

                {data.listing_type === 'rent' && (
                    <div className="space-y-1.5">
                        <Label htmlFor="available_from">Available From</Label>
                        <Input
                            id="available_from"
                            type="date"
                            value={data.available_from}
                            onChange={e => setData('available_from', e.target.value)}
                        />
                    </div>
                )}
            </section>

            {/* Images */}
            <section className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Images <span aria-hidden="true" className="text-destructive">*</span></h2>
                    <Button type="button" variant="outline" size="sm" onClick={addImage} className="gap-1.5">
                        <PlusIcon className="size-3.5" aria-hidden="true" />
                        Add Image URL
                    </Button>
                </div>
                <div className="space-y-2">
                    {data.images.map((img, i) => (
                        <div key={i} className="flex gap-2">
                            <Input
                                value={img}
                                onChange={e => updateImage(i, e.target.value)}
                                placeholder="https://images.unsplash.com/photo-…"
                                aria-label={`Image URL ${i + 1}`}
                            />
                            {data.images.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(i)}
                                    aria-label={`Remove image ${i + 1}`}
                                >
                                    <TrashIcon className="size-4 text-destructive" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                {combinedErrors.images && <p className="text-xs text-destructive">{combinedErrors.images}</p>}
            </section>

            {/* Features / Amenities */}
            <section className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Features &amp; Amenities</h2>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature} className="gap-1.5">
                        <PlusIcon className="size-3.5" aria-hidden="true" />
                        Add Feature
                    </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {data.features.map((feat, i) => (
                        <div key={i} className="flex gap-2">
                            <Input
                                value={feat}
                                onChange={e => updateFeature(i, e.target.value)}
                                placeholder="e.g. parking, garden, pet_friendly"
                                aria-label={`Feature ${i + 1}`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeature(i)}
                                aria-label={`Remove feature ${i + 1}`}
                            >
                                <TrashIcon className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                        </div>
                    ))}
                    {data.features.length === 0 && (
                        <p className="text-sm text-muted-foreground">No features added yet.</p>
                    )}
                </div>
            </section>

            {/* Featured toggle */}
            <section className="space-y-2 border-t pt-6">
                <div className="flex items-center gap-3">
                    <input
                        id="is_featured"
                        type="checkbox"
                        checked={data.is_featured}
                        onChange={e => setData('is_featured', e.target.checked)}
                        className="size-4 rounded border-input"
                        aria-label="Mark as featured listing"
                    />
                    <Label htmlFor="is_featured" className="cursor-pointer">
                        Featured listing
                        <span className="ml-1 text-xs text-muted-foreground">(highlighted on homepage and search)</span>
                    </Label>
                </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={processing} size="lg">
                    {processing ? 'Saving…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
