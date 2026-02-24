import { Head, Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    BadgeCheckIcon,
    BuildingIcon,
    HomeIcon,
    MapPinIcon,
    SearchIcon,
    ShieldCheckIcon,
    StarIcon,
} from 'lucide-react';
import { useRef } from 'react';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { register } from '@/routes';
import type { Property } from '@/types';

interface Stats {
    total: number;
    for_rent: number;
    for_sale: number;
    counties: number;
}

export default function Welcome({
    canRegister = true,
    stats,
    featured = [],
}: {
    canRegister?: boolean;
    stats?: Stats;
    featured?: Property[];
}) {
    const { auth } = usePage().props as { auth: { user: object | null } };
    const searchRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = searchRef.current?.value ?? '';
        router.get('/properties', search ? { search } : {});
    };

    return (
        <PublicLayout>
            <Head title="DCH Properties — Find Your Perfect Home">
                <meta name="description" content="Browse thousands of properties for rent and sale across all Irish counties. Find houses, apartments, and more with powerful search and filter tools." />
                <meta property="og:title" content="DCH Properties — Find Your Perfect Home in Ireland" />
                <meta property="og:description" content="Search properties for rent and sale across Ireland. Apartments, houses, studios and more." />
                <meta property="og:type" content="website" />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background py-20 lg:py-32">
                <div className="container relative mx-auto max-w-7xl px-4 text-center">
                    <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                        <MapPinIcon className="size-3.5" aria-hidden="true" />
                        Properties across Ireland
                    </span>

                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Find Your Perfect
                        <br />
                        <span className="text-primary">Property in Ireland</span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
                        Browse thousands of properties for rent and sale across all Irish
                        counties. Find houses, apartments, and more with powerful search
                        and filter tools.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="mx-auto max-w-2xl" role="search" aria-label="Search properties">
                        <div className="flex gap-2 rounded-xl border bg-background p-2 shadow-lg">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <input
                                    ref={searchRef}
                                    type="search"
                                    placeholder="Search by county, town or address…"
                                    aria-label="Search properties"
                                    className="h-11 w-full rounded-lg bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <Button type="submit" size="lg" className="shrink-0">
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Quick county links */}
                    <nav className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm" aria-label="Browse by county">
                        <span className="text-muted-foreground">Quick:</span>
                        {['Dublin', 'Cork', 'Galway', 'Limerick', 'Wicklow'].map(
                            (county) => (
                                <Link
                                    key={county}
                                    href={`/properties?county=${county}`}
                                    className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
                                >
                                    {county}
                                </Link>
                            ),
                        )}
                    </nav>
                </div>
            </section>

            {/* Stats bar */}
            {stats && (
                <section className="border-y bg-muted/30 py-8" aria-label="Platform statistics">
                    <div className="container mx-auto max-w-7xl px-4">
                        <dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                            <div>
                                <dt className="text-sm text-muted-foreground">Total Properties</dt>
                                <dd className="mt-1 text-3xl font-bold text-foreground">
                                    {stats.total.toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">For Rent</dt>
                                <dd className="mt-1 text-3xl font-bold text-primary">
                                    {stats.for_rent.toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">For Sale</dt>
                                <dd className="mt-1 text-3xl font-bold text-orange-500">
                                    {stats.for_sale.toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Counties</dt>
                                <dd className="mt-1 text-3xl font-bold text-foreground">
                                    {stats.counties}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>
            )}

            {/* Featured Properties */}
            {featured.length > 0 && (
                <section className="py-16" aria-labelledby="featured-heading">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 id="featured-heading" className="text-2xl font-bold text-foreground">
                                    Featured Properties
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hand-picked listings across Ireland
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/properties?is_featured=1">View all</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {featured.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Browse by listing type */}
            <section className="py-16" aria-labelledby="browse-type-heading">
                <div className="container mx-auto max-w-7xl px-4">
                    <h2 id="browse-type-heading" className="mb-8 text-center text-2xl font-bold text-foreground">
                        Browse by Listing Type
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link
                            href="/properties?listing_type=rent"
                            className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <BuildingIcon className="size-6" aria-hidden="true" />
                            </div>
                            <h3 className="mb-1 text-xl font-semibold text-foreground">
                                Properties for Rent
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Apartments, houses, studios and more available to rent across Ireland.
                            </p>
                            {stats && (
                                <p className="mt-3 text-sm font-medium text-primary">
                                    {stats.for_rent} available →
                                </p>
                            )}
                        </Link>

                        <Link
                            href="/properties?listing_type=sale"
                            className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-900/30">
                                <HomeIcon className="size-6" aria-hidden="true" />
                            </div>
                            <h3 className="mb-1 text-xl font-semibold text-foreground">
                                Properties for Sale
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Find your dream home from our wide selection of properties for sale.
                            </p>
                            {stats && (
                                <p className="mt-3 text-sm font-medium text-orange-500">
                                    {stats.for_sale} available →
                                </p>
                            )}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="border-t bg-muted/20 py-16" aria-labelledby="features-heading">
                <div className="container mx-auto max-w-7xl px-4">
                    <h2 id="features-heading" className="mb-2 text-center text-2xl font-bold text-foreground">
                        Why Use DCH Properties?
                    </h2>
                    <p className="mb-10 text-center text-muted-foreground">
                        Everything you need to find the right property
                    </p>
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BadgeCheckIcon className="size-5" aria-hidden="true" />
                            </div>
                            <h3 className="mb-2 font-semibold text-foreground">Verified Listings</h3>
                            <p className="text-sm text-muted-foreground">
                                Every property listing is reviewed and verified before going live.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <SearchIcon className="size-5" aria-hidden="true" />
                            </div>
                            <h3 className="mb-2 font-semibold text-foreground">Advanced Search</h3>
                            <p className="text-sm text-muted-foreground">
                                Filter by county, price, property type, bedrooms and more to find exactly what you need.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ShieldCheckIcon className="size-5" aria-hidden="true" />
                            </div>
                            <h3 className="mb-2 font-semibold text-foreground">Secure Platform</h3>
                            <p className="text-sm text-muted-foreground">
                                Your data is safe with us. We use industry-standard security practices throughout.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA — guests only */}
            {!auth?.user && (
                <section className="py-16">
                    <div className="container mx-auto max-w-7xl px-4 text-center">
                        <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <StarIcon className="size-6" aria-hidden="true" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-foreground">
                            Ready to get started?
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Create a free account to save your favourite properties and receive alerts.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Button size="lg" asChild>
                                <Link href="/properties">Browse Properties</Link>
                            </Button>
                            {canRegister && (
                                <Button variant="outline" size="lg" asChild>
                                    <Link href={register()}>Create an Account</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
