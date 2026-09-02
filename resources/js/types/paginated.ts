export type PaginatedData<T> = {
    data: T[];
    pagination: Pagination;
    meta: PaginationMeta;
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    name: string;
    limit: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string;
    prev_page_url: string;
};

export type PaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
};
