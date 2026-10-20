import { IconInfoCircleFilled } from '@tabler/icons-react';
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
};
export function EmployeeDtr({ dailyTimeRecords }: DTRProps) {
    const records = dailyTimeRecords.filter((dtr) => dtr.DTRDate !== 'TOTAL');

    return (
        <div className="overflow-hidden rounded-xl border">
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
                            <TableHead className="w-12 text-center"><span className="sr-only">Punch logs</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-28 text-center text-sm text-muted-foreground">
                                    No daily attendance records found for this period.
                                </TableCell>
                            </TableRow>
                        ) : records.map((dtr, index) =>
                            dtr.IsDayOff ? (
                                <TableRow key={dtr.DTRDate} className="bg-muted/20">
                                    <TableCell className="font-medium whitespace-nowrap">{dtr.DTRDate}</TableCell>
                                    <TableCell className="text-muted-foreground">{dtr.Day}</TableCell>
                                    <TableCell colSpan={8} className="text-center">
                                        <span className="inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Day off</span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={dtr.DTRDate} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                                    <TableCell className="font-medium whitespace-nowrap">{dtr.DTRDate}</TableCell>
                                    <TableCell className="text-muted-foreground">{dtr.Day}</TableCell>
                                    <TableCell className="font-medium tabular-nums whitespace-nowrap">{dtr.IN || '—'}</TableCell>
                                    <TableCell className="font-medium tabular-nums whitespace-nowrap">{dtr.OUT || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{dtr.OT || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{dtr.HW || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{dtr.LATE || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{dtr.UT || '—'}</TableCell>
                                    <TableCell className="text-center tabular-nums">{dtr.DW ?? '—'}</TableCell>
                                    <TableCell className="text-center">
                                        {dtr.Punches.length > 0 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" aria-label={`View punch logs for ${dtr.DTRDate}`} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                                        <IconInfoCircleFilled className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">
                                                    <div className="flex min-w-24 flex-col gap-1.5">
                                                        <span className="mb-1 border-b pb-1 text-xs font-semibold">Punch times</span>
                                                        {dtr.Punches.map((punch, i) => (
                                                            <span key={`${punch.PunchTime}-${i}`} className="font-mono text-xs">{punch.PunchTime}</span>
                                                        ))}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-1 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>Showing {records.length} attendance {records.length === 1 ? 'record' : 'records'}</span>
                <span>Hover the punch icon to inspect recorded biometric times.</span>
            </div>
        </div>
    );
}
