export type ActivityLog = {
    id: number;
    date: string | null;
    user: string;
    event: string;
    module: string;
    description: string;
    subject: string | null;
};
