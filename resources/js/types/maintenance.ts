export type Maintenance = {
    id: number;
    name: string;
    type?: number;
    type_name?: string;
};

export type DeductionType = {
    id: number;
    name: string;
    frequency: string;
};

export type GovernmentMandated = {
    id: number;
    Code: string;
    Description: string;
    ValueType: string | null;
    DefaultValue: number | string | null;
    File: string | null;
    Status: boolean;
};

export type Holiday = {
    id: number;
    Name: string;
    Date: string;
    DisplayDate?: string;
    HolidayType: string;
    IsRecurring: boolean;
};
