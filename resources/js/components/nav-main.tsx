import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/utils/menu';

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {items.map((group, index) => (
                <SidebarGroup
                    key={group.Label ?? `group-${index}`}
                    className="px-2 py-0"
                >
                    {group.Label && (
                        <SidebarGroupLabel>{group.Label}</SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {group.Items.map((item) => (
                            <SidebarMenuItem key={item.Label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.Url)}
                                    tooltip={{ children: item.Label }}
                                >
                                    <Link href={item.Url} prefetch >
                                        {item.Icon && <item.Icon  />}
                                        <span>{item.Label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
