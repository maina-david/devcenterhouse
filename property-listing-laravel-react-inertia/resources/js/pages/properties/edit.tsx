import { Head, router } from '@inertiajs/react';
import PropertyForm from '@/components/properties/property-form';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Property } from '@/types';

interface Props {
    property: Property;
}

export default function EditProperty({ property }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Properties', href: '/admin/properties' },
        { title: property.title, href: `/properties/${property.id}/${property.slug}` },
        { title: 'Edit', href: `/admin/properties/${property.id}/edit` },
    ];

    const handleSubmit = (data: Record<string, unknown>) => {
        router.put(`/admin/properties/${property.id}`, data as Parameters<typeof router.put>[1]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit — ${property.title}`} />

            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Edit Property</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the listing details below.
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <PropertyForm
                        property={property}
                        onSubmit={handleSubmit}
                        submitLabel="Save Changes"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
