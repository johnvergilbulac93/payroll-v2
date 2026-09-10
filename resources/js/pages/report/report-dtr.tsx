import { Head} from '@inertiajs/react';
import {
    IconCalendar,
    IconCheck,
    IconPrinter,
    IconSelector,
    IconUser,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import { FormDialog } from '@/components/base-modal';
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
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { EmployeeDtr } from '@/pages/process_dtr/employee-dtr';
import { ReportEmployeeDtrTable } from '@/pages/report/report-dtr-table';
import {
    generateDtr,
    printDtrPerEmployee,
    printDtrAllEmployees,
} from '@/routes/report';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type {
    DTRRecordsDetails,
    EmployeeDtrPeriod,
    PayrollPeriod,
} from '@/types/payroll-period';
type Props = {
    employees: PaginatedData<EmployeeDtrPeriod>;
    periods: PayrollPeriod[];
    groups: Option[];
};

type ProcessMode = 'all' | 'per-employee';

export default function ReportDtrPage({ employees, periods, groups }: Props) {
    const [processMode, setProcessMode] = useState<ProcessMode>('all');
    const [openCommand, setOpenCommand] = useState(false);

    const [openDialogDtr, setOpenDialogDtr] = useState(false);
    const [description, setDescription] = useState('');

    const [employeeDtr, setEmployeeDtr] = useState<DTRRecordsDetails[]>([]);

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: generateDtr.url(),
        defaults: { search: '', page: 1, limit: 10, period: '', group: '' },
    });

    const selectedPeriodData = periods.find(
        (period) => period.id.toString() === filters.period,
    );
    const selectedPeriodLabel = selectedPeriodData
        ? `${selectedPeriodData.Label} - ${selectedPeriodData.PayDate}`
        : 'Select a Period';

    const onEdit = (record: EmployeeDtrPeriod) => {
        setEmployeeDtr(record.DTRRecords ?? []);
        setDescription(`${record.FullName} - ${record.Period}`);
        setOpenDialogDtr(true);
    };
    const onGenerateAll = () => {
        window.open(
            printDtrAllEmployees.url(
                { period: Number(filters.period) },
                { query: { group_id: filters.group } },
            ),
        );
    };

    const onPrint = (record: EmployeeDtrPeriod) => {
        window.open(
            printDtrPerEmployee.url({
                period: Number(filters.period),
                employee: record.id,
            }),
        );
    };

    return (
        <div className="p-4">
            <Head title="Report" />
            <Heading
                title="Generate Daily Time Record"
                description="Generate daily time records for employees."
            />
            <div className="space-y-4">
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                    <Field className="min-w-0 gap-2">
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
                        <FieldLabel>Group</FieldLabel>
                        <Select
                            value={filters.group}
                            onValueChange={(value) => {
                                const resolved = value === 'all' ? '' : value;
                                updateFilters({ group: resolved, page: 1 });
                            }}
                        >
                            <SelectTrigger
                                id="employee.Group"
                                className="w-full"
                                tabIndex={2}
                            >
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Group</SelectLabel>
                                    <SelectItem value="all">
                                        All groups
                                    </SelectItem>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group.value}
                                            value={group.value}
                                        >
                                            {group.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
                        {processMode === 'all' && filters.period && (
                            <Button onClick={onGenerateAll} className="w-fit!">
                                <IconPrinter />
                                Print all
                            </Button>
                        )}
                    </Field>
                </FieldGroup>
                <ReportEmployeeDtrTable
                    initialSearch={filters.search}
                    data={employees}
                    onSearch={(value) =>
                        updateFilters({ search: value, page: 1 })
                    }
                    onEdit={(record) => onEdit(record)}
                    onPrint={(record) => onPrint(record)}
                    onPerPage={(value) =>
                        updateFilters({ limit: value, page: 1 })
                    }
                    processMode={processMode}
                />
            </div>
            <FormDialog
                key="view-dtr-dialog"
                open={openDialogDtr}
                onOpenChange={setOpenDialogDtr}
                title="Daily Time Record"
                description={description}
                disabled
                onCancel={() => setOpenDialogDtr(false)}
                size="full"
                canAdd={false}
                cancelText="Close"
            >
                <ScrollArea className="min-100 max-h-[70vh] overflow-y-auto px-3">
                    <EmployeeDtr dailyTimeRecords={employeeDtr} />
                </ScrollArea>
            </FormDialog>
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

ReportDtrPage.layout = {
    breadcrumbs: [
        {
            title: 'Generate Daily Time Record',
            href: '#',
        },
    ],
};
