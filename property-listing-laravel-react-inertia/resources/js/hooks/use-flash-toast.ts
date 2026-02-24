import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Reads Inertia flash messages and fires Sonner toasts automatically.
 * Drop this into any layout or page component once.
 *
 * Laravel controller usage:
 *   return back()->with('success', 'Done!');
 *   return back()->with('error', 'Something went wrong.');
 *   return back()->with('info', 'Note: ...');
 */
export function useFlashToast(): void {
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
            info?: string;
            warning?: string;
        };
    };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
        if (flash?.info)    toast.info(flash.info);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);
}
