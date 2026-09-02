export type ShiftCode = {
    id: number;
    Name: string; // e.g. "DAY", "NIGHT", "OFF"
    TimeIn: string;
    TimeOut: string; // "08:00"
    Schedule: string;
    IsWorkingDay: boolean;
};

export type ScheduleTemplate = {
    id: number;
    EmpID: number;
    DayOfWeek: number; // 0 = Sunday ... 6 = Saturday
    ShiftCodeID: number;
    shift_code?: ShiftCode;
    EffectiveFrom: string;
    EffectiveTo: string;
};

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
] as const;
