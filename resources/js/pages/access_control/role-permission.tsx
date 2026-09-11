import { router } from '@inertiajs/react';
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '@/hooks/use-debounce';
import { updateRolePermission } from '@/routes/access_control';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

export type PermissionGrant = {
    granted: boolean;
};

export type RolePermissionMatrix = Record<
    number,
    Record<number, PermissionGrant>
>;
type RolePermissionProps = {
    roles: Role[];
    permissions: Permission[];
    matrix: RolePermissionMatrix;
    search?: string;
    onSearch?: (value: string) => void;
    isLoading: boolean;
};

export default function RolePermission({
    roles,
    permissions,
    matrix: initialMatrix,
    search: initialSearch = '',
    onSearch,
    isLoading = false,
}: RolePermissionProps) {
    const [matrix, setMatrix] = useState<RolePermissionMatrix>(initialMatrix);
    const [search, setSearch] = useState(initialSearch);
    const onSearchRef = useRef(onSearch);
    const debouncedSearch = useDebounce(search, 500);
    const [prevInitialSearch, setPrevInitialSearch] = useState(initialSearch);

    if (initialSearch !== prevInitialSearch) {
        setPrevInitialSearch(initialSearch);
        setSearch(initialSearch);
    }

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        onSearchRef.current?.(debouncedSearch);
    }, [debouncedSearch]);

    const onToggle = (permissionId: number, roleId: number, next: boolean) => {
        setMatrix((prev) => ({
            ...prev,
            [permissionId]: {
                ...prev[permissionId],
                [roleId]: { granted: next },
            },
        }));

        router.post(
            updateRolePermission.url(roleId),
            { permission_id: permissionId, granted: next },
            {
                preserveScroll: true,
                preserveState: true,
                preserveUrl: true,
                onError: () => {
                    setMatrix((prev) => ({
                        ...prev,
                        [permissionId]: {
                            ...prev[permissionId],
                            [roleId]: { granted: !next },
                        },
                    }));
                },
            },
        );
    };

    return (
        <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mt-2 mb-4">
                <div className="relative w-1/2">
                    <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        id="input-button-group"
                        placeholder="Type to search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9 pl-9"
                    />
                    {search && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                        >
                            <IconX className="size-4" />
                            <span className="sr-only">Clear search</span>
                        </Button>
                    )}
                </div>
            </div>

            {!isLoading && permissions.length > 0 && (
                <div
                    className="grid grid-cols-[1fr_repeat(var(--cols),80px)] gap-2 px-4 pb-2 text-xs font-medium text-muted-foreground"
                    style={{ '--cols': roles.length } as React.CSSProperties}
                >
                    <span>Permission</span>
                    {roles.map((role) => (
                        <span key={role.id} className="text-center">
                            {role.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                {isLoading ? (
                    <div className="flex h-24 w-full items-center justify-center">
                        <Spinner className="size-8 text-primary" />
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="flex items-center justify-center rounded-xl bg-background px-4 py-8 text-sm text-muted-foreground">
                        No permissions found.
                    </div>
                ) : (
                    permissions.map((permission) => (
                        <div
                            key={permission.id}
                            className="grid grid-cols-[1fr_repeat(var(--cols),80px)] items-center gap-2 rounded-xl bg-background px-4 py-3 shadow-sm"
                            style={
                                {
                                    '--cols': roles.length,
                                } as React.CSSProperties
                            }
                        >
                            <span className="text-sm font-medium">
                                {permission.name}
                            </span>
                            {roles.map((role) => {
                                const checked =
                                    !!matrix[permission.id]?.[role.id]?.granted;

                                return (
                                    <div
                                        key={role.id}
                                        className="flex justify-center"
                                    >
                                        <Button
                                            variant={
                                                checked
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            size="icon"
                                            onClick={() =>
                                                onToggle(
                                                    permission.id,
                                                    role.id,
                                                    !checked,
                                                )
                                            }
                                            className="size-6 rounded-full"
                                        >
                                            {checked ? (
                                                <IconCheck
                                                    className="size-3.5"
                                                    strokeWidth={3}
                                                />
                                            ) : (
                                                <IconX
                                                    className="size-3.5"
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
