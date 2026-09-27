import { router } from '@inertiajs/react';
import {
    IconInfoCircleFilled,
    IconMessageCircleFilled,
} from '@tabler/icons-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DTRRecordsDetails } from '@/types/payroll-period';
type DTRProps = {
    dailyTimeRecords: DTRRecordsDetails[];
    employeeId?: number | string;
};
export function EmployeeDtr({ dailyTimeRecords, employeeId }: DTRProps) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                    <TableRow>
                        <TableHead className="w-32"> DATE </TableHead>
                        <TableHead className="w-20">DAY</TableHead>
                        <TableHead>IN</TableHead>
                        <TableHead>OUT</TableHead>
                        <TableHead>OT</TableHead>
                        <TableHead>HW</TableHead>
                        <TableHead>LATE</TableHead>
                        <TableHead>UT</TableHead>
                        <TableHead className="w-10">DW</TableHead>
                        <TableHead className="w-10">
                            <span className="sr-only">Punches logs</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                    {dailyTimeRecords
                        .filter((dtr) => dtr.DTRDate !== 'TOTAL')
                        .map((dtr) => {
                            const hasPunches = dtr.Punches.length > 0;
                            const hasRemarks = Boolean(dtr.Remarks);
                            const showPunchInfo = !dtr.IsDayOff && hasPunches;
                            const showRemarksInfo = hasRemarks;

                            return (
                                <TableRow key={dtr.DTRDate}>
                                    <TableCell className="font-medium">
                                        {dtr.DTRDate}
                                    </TableCell>
                                    <TableCell>{dtr.Day}</TableCell>
                                    {dtr.IsDayOff && !hasRemarks ? (
                                        <TableCell
                                            colSpan={7}
                                            className="text-center font-medium text-muted-foreground"
                                        >
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-pointer">
                                                        Rest Day
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <div className="flex flex-col gap-1">
                                                        {hasPunches ? (
                                                            <>
                                                                <span className="font-medium">
                                                                    Punches
                                                                </span>
                                                                {dtr.Punches.map((punch, i) => (
                                                                    <span key={i}>
                                                                        {punch.PunchTime}
                                                                    </span>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <span>No punches recorded</span>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    ) : (
                                        <>
                                            <TableCell>{dtr.IN}</TableCell>
                                            <TableCell>{dtr.OUT}</TableCell>
                                            <TableCell>{dtr.OT}</TableCell>
                                            <TableCell>{dtr.HW}</TableCell>
                                            <TableCell>{dtr.LATE}</TableCell>
                                            <TableCell>{dtr.UT}</TableCell>
                                            <TableCell>{dtr.DW}</TableCell>
                                        </>
                                    )}
                                    <TableCell>
                                        {dtr.IsDayOff && !hasRemarks ? (
                                            null
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {(showRemarksInfo || showPunchInfo) && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className="inline-flex cursor-pointer"
                                                                onClick={() => {
                                                                    if (employeeId) {
                                                                        router.visit(
                                                                            `/employee_schedule?emp_id=${employeeId}&tab=per-date`,
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {showRemarksInfo ? (
                                                                    <IconMessageCircleFilled className="size-5 text-amber-500" />
                                                                ) : (
                                                                    <IconInfoCircleFilled className="size-5 text-muted-foreground" />
                                                                )}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-sm">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium">
                                                                    {dtr.IsDayOff
                                                                        ? 'Rest Day'
                                                                        : dtr.ShiftName || 'No shift assigned'}
                                                                </span>
                                                                {dtr.Remarks && (
                                                                    <span>{dtr.Remarks}</span>
                                                                )}
                                                                {hasPunches && (
                                                                    <div className="mt-1 flex flex-col gap-0.5 border-t pt-1">
                                                                        <span className="font-medium">
                                                                            Punches
                                                                        </span>
                                                                        {dtr.Punches.map((punch, i) => (
                                                                            <span key={i}>
                                                                                {punch.PunchTime}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </div>
    );
}
