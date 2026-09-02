import { router } from '@inertiajs/react';
import { useState } from 'react';
import { cleanParams } from '@/lib/utils';

type UseIndexFiltersOptions<
    T extends Record<string, string | number | boolean | null | undefined>,
> = {
    route: string;
    defaults: T;
};

function getInitialFilters<
    T extends Record<string, string | number | boolean | null | undefined>,
>(defaults: T): T {
    if (typeof window === 'undefined') {
        return defaults;
    }

    const params = new URLSearchParams(window.location.search);
    const result = { ...defaults };

    for (const key of Object.keys(defaults)) {
        if (params.has(key)) {
            (result as Record<string, unknown>)[key] = params.get(key);
        }
    }

    return result;
}

export function usePaginationIndexFilters<
    T extends Record<string, string | number | boolean | null | undefined>,
>({ route, defaults }: UseIndexFiltersOptions<T>) {
    const [filters, setFilters] = useState<T>(() =>
        getInitialFilters(defaults),
    );
    const [isLoading, setIsLoading] = useState(false);

    const getData = (current: T = filters) => {
        router.get(route, cleanParams(current, defaults), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const updateFilters = (partial: Partial<T>) => {
        const next = { ...filters, ...partial };
        setFilters(next);
        getData(next);
    };

    return { filters, updateFilters, getData, isLoading };
}
