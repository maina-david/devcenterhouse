import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    EditIcon,
    PlusIcon,
    Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedProperties, Property } from '@/types';

interface Props {
    properties: PaginatedProperties;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'All Properties', href: '/admin/properties' },
];

function formatPrice(property: Property): string {
    const price = Number(property.price).toLocaleString('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    });
    return property.listing_type === 'rent' ? `${price}/mo` : price;
}

function StatusBadge({ status }: { status: Property['status'] }) {
    const map = {
        active:   'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400',
        inactive: 'border-muted bg-muted text-muted-foreground',
        sold:     'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400',
        let:      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400',
    } as const;

    return (
        <Badge variant="outline" className={map[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

export default function AdminPropertyIndex({ properties }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (property: Property) => {
        if (!confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
        setDeleting(property.id);
        router.delete(`/admin/properties/${property.id}`, {
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Properties" />

            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">All Properties</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {properties.total} listing{properties.total !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/properties/create" className="gap-2">
                            <PlusIcon className="size-4" aria-hidden="true" />
                            Add Property
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Listings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {properties.data.length === 0 ? (
                                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                                    No properties found.
                                </p>
                            ) : (
                                properties.data.map((property) => (
                                    <div key={property.id} className="flex items-center gap-4 px-6 py-4">
                                        {/* Thumbnail */}
                                        <img
                                            src={property.images?.[0] ?? 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120'}
                                            alt={property.title}
                                            className="size-14 shrink-0 rounded-lg object-cover"
                                        />

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/properties/${property.id}/${property.slug}`}
                                                className="truncate font-medium text-foreground hover:text-primary"
                                            >
                                                {property.title}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {property.property_type} · {property.county} · {property.bedrooms} bed
                                            </p>
                                        </div>

                                        {/* Status + type badges */}
                                        <div className="hidden items-center gap-2 sm:flex">
                                            <StatusBadge status={property.status} />
                                            <Badge
                                                variant="outline"
                                                className={property.listing_type === 'rent'
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400'}
                                            >
                                                {property.listing_type === 'rent' ? 'Rent' : 'Sale'}
                                            </Badge>
                                        </div>

                                        {/* Price */}
                                        <span className="hidden w-24 text-right text-sm font-semibold text-primary md:block">
                                            {formatPrice(property)}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex shrink-0 gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                aria-label={`Edit ${property.title}`}
                                            >
                                                <Link href={`/admin/properties/${property.id}/edit`}>
                                                    <EditIcon className="size-4" aria-hidden="true" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(property)}
                                                disabled={deleting === property.id}
                                                aria-label={`Delete ${property.title}`}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2Icon className="size-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Simple pagination */}
                {properties.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {properties.from}–{properties.to} of {properties.total}
                        </span>
                        <div className="flex gap-2">
                            {properties.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/properties', { page: properties.current_page - 1 }, { preserveState: true })}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeftIcon className="size-4" aria-hidden="true" />
                                </Button>
                            )}
                            {properties.current_page < properties.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/properties', { page: properties.current_page + 1 }, { preserveState: true })}
                                    aria-label="Next page"
                                >
                                    <ChevronRightIcon className="size-4" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
