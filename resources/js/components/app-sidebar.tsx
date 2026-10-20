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
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-sidebar text-sidebar-foreground [&_[data-slot=sidebar-inner]]:bg-sidebar [&_[data-slot=sidebar-inner]]:text-sidebar-foreground"
        >
            <SidebarHeader className="border-b border-white/10">

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                            asChild
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-2">
                <NavMain items={filteredNavGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
