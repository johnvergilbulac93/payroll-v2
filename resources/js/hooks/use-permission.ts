// resources/js/hooks/usePermissions.ts
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export function usePermissions() {
    const { props } = usePage();

    const permissions = useMemo(
        () => (props.auth?.permissions ?? []) as string[],
        [props.auth?.permissions],
    );

    const can = useMemo(() => {
        return (perm?: string): boolean => !perm || permissions.includes(perm);
    }, [permissions]);

    return { can, permissions };
}
