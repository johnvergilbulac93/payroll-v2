export type ShiftCode = {
    id: number;
    Name: string;
    TimeIn: string | null;
    TimeOut: string | null;
    Schedule: string;
    BreakMinutes: number;
    GracePeriodMinutes: number;
    CrossesMidNight: boolean;
    IsWorkingDay: boolean;
    TotalHours: number;
    IsActive: boolean;
};
