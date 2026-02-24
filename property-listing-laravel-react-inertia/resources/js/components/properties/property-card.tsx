import { Link } from '@inertiajs/react';
import { BathIcon, BedDoubleIcon, MailIcon, PhoneIcon, RulerIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';

interface PropertyCardProps {
    property: Property;
}

function formatPrice(property: Property): string {
    const price = Number(property.price).toLocaleString('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    });

    if (property.listing_type === 'rent') {
        const period = property.price_period === 'per_week' ? '/wk' : '/mo';
        return `${price}${period}`;
    }

    return price;
}

function formatPropertyType(type: string): string {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
}

export function PropertyCard({ property }: PropertyCardProps) {
    const mainImage =
        property.images?.[0] ??
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';

    const detailHref = `/properties/${property.id}/${property.slug}`;

    return (
        // Outer card is a plain div — no nested <a> issue
        <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
            {/* Image — entire image area links to detail */}
            <Link href={detailHref} className="relative block aspect-4/3 overflow-hidden bg-muted" tabIndex={-1} aria-hidden="true">
                <img
                    src={mainImage}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Badges overlay */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    {property.is_featured && (
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                            Featured
                        </Badge>
                    )}
                    <Badge
                        variant="secondary"
                        className={property.is_featured ? '' : 'ml-auto'}
                    >
                        {formatPropertyType(property.property_type)}
                    </Badge>
                </div>

                {/* Listing type pill */}
                <div className="absolute bottom-3 left-3">
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
                            property.listing_type === 'rent'
                                ? 'bg-primary'
                                : 'bg-orange-500'
                        }`}
                    >
                        {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                </div>
            </Link>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Price */}
                <p className="text-xl font-bold text-primary">
                    {formatPrice(property)}
                </p>

                {/* Title — links to detail */}
                <Link href={detailHref}>
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary">
                        {property.title}
                    </h3>
                </Link>

                {/* Location */}
                <p className="text-sm text-muted-foreground">
                    {property.town}, {property.county}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5" aria-label={`${property.bedrooms} bedrooms`}>
                        <BedDoubleIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{property.bedrooms}</span>
                    </span>
                    <span className="flex items-center gap-1.5" aria-label={`${property.bathrooms} bathrooms`}>
                        <BathIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{property.bathrooms}</span>
                    </span>
                    {property.area_sqft && (
                        <span className="flex items-center gap-1.5" aria-label={`${property.area_sqft} square feet`}>
                            <RulerIcon className="size-4 shrink-0" aria-hidden="true" />
                            <span>{property.area_sqft.toLocaleString()} ft²</span>
                        </span>
                    )}
                </div>

                {/* Action buttons — kept outside the image Link to avoid nested <a> */}
                <div className="mt-auto flex gap-2 pt-1">
                    <a
                        href="tel:+35312345678"
                        aria-label={`Call about ${property.title}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                        <PhoneIcon className="size-3.5" aria-hidden="true" />
                        Call
                    </a>
                    <Link
                        href={`${detailHref}#enquiry`}
                        aria-label={`Enquire about ${property.title}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        <MailIcon className="size-3.5" aria-hidden="true" />
                        Enquire
                    </Link>
                </div>
            </div>
        </div>
    );
}
