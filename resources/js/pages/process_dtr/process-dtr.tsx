import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
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
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type { EmployeeDtrPeriod, PayrollPeriod } from '@/types/payroll-period';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { index } from '@/routes/dtr';

type Props = {
    employees: PaginatedData<EmployeeDtrPeriod>;
    periods: PayrollPeriod[];
    employee_details?: Option;
};

export default function ProcessDtrPage({
    employees,
    periods,
    employee_details,
}: Props) {
    const { filters, updateFilters, isLoading } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { period: '' },
    });

    return (
        <div className="p-4">
            <Head title="Process DTR" />
            <Heading
                title="Process DTR"
                description="Manage and process employee daily time records (DTR) for payroll periods."
            />
            <div className="space-y-4">
                <div>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="filter.year">
                                Cut-Off Periods
                            </FieldLabel>
                            <Select
                                value={filters.period}
                                onValueChange={(value) =>
                                    updateFilters({ period: value })
                                }
                            >
                                <SelectTrigger id="filter.year">
                                    <SelectValue placeholder="Select a period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Periods</SelectLabel>
                                        {periods.map((period) => (
                                            <SelectItem
                                                key={period.Label}
                                                value={period.id.toString()}
                                            >
                                                {period.Label} -{' '}
                                                {period.PayDate}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                </div>
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
