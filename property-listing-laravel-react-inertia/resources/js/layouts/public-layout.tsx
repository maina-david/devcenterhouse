import { Link, usePage } from '@inertiajs/react';
import { HomeIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { dashboard, login, register } from '@/routes';

export default function PublicLayout({ children }: PropsWithChildren) {
    useFlashToast();

    const { auth, canRegister } = usePage().props as {
        auth: { user: object | null };
        canRegister?: boolean;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Shared header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <HomeIcon className="size-5" />
                        </div>
                        <span className="font-semibold text-foreground">
                            DCH Properties
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="flex items-center gap-4 text-sm">
                        <Link
                            href="/properties"
                            className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                            Browse Properties
                        </Link>

                        {auth?.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister !== false && (
                                    <Button size="sm" asChild>
                                        <Link href={register()}>Register</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Page content */}
            <main>{children}</main>

            {/* Shared footer */}
            <footer className="mt-auto border-t py-8">
                <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} DCH Properties. All rights reserved.
                </div>
            </footer>

            <Toaster richColors position="top-right" />
        </div>
    );
}
