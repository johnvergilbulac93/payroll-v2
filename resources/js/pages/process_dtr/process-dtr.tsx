import { Head, router } from '@inertiajs/react';
import {
    IconCalendar,
    IconCheck,
    IconRefresh,
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

import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { EmployeeDtr } from '@/pages/process_dtr/employee-dtr';
import { ProcessDtrTable } from '@/pages/process_dtr/process-dtr-table';
import { index } from '@/routes/dtr';
import { processDTRPeriod, processPerEmployee } from '@/routes/dtr';
import type { PaginatedData } from '@/types/paginated';
import type {
    DTRRecordsDetails,
    EmployeeDtrPeriod,
    PayrollPeriod,
} from '@/types/payroll-period';
type Props = {
    employees: PaginatedData<EmployeeDtrPeriod>;
    periods: PayrollPeriod[];
};
type ProcessMode = 'all' | 'per-employee';

export default function ProcessDtrPage({ employees, periods }: Props) {
    const [processMode, setProcessMode] = useState<ProcessMode>('all');

    const [openCommand, setOpenCommand] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [openDialogDtr, setOpenDialogDtr] = useState(false);
    const [description, setDescription] = useState('');

    const [employeeDtr, setEmployeeDtr] = useState<DTRRecordsDetails[]>([]);

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { period: '', search: '', page: 1, limit: 10 },
    });

    const selectedPeriodData = periods.find(
        (period) => period.id.toString() === filters.period,
    );
    const selectedPeriodLabel = selectedPeriodData
        ? `${selectedPeriodData.Label} - ${selectedPeriodData.PayDate}`
        : 'Select a Period';

    const onProcessDTR = () => {
        router.post(
            processDTRPeriod.url(Number(filters.period)),

            {},

            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onSuccess: () => setProcessing(false),
                onHttpException: () => setProcessing(false),
            },
        );
    };
    const onProcessEmployee = (record: EmployeeDtrPeriod) => {
        router.post(
            processPerEmployee.url([Number(filters.period), record.id]),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onSuccess: () => setProcessing(false),
                onHttpException: () => setProcessing(false),
            },
        );
    };

    const onEdit = (record: EmployeeDtrPeriod) => {
        setEmployeeDtr(record.DTRRecords ?? []);
        setDescription(`${record.FullName} - ${record.Period}`);
        setOpenDialogDtr(true);
    };

    return (
        <div className="p-4">
            <Head title="Process DTR" />
            <Heading
                title="Process DTR"
                description="Manage and process employee daily time records (DTR) for payroll periods."
            />
            <div className="space-y-4">
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                    <Field className="gap-2">
                        <FieldLabel>Periods</FieldLabel>
                        <Button
                            onClick={() => setOpenCommand(true)}
                            variant="outline"
                            className="flex w-full justify-between"
                            tabIndex={1}
                        >
                            <span className="truncate">
                                {' '}
                                {selectedPeriodLabel}
                            </span>
                            <IconSelector />
                        </Button>
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel>Process mode</FieldLabel>
                        <ToggleGroup
                            type="single"
                            value={processMode}
                            onValueChange={(value) => {
                                // Radix fires this with '' when you click the already-active
                                // item — guard so processMode never collapses to empty.
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
                            <Button
                                onClick={onProcessDTR}
                                disabled={processing}
                                className="w-fit!"
                            >
                                {processing ? <Spinner /> : <IconRefresh />}
                                Process All
                            </Button>
                        )}
                    </Field>
                </FieldGroup>

                {employees.data.length > 0 && (
                    <ProcessDtrTable
                        data={employees}
                        onSearch={(value) =>
                            updateFilters({ search: value, page: 1 })
                        }
                        onPerPage={(value) =>
                            updateFilters({ limit: value, page: 1 })
                        }
                        onEdit={(record) => onEdit(record)}
                        onProcess={(record) => onProcessEmployee(record)}
                        processMode={processMode}
                    />
                )}

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
                                                {period.Label} -{' '}
                                                {period.PayDate}
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
        </div>
    );
}
ProcessDtrPage.layout = {
    breadcrumbs: [
        {
            title: 'Process Dtr',
            href: '#',
        },
    ],
};
