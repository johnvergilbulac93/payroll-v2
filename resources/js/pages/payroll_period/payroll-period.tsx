import { Head, useForm, router } from '@inertiajs/react';

import { useState } from 'react';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';

import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from '@/components/ui/field';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { PayrollPeriodTable } from '@/pages/payroll_period/payroll-period-table';
import { index, store, processIndex } from '@/routes/payroll_period';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type { PayrollPeriod } from '@/types/payroll-period';
type Props = {
    payroll_periods: PaginatedData<PayrollPeriod>;
    cutoff_dates: Option[];
};

const years: Option[] = Array.from({ length: 6 }, (_, index) => {
    const year = new Date().getFullYear() + index;

    return {
        label: String(year),
        value: String(year),
    };
});
export default function PayrollPeriodPage({
    payroll_periods,
    cutoff_dates,
}: Props) {
    const [visible, setVisible] = useState(false);

    const { data, setData, processing, post, errors, resetAndClearErrors } =
        useForm({
            id: '',
            Year: String(new Date().getFullYear()),
            CutoffDateID: '',
        });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: {
            year: '',
            page: 1,
            limit: 10,
            search: '',
            month: '',
            status: '',
        },
    });

    const onAdd = () => {
        resetAndClearErrors();
        setVisible(true);
    };
    const onSubmit = () => {
        post(store.url(), {
            onSuccess: () => {
                setVisible(false);
            },
        });
    };

    return (
        <div className="p-4">
            <Head title="Payroll Periods" />
            <Heading
                title="Payroll Periods"
                description="Manage payroll periods, dates, and processing status."
            />
            <PayrollPeriodTable
                data={payroll_periods}
                initialSearch={filters.search}
                initialYear={filters.year}
                initialMonth={filters.month}
                initialStatus={filters.status}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onYearChange={(value) =>
                    updateFilters({ year: value, page: 1 })
                }
                onMonthChange={(value) =>
                    updateFilters({ month: value, page: 1 })
                }
                onStatusChange={(value) =>
                    updateFilters({ status: value, page: 1 })
                }
                onAdd={onAdd}
                onEdit={(record) =>
                    router.visit(processIndex.url(Number(record.id)), {
                        preserveScroll: true,
                    })
                }
            />

            <FormDialog
                key="generate-yearly-payroll-period"
                open={visible}
                onOpenChange={setVisible}
                title="Generate Payroll Period"
                description="This will generate payroll periods for the entire year based on the selected cutoff date."
                addText="Generate"
                loading={processing}
                onAdd={onSubmit}
                onCancel={() => setVisible(false)}
                size="xl"
            >
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.Year}>
                        <FieldLabel htmlFor="payroll-period.year">
                            Year
                        </FieldLabel>
                        <Select
                            value={data.Year}
                            onValueChange={(value) => setData('Year', value)}
                        >
                            <SelectTrigger
                                id="payroll-period.year"
                                aria-invalid={!!errors.Year}
                            >
                                <SelectValue placeholder="Select a year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Year</SelectLabel>
                                    {years.map((year) => (
                                        <SelectItem
                                            key={year.value}
                                            value={year.value}
                                        >
                                            {year.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.Year && <FieldError>{errors.Year}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.CutoffDateID}>
                        <FieldLabel htmlFor="payroll-period.cutoff-date">
                            Cutoff Date
                        </FieldLabel>
                        <Select
                            value={data.CutoffDateID}
                            onValueChange={(value) =>
                                setData('CutoffDateID', value)
                            }
                        >
                            <SelectTrigger
                                id="payroll-period.cutoff-date"
                                aria-invalid={!!errors.CutoffDateID}
                            >
                                <SelectValue placeholder="Select a cutoff date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Cutoff Date</SelectLabel>
                                    {cutoff_dates.map((date) => (
                                        <SelectItem
                                            key={date.value}
                                            value={date.value}
                                        >
                                            {date.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.CutoffDateID && (
                            <FieldError>{errors.CutoffDateID}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>
        </div>
    );
}

PayrollPeriodPage.layout = {
    breadcrumbs: [
        {
            title: 'Payroll Periods',
            href: index.url(),
        },
    ],
};
