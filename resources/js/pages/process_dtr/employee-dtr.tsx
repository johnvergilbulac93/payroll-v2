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
                    {dailyTimeRecords.map((dtr) =>
                        dtr.DTRDate !== 'TOTAL' && dtr.IsDayOff ? (
                            <TableRow key={dtr.DTRDate}>
                                <TableCell className="font-medium">
                                    {dtr.DTRDate}
                                </TableCell>
                                <TableCell>{dtr.Day}</TableCell>
                                <TableCell
                                    colSpan={8}
                                    className="text-center text-muted-foreground"
                                >
                                    Day Off
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow key={dtr.DTRDate}>
                                <TableCell className="font-medium">
                                    {dtr.DTRDate}
                                </TableCell>
                                <TableCell>{dtr.Day}</TableCell>
                                <TableCell>{dtr.IN}</TableCell>
                                <TableCell>{dtr.OUT}</TableCell>
                                <TableCell>{dtr.OT}</TableCell>
                                <TableCell>{dtr.HW}</TableCell>
                                <TableCell>{dtr.LATE}</TableCell>
                                <TableCell>{dtr.UT}</TableCell>
                                <TableCell>{dtr.DW}</TableCell>
                                {dtr.DTRDate !== 'TOTAL' && (
                                    <TableCell className="text-2xl">
                                        {dtr.Punches.length > 0 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <IconInfoCircleFilled className="h-5 cursor-pointer text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <div className="flex flex-col gap-1">
                                                        {dtr.Punches.map(
                                                            (punch, i) => (
                                                                <span key={i}>
                                                                    {
                                                                        punch.PunchTime
                                                                    }
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
