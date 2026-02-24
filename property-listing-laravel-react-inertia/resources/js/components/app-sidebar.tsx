import { Link, usePage } from '@inertiajs/react';
import { BuildingIcon, LayoutGrid, MailIcon, PlusIcon, Settings2Icon } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

function useNavItems(): NavItem[] {
    const { unread_enquiry_count } = usePage().props as { unread_enquiry_count?: number };

    return [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Browse Properties',
            href: '/properties',
            icon: BuildingIcon,
        },
        {
            title: 'Manage Listings',
            href: '/admin/properties',
            icon: Settings2Icon,
        },
        {
            title: 'Add Property',
            href: '/admin/properties/create',
            icon: PlusIcon,
        },
        {
            title: unread_enquiry_count ? `Enquiries (${unread_enquiry_count})` : 'Enquiries',
            href: '/admin/enquiries',
            icon: MailIcon,
        },
    ];
}

export function AppSidebar() {
    const navItems = useNavItems();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
