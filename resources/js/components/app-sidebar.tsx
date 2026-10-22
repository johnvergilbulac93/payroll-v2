import { Link } from '@inertiajs/react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Input } from '@/components/ui/input';
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
    const [menuSearch, setMenuSearch] = useState('');
    const normalizedSearch = menuSearch.trim().toLowerCase();
    const searchableNavGroups = normalizedSearch
        ? filteredNavGroups
              .map((group) => ({
                  ...group,
                  Items: group.Items.filter((item) =>
                      item.Label.toLowerCase().includes(normalizedSearch) ||
                      Boolean(item.Children?.some((child) => child.Label.toLowerCase().includes(normalizedSearch))),
                  ).map((item) => ({
                      ...item,
                      Children: item.Label.toLowerCase().includes(normalizedSearch)
                          ? item.Children
                          : item.Children?.filter((child) => child.Label.toLowerCase().includes(normalizedSearch)),
                  })),
              }))
              .filter((group) => group.Items.length > 0)
        : filteredNavGroups;

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="bg-sidebar text-sidebar-foreground **:data-[slot=sidebar-inner]:bg-sidebar **:data-[slot=sidebar-inner]:text-sidebar-foreground"
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
                <div className="relative mb-3 px-1 group-data-[collapsible=icon]:hidden">
                    <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/60" />
                    <Input
                        value={menuSearch}
                        onChange={(event) => setMenuSearch(event.target.value)}
                        placeholder="Search menus..."
                        aria-label="Search sidebar menus"
                        className="h-9 pl-9 pr-8 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:border-input focus-visible:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-sidebar-primary/35"
                    />
                    {menuSearch && (
                        <button
                            type="button"
                            aria-label="Clear menu search"
                            onClick={() => setMenuSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <IconX className="size-3.5" />
                        </button>
                    )}
                </div>
                {searchableNavGroups.length > 0 ? (
                    <NavMain items={searchableNavGroups} />
                ) : (
                    <p className="px-3 py-6 text-center text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">No menus found.</p>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
