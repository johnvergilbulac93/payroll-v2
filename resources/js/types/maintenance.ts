export type Maintenance = {
    id: number;
    name: string;
    type?: number;
    type_name?: string;
};

export type Holiday = {
    id: number;
    Name: string;
    Date: string;
    DisplayDate?: string;
    HolidayType: string;
    IsRecurring: boolean;
};
