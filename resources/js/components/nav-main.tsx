import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { IconChevronRight } from '@tabler/icons-react';
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
                        {group.Items.map((item) => {
                            const hasChildren = Boolean(item.Children?.length);
                            const childIsActive = item.Children?.some((child) =>
                                isCurrentUrl(child.Url),
                            );

                            return (
                                <Collapsible
                                    key={item.Label}
                                    asChild
                                    defaultOpen={childIsActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={!hasChildren && isCurrentUrl(item.Url)}
                                            tooltip={{ children: item.Label }}
                                        >
                                            {hasChildren ? (
                                                <CollapsibleTrigger>
                                                    {item.Icon && <item.Icon />}
                                                    <span>{item.Label}</span>
                                                    <IconChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                </CollapsibleTrigger>
                                            ) : (
                                                <Link href={item.Url} prefetch>
                                                    {item.Icon && <item.Icon />}
                                                    <span>{item.Label}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                        {hasChildren && (
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.Children?.map((child) => (
                                                        <SidebarMenuSubItem key={child.Label}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isCurrentUrl(child.Url)}
                                                            >
                                                                <Link href={child.Url} prefetch>
                                                                    <span>{child.Label}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        )}
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
