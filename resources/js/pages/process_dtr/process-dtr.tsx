import { Head, router } from '@inertiajs/react';
import {
    IconCalendar,
    IconCheck,
    IconRefresh,
    IconSearch,
    IconSelector,
    IconX,
    IconUser,
    IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';

import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';

import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useDebounce } from '@/hooks/use-debounce';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { ProcessDtrTable } from '@/pages/process_dtr/process-dtr-table';
import { index } from '@/routes/dtr';
import {
    employeeAttendance,
    processDTRPeriod,
    processPerEmployee,
} from '@/routes/dtr';
import type { PaginatedData } from '@/types/paginated';
import type { EmployeeDtrPeriod, PayrollPeriod } from '@/types/payroll-period';
type Props = {
    employees: PaginatedData<EmployeeDtrPeriod>;
    periods: PayrollPeriod[];
    statusCounts?: {
        flagged: number;
        no_entry: number;
        pending: number;
        processed: number;
    };
};
type ProcessMode = 'all' | 'per-employee';

export default function ProcessDtrPage({
    employees,
    periods,
    statusCounts,
}: Props) {
    const [processMode, setProcessMode] = useState<ProcessMode>('all');

    const [openCommand, setOpenCommand] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: {
            period: '',
            search: '',
            status: 'pending',
            page: 1,
            limit: 10,
        },
    });

    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const debouncedSearch = useDebounce(searchInput, 500);

    useEffect(() => {
        setSearchInput(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (debouncedSearch !== (filters.search ?? '')) {
            updateFilters({ search: debouncedSearch, page: 1 });
        }
    }, [debouncedSearch]);

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
                onFinish: () => setProcessing(false),
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
                onFinish: () => setProcessing(false),
            },
        );
    };

    const onEdit = (record: EmployeeDtrPeriod) => {
        router.visit(
            employeeAttendance.url({
                payrollPeriod: Number(filters.period),
                employee: record.id,
            }),
        );
    };

    return (
        <div className="p-4">
            <Head title="Process DTR" />
            {processing && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/85 backdrop-blur-sm"
                    role="status"
                    aria-live="polite"
                    aria-label="Processing daily time records"
                >
                    <Spinner className="size-12 text-primary" />
                    <div className="text-center">
                        <p className="text-lg font-semibold">Processing DTR</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Please wait while attendance records are being
                            processed.
                        </p>
                    </div>
                </div>
            )}
            <Heading
                title="Process DTR"
                description="Manage and process employee daily time records (DTR) for payroll periods."
            />
            <div className="space-y-2">
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

                {filters.period && (
                    <div className="space-y-2">
                        <div className="relative w-full">
                            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="process-dtr-search"
                                placeholder="Type to search..."
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                className="pr-9 pl-9"
                            />
                            {searchInput && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearchInput('')}
                                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                >
                                    <IconX className="size-4" />
                                    <span className="sr-only">
                                        Clear search
                                    </span>
                                </Button>
                            )}
                        </div>
                        <Tabs
                            value={filters.status || 'pending'}
                            onValueChange={(value) =>
                                updateFilters({ status: value, page: 1 })
                            }
                        >
                            <TabsList className="w-full bg-sidebar dark:border">
                                <TabsTrigger value="flagged">
                                    For Review
                                    <Badge className="min-w-6 justify-center border-amber-600 bg-amber-600 px-1.5 text-white hover:bg-amber-600">
                                        {statusCounts?.flagged ?? 0}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="no_entry">
                                    No Entry
                                    <Badge
                                        variant="outline"
                                        className="min-w-6 justify-center border-slate-400 bg-slate-100 px-1.5 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {statusCounts?.no_entry ?? 0}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="pending">
                                    Pending
                                    <Badge className="min-w-6 justify-center border-red-600 bg-red-600 px-1.5 text-white hover:bg-sky-600">
                                        {statusCounts?.pending ?? 0}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="processed">
                                    Processed
                                    <Badge className="min-w-6 justify-center border-emerald-600 bg-emerald-600 px-1.5 text-white hover:bg-emerald-600">
                                        {statusCounts?.processed ?? 0}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <ProcessDtrTable
                            data={employees}
                            onPerPage={(value) =>
                                updateFilters({ limit: value, page: 1 })
                            }
                            onStatusChange={(value) =>
                                updateFilters({ status: value, page: 1 })
                            }
                            initialStatus={filters.status}
                            onEdit={(record) => onEdit(record)}
                            onProcess={(record) => onProcessEmployee(record)}
                            processMode={processMode}
                        />
                    </div>
                )}

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
