import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PropertyForm from '@/components/properties/property-form';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Properties', href: '/admin/properties' },
    { title: 'Add New', href: '/admin/properties/create' },
];

export default function CreateProperty() {
    const { processing, errors } = useForm({});

    const handleSubmit = (data: Record<string, unknown>) => {
        router.post('/admin/properties', data as Parameters<typeof router.post>[1]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Property" />

            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Add New Property</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Fill in the details below to create a new property listing.
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <PropertyForm
                        onSubmit={handleSubmit}
                        submitLabel="Create Listing"
                        processing={processing}
                        errors={errors}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
