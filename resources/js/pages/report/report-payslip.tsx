import { Head } from '@inertiajs/react';
import {
    IconCalendar,
    IconCheck,
    IconPrinter,
    IconSelector,
    IconUser,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { ReportEmployeePayslipTable } from '@/pages/report/report-payslip-table';
import { generatePaySlip, printPayslipPerEmployee } from '@/routes/report';
import type { PaginatedData } from '@/types/paginated';
import type { PayrollPeriod } from '@/types/payroll-period';
import type { Payslip } from '@/types/payslip';

type Props = {
    payslips: PaginatedData<Payslip>;
    periods: PayrollPeriod[];
};
type ProcessMode = 'all' | 'per-employee';

export default function ReportPaySlipPage({ periods, payslips }: Props) {
    const [processMode, setProcessMode] = useState<ProcessMode>('all');
    const [openCommand, setOpenCommand] = useState(false);

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: generatePaySlip.url(),
        defaults: { search: '', page: 1, limit: 10, period: '', group: '' },
    });

    const selectedPeriodData = periods.find(
        (period) => period.id.toString() === filters.period,
    );
    const selectedPeriodLabel = selectedPeriodData
        ? `${selectedPeriodData.Label} - ${selectedPeriodData.PayDate}`
        : 'Select a Period';

    const onPrintAll = () => {
        window.open(
            printPayslipPerEmployee.url({
                query: { period: filters.period, employee: '' },
            }),
        );
    };
    const onPrint = (record: Payslip) => {
        window.open(
            printPayslipPerEmployee.url({
                query: { period: filters.period, employee: record.EmpID },
            }),
        );
    };

    return (
        <div className="p-4">
            <Head title="Report" />
            <Heading
                title="Generate Payslip"
                description="Generate payslip for employees."
            />
            <div className="space-y-4">
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                    <Field className="col-span-2 min-w-0 gap-2">
                        <FieldLabel>Periods</FieldLabel>
                        <Button
                            onClick={() => setOpenCommand(true)}
                            variant="outline"
                            className="flex w-full min-w-0 justify-between"
                            tabIndex={1}
                        >
                            <span className="truncate">
                                {selectedPeriodLabel}
                            </span>
                            <IconSelector className="shrink-0" />
                        </Button>
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>Print mode</FieldLabel>
                        <ToggleGroup
                            type="single"
                            value={processMode}
                            onValueChange={(value) => {
                                if (value) {
                                    setProcessMode(value as ProcessMode);
                                }
                            }}
                            variant="outline"
                        >
                            <ToggleGroupItem
                                value="all"
                                aria-label="Process all employees"
                            >
                                <IconUsers className="mr-1" />
                                All
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="per-employee"
                                aria-label="Process per employee"
                            >
                                <IconUser className="mr-1" />
                                Per employee
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </Field>
                    <Field className="sm:items-end">
                        {processMode === 'all' && (
                            <Button onClick={onPrintAll} className="w-fit!">
                                <IconPrinter />
                                Print all
                            </Button>
                        )}
                    </Field>
                </FieldGroup>
                <ReportEmployeePayslipTable
                    initialSearch={filters.search}
                    data={payslips}
                    onSearch={(value) =>
                        updateFilters({ search: value, page: 1 })
                    }
                    onPrint={(record) => onPrint(record)}
                    onPerPage={(value) =>
                        updateFilters({ limit: value, page: 1 })
                    }
                    processMode={processMode}
                />
            </div>

            <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
                <Command>
                    <CommandInput placeholder="Type a period or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Periods">
                            {periods.map((period) => (
                                <CommandItem
                                    key={period.id}
                                    value={period.id}
                                    onSelect={() => {
                                        updateFilters({
                                            period: period.id.toString(),
                                        });
                                        setOpenCommand(false);
                                    }}
                                >
                                    <IconCalendar />
                                    <div className="flex flex-col">
                                        <span>
                                            {period.Label} - {period.PayDate}
                                        </span>
                                        <span>{period.Cutoff}</span>
                                    </div>
                                    {filters.period ===
                                        period.id.toString() && (
                                        <CommandShortcut>
                                            <IconCheck />
                                        </CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    );
}
ReportPaySlipPage.layout = {
    breadcrumbs: [
        {
            title: 'Generate Payslip',
            href: '#',
        },
    ],
};
