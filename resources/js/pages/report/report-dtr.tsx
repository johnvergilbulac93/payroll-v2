import { Head, router, useForm } from '@inertiajs/react';
import {
    IconCalendar,
    IconCheck,
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Spinner } from '@/components/ui/spinner';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { cleanParams } from '@/lib/utils';
import { ReportEmployeeDtrTable } from '@/pages/report/report-dtr-table';
import { generateDtr } from '@/routes/report';
import type { Filter } from '@/types/filter';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type { EmployeeDtrPeriod, PayrollPeriod } from '@/types/payroll-period';
type Props = {
    employees: PaginatedData<EmployeeDtrPeriod>;
    periods: PayrollPeriod[];
    groups: Option[];
    filter?: Filter;
};

type ProcessMode = 'all' | 'per-employee';

export default function ReportDtrPage({
    employees,
    periods,
    groups,
    filter,
}: Props) {
    const [processMode, setProcessMode] = useState<ProcessMode>('all');
    const [openCommand, setOpenCommand] = useState(false);

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: generateDtr.url(),
        defaults: { search: '', page: 1, limit: 10, period: '', group: '' },
    });

    const { data, setData, get, transform, processing } = useForm({
        period: filter?.period ?? '',
        group: filter?.group ?? '',
    });

    const selectedPeriodData = periods.find(
        (period) => period.id.toString() === data.period,
    );
    const selectedPeriodLabel = selectedPeriodData
        ? `${selectedPeriodData.Label} - ${selectedPeriodData.PayDate}`
        : 'Select a Period';

    transform((data) => cleanParams(data));

    const onGenerate = () => {
        get(generateDtr.url(), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const onAdd = () => {
        alert('add');
    };

    return (
        <div className="p-4">
            <Head title="Report" />
            <Heading
                title="Generate Daily Time Record"
                description="Generate daily time records for employees."
            />
            <div className="space-y-4">
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
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
                        <FieldLabel>Groups</FieldLabel>
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
                        <FieldLabel>Generate mode</FieldLabel>
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
                        <Button onClick={onGenerate} className="w-fit!">
                            {processing && <Spinner />}
                            Generate Dtr
                        </Button>
                    </Field>
                </FieldGroup>
                {employees.data.length > 0 && (
                    <ReportEmployeeDtrTable
                        initialSearch={filters.search}
                        data={employees}
                        // onSelectionChange={setSelectedUserIds}
                        onSearch={(value) =>
                            updateFilters({ search: value, page: 1 })
                        }
                        onAdd={onAdd}
                        onPerPage={(value) =>
                            updateFilters({ limit: value, page: 1 })
                        }
                    />
                )}
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
                                    <span>
                                        {period.Label} - {period.PayDate}
                                    </span>
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
