import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    BellIcon,
    BuildingIcon,
    HomeIcon,
    ListIcon,
    MailIcon,
    PlusIcon,
    StarIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import '@/lib/echo';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    total: number;
    for_rent: number;
    for_sale: number;
    featured: number;
}

interface RecentProperty {
    id: number;
    title: string;
    listing_type: 'rent' | 'sale';
    property_type: string;
    price: number;
    price_period: 'per_month' | 'per_week' | 'per_year' | null;
    county: string;
    bedrooms: number;
    created_at: string;
}

interface RecentEnquiry {
    id: number;
    property_id: number;
    property: { id: number; title: string; slug: string };
    name: string;
    email: string;
    is_read: boolean;
    created_at: string;
}

interface Props {
    stats: Stats;
    recent_properties: RecentProperty[];
    recent_enquiries: RecentEnquiry[];
    unread_enquiry_count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
];

function formatPrice(property: RecentProperty): string {
    const price = Number(property.price).toLocaleString('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    });
    if (property.listing_type === 'rent') {
        return `${price}/mo`;
    }
    return price;
}

function formatPropertyType(type: string): string {
    return type
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('-');
}

export default function Dashboard({ stats, recent_properties, recent_enquiries, unread_enquiry_count }: Props) {
    const { auth } = usePage().props as { auth: { user: { id: number } | null } };
    const [liveEnquiryCount, setLiveEnquiryCount] = useState(unread_enquiry_count);

    // Subscribe to real-time enquiry notifications via Reverb
    useEffect(() => {
        if (!auth?.user) return;

        const channel = window.Echo?.private('admin.enquiries');
        if (!channel) return;

        channel.listen('.EnquiryReceived', (data: {
            name: string;
            property: { title: string; id: number; slug: string };
        }) => {
            setLiveEnquiryCount((c) => c + 1);
            toast.info(
                `New enquiry from ${data.name}`,
                {
                    description: `Re: ${data.property.title}`,
                    action: {
                        label: 'View',
                        onClick: () => { window.location.href = '/admin/enquiries'; },
                    },
                    icon: <BellIcon className="size-4" />,
                    duration: 8000,
                },
            );
        });

        return () => {
            window.Echo?.leave('admin.enquiries');
        };
    }, [auth?.user]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Properties
                            </CardTitle>
                            <ListIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {stats.total.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Active listings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                For Rent
                            </CardTitle>
                            <BuildingIcon className="size-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">
                                {stats.for_rent.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Rental listings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                For Sale
                            </CardTitle>
                            <HomeIcon className="size-4 text-orange-500" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-500">
                                {stats.for_sale.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Sale listings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Featured
                            </CardTitle>
                            <StarIcon className="size-4 text-amber-500" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-600">
                                {stats.featured.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Featured listings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent properties table */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    Recent Listings
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/properties" className="gap-1.5 text-xs">
                                        Manage all
                                        <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {recent_properties.length === 0 ? (
                                        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                            No properties yet.
                                        </p>
                                    ) : (
                                        recent_properties.map((property) => (
                                            <div
                                                key={property.id}
                                                className="flex items-center justify-between px-6 py-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {property.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatPropertyType(property.property_type)} · {property.county} · {property.bedrooms} bed
                                                    </p>
                                                </div>
                                                <div className="ml-4 flex shrink-0 items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            property.listing_type === 'rent'
                                                                ? 'border-primary/30 bg-primary/10 text-primary'
                                                                : 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400'
                                                        }
                                                    >
                                                        {property.listing_type === 'rent' ? 'Rent' : 'Sale'}
                                                    </Badge>
                                                    <span className="text-sm font-semibold text-primary">
                                                        {formatPrice(property)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                        {/* Quick actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/admin/properties/create">
                                        <PlusIcon className="size-4" aria-hidden="true" />
                                        Add New Property
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/admin/properties">
                                        <ListIcon className="size-4" aria-hidden="true" />
                                        Manage Listings
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/admin/enquiries">
                                        <MailIcon className="size-4" aria-hidden="true" />
                                        <span className="flex-1 text-left">Enquiries</span>
                                        {liveEnquiryCount > 0 && (
                                            <Badge className="ml-auto bg-primary text-primary-foreground">
                                                {liveEnquiryCount}
                                            </Badge>
                                        )}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/properties?listing_type=rent">
                                        <BuildingIcon className="size-4" aria-hidden="true" />
                                        For Rent
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/properties?listing_type=sale">
                                        <HomeIcon className="size-4" aria-hidden="true" />
                                        For Sale
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href="/properties?is_featured=1">
                                        <StarIcon className="size-4" aria-hidden="true" />
                                        Featured
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Breakdown bars */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Listing Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {[
                                    { label: 'For Rent', count: stats.for_rent, color: 'bg-primary' },
                                    { label: 'For Sale', count: stats.for_sale, color: 'bg-orange-500' },
                                    { label: 'Featured', count: stats.featured, color: 'bg-amber-500' },
                                ].map(({ label, count, color }) => {
                                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                    return (
                                        <div key={label}>
                                            <div className="mb-1 flex justify-between text-xs">
                                                <span className="text-muted-foreground">{label}</span>
                                                <span className="font-medium">{pct}%</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${color}`}
                                                    style={{ width: `${pct}%` }}
                                                    role="progressbar"
                                                    aria-valuenow={pct}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`${label}: ${pct}%`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent enquiries */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold">Recent Enquiries</CardTitle>
                            {liveEnquiryCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground">
                                    {liveEnquiryCount} unread
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/enquiries" className="gap-1.5 text-xs">
                                View all
                                <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recent_enquiries.length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No enquiries yet.
                                </p>
                            ) : (
                                recent_enquiries.map((enquiry) => (
                                    <div
                                        key={enquiry.id}
                                        className={`flex items-center justify-between px-6 py-3 ${!enquiry.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    {enquiry.name}
                                                </p>
                                                {!enquiry.is_read && (
                                                    <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
                                                )}
                                            </div>
                                            <Link
                                                href={`/properties/${enquiry.property_id}/${enquiry.property.slug}`}
                                                className="truncate text-xs text-muted-foreground hover:text-primary"
                                            >
                                                Re: {enquiry.property.title}
                                            </Link>
                                        </div>
                                        <div className="ml-4 flex shrink-0 items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(enquiry.created_at).toLocaleDateString('en-IE', {
                                                    day: 'numeric', month: 'short',
                                                })}
                                            </span>
                                            <Button variant="ghost" size="sm" asChild aria-label={`Reply to ${enquiry.name}`}>
                                                <a href={`mailto:${enquiry.email}`}>
                                                    <MailIcon className="size-3.5" aria-hidden="true" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
