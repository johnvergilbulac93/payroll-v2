import { Head, useForm, router } from '@inertiajs/react';
import {
    IconCalendarMonth,
    IconEye,
    IconLoader2,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from '@/components/ui/field';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { cn } from '@/lib/utils';
import { index, store, processIndex } from '@/routes/payroll_period';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type { PayrollPeriod } from '@/types/payroll-period';
import { FormDialog } from '../../components/base-modal';
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

const months: Option[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(2000, index, 1);

    return {
        label: date.toLocaleString('default', { month: 'long' }),
        value: String(index + 1),
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

    const { filters, updateFilters, isLoading } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { Year: '', Month: '', page: 1 },
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

    const onConfirm = (id: string) => {
        console.log(id);
    };

    return (
        <div className="p-4">
            <Head title="Payroll Periods" />
            <Heading
                title="Payroll Periods"
                description="Manage payroll periods, dates, and processing status."
            />
            <div className="space-y-4">
                <div className="flex items-end justify-between gap-8">
                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="filter.year">Year</FieldLabel>
                            <Select
                                value={filters.Year}
                                onValueChange={(value) =>
                                    updateFilters({ Year: value, page: 1 })
                                }
                            >
                                <SelectTrigger id="filter.year">
                                    <SelectValue placeholder="Select a year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value=""></SelectItem>
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
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="filter.month">
                                Month
                            </FieldLabel>
                            <Select
                                value={filters.Month}
                                onValueChange={(value) =>
                                    updateFilters({ Month: value, page: 1 })
                                }
                            >
                                <SelectTrigger id="filter.month">
                                    <SelectValue placeholder="Select a month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Month</SelectLabel>
                                        {months.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={month.value}
                                            >
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                    <Button onClick={onAdd}>
                        <IconPlus /> Generate Yearly Period
                    </Button>
                </div>
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                            <IconLoader2 className="size-4 animate-spin" />
                            Searching payroll period...
                        </div>
                    ) : payroll_periods.data.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    ) : (
                        payroll_periods.data.map((row) => (
                            <Item
                                variant="outline"
                                key={row.id}
                                className="bg-accent"
                            >
                                <ItemMedia>
                                    <IconCalendarMonth className="text-muted-foreground" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>{row.Label} </ItemTitle>
                                    <ItemDescription>
                                        {row.Cutoff} | {row.PeriodStart} -{' '}
                                        {row.PeriodEnd} | Pay Date:{' '}
                                        {row.PayDate}
                                        <br />
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'capitalize',
                                                row.Status === 'open' &&
                                                    'text-primary',
                                                row.Status === 'processing' &&
                                                    'text-blue-500',
                                                row.Status === 'closed' &&
                                                    'text-destructive',
                                            )}
                                        >
                                            {row.Status}
                                        </Badge>
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                onClick={() =>
                                                    router.visit(
                                                        processIndex.url(
                                                            Number(row.id),
                                                        ),
                                                    )
                                                }
                                                size="icon-sm"
                                                aria-label="edit"
                                            >
                                                <IconEye />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Process payroll period
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                onClick={() =>
                                                    onConfirm(row.id)
                                                }
                                                size="icon-sm"
                                                variant="destructive"
                                                aria-label="trash"
                                            >
                                                <IconTrash />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Delete payroll period
                                        </TooltipContent>
                                    </Tooltip>
                                </ItemActions>
                            </Item>
                        ))
                    )}
                </div>
            </div>

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
