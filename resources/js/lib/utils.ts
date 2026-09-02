import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
type CleanableValue = string | number | boolean | null | undefined;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function cleanParams<T extends Record<string, CleanableValue>>(
    params: T,
    defaults: Partial<T> = {},
): Partial<T> {
    return Object.fromEntries(
        Object.entries(params).filter(([key, value]) => {
            const isEmpty =
                value === '' || value === null || value === undefined;
            const isDefault =
                key in defaults && value === defaults[key as keyof T];

            return !isEmpty && !isDefault;
        }),
    ) as Partial<T>;
}
