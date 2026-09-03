export type PayrollPeriod = {
    id: string;
    Year: number | undefined;
    Month: number | undefined;
    CutoffNumber: number | undefined;
    PeriodStart: string;
    PeriodEnd: string;
    PayDate: string;
    Status: string;
    Label: string;
    Scheme: string;
    Cutoff: string;
};
export type PunchesLogs = {
    PunchTime: string;
    VerifyMode: number;
    IOState: number;
};
export type DTRRecordsDetails = {
    DTRDate: string;
    Day: string;
    IN: string;
    OUT: string;
    HW: string;
    DW: string;
    OT: string;
    LATE: string;
    Remarks: string;
    Punches: PunchesLogs[];
    ShiftName: string;
    IsDayOff: boolean;
};
export type EmployeeDtrPeriod = {
    id: number;
    Status: string;
    FullName: string;
    Remarks: string;
    ProcessAt: string;
    RecordCount: number;
    Period: string;
    EmpNbr: string;
    Image?: string;
    DTRRecords?: DTRRecordsDetails[];
};
