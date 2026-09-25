export type Deduction = {
    id: number;
    DeductionTypeId: string;
    DeductionType?: string;
    EmpID: string;
    EmpNbr?: string;
    EmployeeName: string;
    ImageUrl?: string;
    OrigBal: number;
    DedAmt: number;
    StartDate: string;
    StartDateLabel?: string;
    Frequency?: string;
    BalanceAmt: number;
    BalanceasofDate?: number | null;
};
