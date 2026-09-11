import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarFooter,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNav } from '@/hooks/use-navigation';
import { dashboard } from '@/routes';

export function AppSidebar() {
    const { filteredNavGroups } = useNav();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/60">

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <NavMain items={filteredNavGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
