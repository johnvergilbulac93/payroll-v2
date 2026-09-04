import type { ShiftCode } from './schedule-template';

export type SchedulePerDate = {
    EffectiveFrom: string;
    EffectiveTo: string;
    EmpID: string;
    IsActive: boolean;
    ScheduleType: string;
    ShiftCodeID: string;
    id: number | string;
    shift_code?: ShiftCode;
};
