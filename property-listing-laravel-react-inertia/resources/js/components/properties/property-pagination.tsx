import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginatedProperties } from '@/types';

interface PropertyPaginationProps {
    meta: PaginatedProperties;
}

export function PropertyPagination({ meta }: PropertyPaginationProps) {
    if (meta.last_page <= 1) return null;

    return (
        <nav
            className="mt-8 flex items-center justify-between"
            aria-label="Pagination"
        >
            {/* Results count */}
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium">{meta.from ?? 0}</span>–
                <span className="font-medium">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium">{meta.total}</span> properties
            </p>

            {/* Page links */}
            <div className="flex items-center gap-1">
                {/* Previous */}
                {meta.prev_page_url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={meta.prev_page_url} preserveScroll>
                            <ChevronLeftIcon className="size-4" />
                            <span className="sr-only">Previous</span>
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeftIcon className="size-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                )}

                {/* Page numbers — show at most 7 links */}
                {meta.links
                    .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                    .map((link, i) => {
                        const isEllipsis = link.label === '...';

                        if (isEllipsis) {
                            return (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-sm text-muted-foreground"
                                >
                                    …
                                </span>
                            );
                        }

                        return link.url ? (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={link.url} preserveScroll>
                                    {link.label}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled
                            >
                                {link.label}
                            </Button>
                        );
                    })}

                {/* Next */}
                {meta.next_page_url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={meta.next_page_url} preserveScroll>
                            <ChevronRightIcon className="size-4" />
                            <span className="sr-only">Next</span>
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronRightIcon className="size-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                )}
            </div>
        </nav>
    );
}
