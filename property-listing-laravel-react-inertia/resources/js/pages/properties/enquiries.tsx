import { Head, Link, router } from '@inertiajs/react';
import { CheckCheckIcon, ChevronLeftIcon, ChevronRightIcon, MailOpenIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface EnquiryProperty {
    id: number;
    title: string;
    slug: string;
}

interface Enquiry {
    id: number;
    property_id: number;
    property: EnquiryProperty;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    is_read: boolean;
    created_at: string;
}

interface PaginatedEnquiries {
    data: Enquiry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    enquiries: PaginatedEnquiries;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Enquiries', href: '/admin/enquiries' },
];

export default function AdminEnquiries({ enquiries }: Props) {
    const markRead = (id: number) => {
        router.patch(`/admin/enquiries/${id}/read`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enquiries" />

            <div className="p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {enquiries.total} total · {enquiries.data.filter(e => !e.is_read).length} unread on this page
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">All Enquiries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {enquiries.data.length === 0 ? (
                                <div className="flex flex-col items-center px-6 py-16 text-center">
                                    <MailOpenIcon className="mb-3 size-10 text-muted-foreground/40" aria-hidden="true" />
                                    <p className="text-sm text-muted-foreground">No enquiries yet.</p>
                                </div>
                            ) : (
                                enquiries.data.map((enquiry) => (
                                    <div
                                        key={enquiry.id}
                                        className={`flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:gap-4 ${
                                            !enquiry.is_read ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        {/* Unread dot */}
                                        <div className="mt-1 shrink-0">
                                            {!enquiry.is_read ? (
                                                <span className="block size-2.5 rounded-full bg-primary" aria-label="Unread" />
                                            ) : (
                                                <span className="block size-2.5 rounded-full bg-transparent" aria-hidden="true" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-foreground">{enquiry.name}</span>
                                                <span className="text-xs text-muted-foreground">{enquiry.email}</span>
                                                {enquiry.phone && (
                                                    <span className="text-xs text-muted-foreground">{enquiry.phone}</span>
                                                )}
                                                {!enquiry.is_read && (
                                                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <Link
                                                href={`/properties/${enquiry.property_id}/${enquiry.property.slug}`}
                                                className="mt-0.5 block text-sm text-muted-foreground hover:text-primary"
                                            >
                                                Re: {enquiry.property.title}
                                            </Link>
                                            <p className="mt-2 text-sm text-foreground">{enquiry.message}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(enquiry.created_at).toLocaleString('en-IE', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                aria-label={`Reply to ${enquiry.name}`}
                                            >
                                                <a href={`mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(enquiry.property.title)}`}>
                                                    Reply
                                                </a>
                                            </Button>
                                            {!enquiry.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markRead(enquiry.id)}
                                                    aria-label="Mark as read"
                                                >
                                                    <CheckCheckIcon className="size-4" aria-hidden="true" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {enquiries.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {enquiries.from}–{enquiries.to} of {enquiries.total}</span>
                        <div className="flex gap-2">
                            {enquiries.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/enquiries', { page: enquiries.current_page - 1 }, { preserveState: true })}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeftIcon className="size-4" aria-hidden="true" />
                                </Button>
                            )}
                            {enquiries.current_page < enquiries.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/enquiries', { page: enquiries.current_page + 1 }, { preserveState: true })}
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
