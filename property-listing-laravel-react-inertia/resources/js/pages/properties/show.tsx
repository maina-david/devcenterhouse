import { Head, Link, router } from '@inertiajs/react';
import {
    BathIcon,
    BedDoubleIcon,
    CalendarIcon,
    CheckIcon,
    ChevronLeftIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    RulerIcon,
    SendIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';
import type { Property } from '@/types';

interface Props {
    property: Property;
    related: Property[];
}

interface EnquiryForm {
    [key: string]: string;
    name: string;
    email: string;
    phone: string;
    message: string;
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
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('-');
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Immediately';
    return new Date(dateStr).toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function EnquiryModal({
    property,
    onClose,
}: {
    property: Property;
    onClose: () => void;
}) {
    const [form, setForm] = useState<EnquiryForm>({
        name: '',
        email: '',
        phone: '',
        message: `Hi, I'm interested in "${property.title}" and would like more information.`,
    });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSending(true);
        router.post(
            `/properties/${property.id}/enquiry`,
            form,
            {
                preserveState: true,
                onSuccess: () => setSent(true),
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                        Send Enquiry
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                        {property.title}
                    </span>
                    {' '}· {property.town}, {property.county}
                </p>

                {sent ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <CheckIcon className="size-7 text-primary" />
                        </div>
                        <p className="font-semibold text-foreground">
                            Enquiry Sent!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            We'll be in touch within 24 hours.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="mt-2"
                        >
                            Close
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <Input
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Your email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            required
                        />
                        <Input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                        />
                        <textarea
                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Message"
                            value={form.message}
                            onChange={(e) =>
                                setForm({ ...form, message: e.target.value })
                            }
                            required
                        />
                        <Button type="submit" disabled={sending} className="gap-2">
                            <SendIcon className="size-4" />
                            {sending ? 'Sending…' : 'Send Enquiry'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function PropertyShow({ property, related }: Props) {
    const [activeImage, setActiveImage] = useState(0);
    const [enquiryOpen, setEnquiryOpen] = useState(false);

    const images =
        property.images?.length > 0
            ? property.images
            : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'];

    return (
        <PublicLayout>
            <Head title={property.title}>
                <meta name="description" content={
                    property.description
                        ? property.description.slice(0, 160)
                        : `${formatPropertyType(property.property_type)} for ${property.listing_type} in ${property.town}, ${property.county}. ${property.bedrooms} bed, ${property.bathrooms} bath. ${formatPrice(property)}.`
                } />
                <meta property="og:title" content={property.title} />
                <meta property="og:description" content={
                    `${formatPropertyType(property.property_type)} for ${property.listing_type} in ${property.town}, ${property.county} — ${formatPrice(property)}`
                } />
                <meta property="og:type" content="article" />
                {property.images?.[0] && (
                    <meta property="og:image" content={property.images[0]} />
                )}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <link rel="canonical" href={`/properties/${property.id}/${property.slug}`} />
            </Head>

            {enquiryOpen && (
                <EnquiryModal
                    property={property}
                    onClose={() => setEnquiryOpen(false)}
                />
            )}

            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Back breadcrumb */}
                <div className="mb-4">
                    <Link
                        href="/properties"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeftIcon className="size-4" />
                        Back to Properties
                    </Link>
                </div>

                {/* Image gallery */}
                <div className="mb-8 grid gap-2 lg:grid-cols-[2fr_1fr]">
                    {/* Main image */}
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                        <img
                            src={images[activeImage]}
                            alt={property.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Thumbnail column */}
                    <div className="hidden flex-col gap-2 lg:flex">
                        {images.slice(1, 4).map((src, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i + 1)}
                                className={`flex-1 overflow-hidden rounded-xl bg-muted transition-opacity ${
                                    activeImage === i + 1
                                        ? 'ring-2 ring-primary ring-offset-2'
                                        : 'opacity-80 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={src}
                                    alt={`${property.title} - photo ${i + 2}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Mobile thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto lg:hidden">
                            {images.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity ${
                                        activeImage === i
                                            ? 'ring-2 ring-primary ring-offset-1'
                                            : 'opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main content grid */}
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Left: property details */}
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
                                        property.listing_type === 'rent'
                                            ? 'bg-primary'
                                            : 'bg-orange-500'
                                    }`}
                                >
                                    {property.listing_type === 'rent'
                                        ? 'For Rent'
                                        : 'For Sale'}
                                </span>
                                <Badge variant="secondary">
                                    {formatPropertyType(property.property_type)}
                                </Badge>
                                {property.is_featured && (
                                    <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            <h1 className="mb-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                                {property.title}
                            </h1>

                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPinIcon className="size-4 shrink-0" />
                                {property.address}, {property.town},{' '}
                                {property.county}
                                {property.eircode && (
                                    <span className="ml-1 font-mono text-sm">
                                        {property.eircode}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Key stats */}
                        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <BedDoubleIcon className="size-5 text-primary" />
                                <span className="text-lg font-bold text-foreground">
                                    {property.bedrooms}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Bedroom{property.bedrooms !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <BathIcon className="size-5 text-primary" />
                                <span className="text-lg font-bold text-foreground">
                                    {property.bathrooms}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Bathroom{property.bathrooms !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {property.area_sqft && (
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <RulerIcon className="size-5 text-primary" />
                                    <span className="text-lg font-bold text-foreground">
                                        {property.area_sqft.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Sq Ft
                                    </span>
                                </div>
                            )}
                            {property.listing_type === 'rent' &&
                                property.available_from && (
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <CalendarIcon className="size-5 text-primary" />
                                        <span className="text-sm font-bold text-foreground">
                                            {formatDate(property.available_from)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Available
                                        </span>
                                    </div>
                                )}
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div>
                                <h2 className="mb-3 text-lg font-semibold text-foreground">
                                    About this property
                                </h2>
                                <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* Features */}
                        {property.features?.length > 0 && (
                            <div>
                                <h2 className="mb-3 text-lg font-semibold text-foreground">
                                    Features &amp; Amenities
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {property.features.map((feature) => (
                                        <span
                                            key={feature}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-sm font-medium text-primary"
                                        >
                                            <CheckIcon className="size-3.5" />
                                            {feature
                                                .split('_')
                                                .map(
                                                    (w) =>
                                                        w.charAt(0).toUpperCase() +
                                                        w.slice(1),
                                                )
                                                .join(' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: price + CTA card */}
                    <div className="flex flex-col gap-4">
                        <div className="sticky top-6 rounded-2xl border bg-card p-6 shadow-sm">
                            {/* Price */}
                            <p className="mb-1 text-3xl font-bold text-primary">
                                {formatPrice(property)}
                            </p>
                            <p className="mb-5 text-sm text-muted-foreground">
                                {property.listing_type === 'rent'
                                    ? 'Monthly rent'
                                    : 'Sale price'}
                            </p>

                            {/* CTA buttons */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full gap-2"
                                >
                                    <a href="tel:+35312345678">
                                        <PhoneIcon className="size-4" />
                                        Call Agent
                                    </a>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => setEnquiryOpen(true)}
                                >
                                    <MailIcon className="size-4" />
                                    Send Enquiry
                                </Button>
                            </div>

                            <hr className="my-5 border-border" />

                            {/* Property meta */}
                            <dl className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">
                                        Property Type
                                    </dt>
                                    <dd className="font-medium text-foreground">
                                        {formatPropertyType(property.property_type)}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">County</dt>
                                    <dd className="font-medium text-foreground">
                                        {property.county}
                                    </dd>
                                </div>
                                {property.eircode && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Eircode
                                        </dt>
                                        <dd className="font-mono font-medium text-foreground">
                                            {property.eircode}
                                        </dd>
                                    </div>
                                )}
                                {property.listing_type === 'rent' && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Available From
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {formatDate(property.available_from)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Similar properties */}
                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-5 text-xl font-semibold text-foreground">
                            Similar Properties
                        </h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/properties/${p.id}/${p.slug}`}
                                    className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="aspect-4/3 overflow-hidden bg-muted">
                                        <img
                                            src={
                                                p.images?.[0] ??
                                                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
                                            }
                                            alt={p.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 p-4">
                                        <p className="text-lg font-bold text-primary">
                                            {formatPrice(p)}
                                        </p>
                                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                                            {p.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {p.town}, {p.county}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <BedDoubleIcon className="size-3.5" />
                                                {p.bedrooms}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BathIcon className="size-3.5" />
                                                {p.bathrooms}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
