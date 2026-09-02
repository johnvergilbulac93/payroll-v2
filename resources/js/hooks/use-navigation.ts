import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { navItems } from '@/utils/menu';
import type { NavGroup, NavItem } from '@/utils/menu';

export function useNav() {
    const { props } = usePage();
    const permissions = useMemo(
        () => (props.auth?.permissions ?? []) as string[],
        [props.auth?.permissions],
    );

    const filteredNavGroups = useMemo<NavGroup[]>(() => {
        function can(perm?: string): boolean {
            return !perm || permissions.includes(perm);
        }

        function filterItem(item: NavItem): NavItem | null {
            const children =
                item.Children?.filter((child) => can(child.Permission)) ?? [];

            if (item.Children && item.Children.length > 0) {
                return children.length > 0
                    ? { ...item, Children: children }
                    : null;
            }

            return item.Url && can(item.Permission) ? item : null;
        }

        return navItems
            .map((group) => ({
                ...group,
                Items: group.Items.map(filterItem).filter(
                    (item): item is NavItem => item !== null,
                ),
            }))
            .filter((group) => group.Items.length > 0);
    }, [permissions]);

    return { filteredNavGroups };
}
