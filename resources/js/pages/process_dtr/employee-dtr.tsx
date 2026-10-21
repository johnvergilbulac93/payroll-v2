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
    onMissingPunch?: (date: string, type: 'IN' | 'OUT', recordId: number | null) => void;
    onScheduleNeeded?: (date: string) => void;
};

export function EmployeeDtr({ dailyTimeRecords, employeeId, onMissingPunch, onScheduleNeeded }: DTRProps) {
    const records = dailyTimeRecords.filter((dtr) => dtr.DTRDate !== 'TOTAL');

    return (
        <div className="overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/70">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="min-w-32 whitespace-nowrap">DATE</TableHead>
                            <TableHead className="min-w-20">DAY</TableHead>
                            <TableHead className="min-w-20">IN</TableHead>
                            <TableHead className="min-w-20">OUT</TableHead>
                            <TableHead className="min-w-16 text-right">OT</TableHead>
                            <TableHead className="min-w-16 text-right">HW</TableHead>
                            <TableHead className="min-w-16 text-right">LATE</TableHead>
                            <TableHead className="min-w-16 text-right">UT</TableHead>
                            <TableHead className="min-w-14 text-center">DW</TableHead>
                            <TableHead className="w-12 text-center">
                                <span className="sr-only">Attendance details</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-28 text-center text-sm text-muted-foreground">
                                    No daily attendance records found for this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((dtr, index) => {
                                const hasPunches = dtr.Punches.length > 0;
                                const hasRemarks = Boolean(dtr.Remarks);
                                const remarks = (dtr.Remarks ?? '').toLowerCase();
                                const hasIn = Boolean(dtr.IN?.trim()) && dtr.IN.trim() !== '—' && dtr.IN.trim() !== '-';
                                const hasOut = Boolean(dtr.OUT?.trim()) && dtr.OUT.trim() !== '—' && dtr.OUT.trim() !== '-';
                                // The viewer formats DTRDate as "Oct 21, 2026"; determine the missing
                                // punch from the processor remark, then normalize the date before opening the form.
                                const missingIn = !hasIn && hasOut && remarks.includes('assumed out');
                                const missingOut = hasIn && !hasOut && remarks.includes('assumed in');
                                const missingPunchType = missingIn ? 'IN' : missingOut ? 'OUT' : null;
                                const needsSchedule = remarks.includes('no active schedule assigned');
                                const normalizedDtrDate = (() => {
                                    const parsed = new Date(dtr.DTRDate);
                                    return Number.isNaN(parsed.getTime())
                                        ? dtr.DTRDate
                                        : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
                                })();
                                const showDetails = hasRemarks || hasPunches;

                                return (
                                    <TableRow
                                        key={dtr.DTRDate}
                                        className={
                                            dtr.IsDayOff
                                                ? 'bg-muted/20'
                                                : index % 2 === 1
                                                  ? 'bg-muted/20'
                                                  : ''
                                        }
                                    >
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {dtr.DTRDate}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{dtr.Day}</TableCell>
                                        {dtr.IsDayOff && !showDetails ? (
                                            <TableCell colSpan={8} className="text-center">
                                                <span className="inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                                    Day off
                                                </span>
                                            </TableCell>
                                        ) : (
                                            <>
                                                <TableCell className="font-medium tabular-nums whitespace-nowrap">
                                                    {dtr.IN || '—'}
                                                </TableCell>
                                                <TableCell className="font-medium tabular-nums whitespace-nowrap">
                                                    {dtr.OUT || '—'}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">{dtr.OT || '—'}</TableCell>
                                                <TableCell className="text-right tabular-nums">{dtr.HW || '—'}</TableCell>
                                                <TableCell className="text-right tabular-nums">{dtr.LATE || '—'}</TableCell>
                                                <TableCell className="text-right tabular-nums">{dtr.UT || '—'}</TableCell>
                                                <TableCell className="text-center tabular-nums">{dtr.DW ?? '—'}</TableCell>
                                                <TableCell className="text-center">
                                                    {showDetails && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`View attendance details for ${dtr.DTRDate}`}
                                                                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                    onClick={() => {
                                                                        if (needsSchedule && onScheduleNeeded) {
                                                                            onScheduleNeeded(normalizedDtrDate);
                                                                            return;
                                                                        }
                                                                        if (missingPunchType && onMissingPunch) {
                                                                            onMissingPunch(normalizedDtrDate, missingPunchType, dtr.id ?? null);
                                                                            return;
                                                                        }
                                                                        if (hasRemarks && employeeId) {
                                                                            router.visit(
                                                                                `/employee_schedule?emp_id=${employeeId}&tab=per-date`,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {hasRemarks ? (
                                                                        <IconMessageCircleFilled className={`size-4 ${missingPunchType || needsSchedule ? 'text-amber-500' : ''}`} />
                                                                    ) : (
                                                                        <IconInfoCircleFilled className="size-4" />
                                                                    )}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" className="max-w-sm">
                                                                <div className="flex min-w-24 flex-col gap-1.5">
                                                                    <span className="mb-1 border-b pb-1 text-xs font-semibold">
                                                                        {dtr.IsDayOff
                                                                            ? 'Day off'
                                                                            : dtr.ShiftName || 'No shift assigned'}
                                                                    </span>
                                                                    {dtr.Remarks && (
                                                                        <span className="text-xs">{dtr.Remarks}</span>
                                                                    )}
                                                                    {hasPunches && (
                                                                        <div className="mt-1 flex flex-col gap-1 border-t pt-1">
                                                                            <span className="text-xs font-semibold">Punch times</span>
                                                                            {dtr.Punches.map((punch, punchIndex) => (
                                                                                <span
                                                                                    key={`${punch.PunchTime}-${punchIndex}`}
                                                                                    className="font-mono text-xs"
                                                                                >
                                                                                    {punch.PunchTime}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-1 mt-2 bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    Showing {records.length} attendance {records.length === 1 ? 'record' : 'records'}
                </span>
                <span>Hover the details icon to inspect remarks and recorded biometric times.</span>
            </div>
        </div>
    );
}
