export type User = {
    id: number;
    name: string;
    role_name?: string;
    email?: string;
    username: string;
    IsActive: boolean;
    role: number;
    created_at?: string;
    avatar?: string;
    deleted_at?: string;
    [key: string]: unknown;
};
