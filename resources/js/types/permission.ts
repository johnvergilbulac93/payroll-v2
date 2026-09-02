export type Permission = {
    id: number;
    name: string;
    slug?: string;
    type?: 'module' | 'group' | 'action';
    checked?: boolean;
    children?: Permission[];
};
