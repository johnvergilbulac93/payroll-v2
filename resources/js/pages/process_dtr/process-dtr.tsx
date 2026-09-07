import { Head, InfiniteScroll, router } from '@inertiajs/react';
import { IconEye, IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
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
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import { useInitials } from '@/hooks/use-initials';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { cn } from '@/lib/utils';
import { EmployeeDtr } from '@/pages/process_dtr/employee-dtr';
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

export default function ProcessDtrPage({ employees, periods }: Props) {
    const [processing, setProcessing] = useState(false);
    const [openDialogDtr, setOpenDialogDtr] = useState(false);
    const [description, setDescription] = useState('');

    const [employeeDtr, setEmployeeDtr] = useState<DTRRecordsDetails[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const getInitials = useInitials();
    const { filters, updateFilters, getData } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { period: '', search: '', page: 1 },
    });

    useEffect(() => {
        getData({ search: debouncedSearch, page: 1, period: filters.period });
    }, [debouncedSearch, filters.period, getData]);

    const onProcessDTR = () => {
        router.post(
            processDTRPeriod.url(Number(filters.period)),

            {},

            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onSuccess: () => setProcessing(false),
                onHttpException: () => setProcessing(false),
            },
        );
    };
    const onProcessEmployee = (employee: EmployeeDtrPeriod) => {
        router.post(
            processPerEmployee.url([Number(filters.period), employee.id]),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onSuccess: () => setProcessing(false),
                onHttpException: () => setProcessing(false),
            },
        );
    };

    const onViewDTR = (employee: EmployeeDtrPeriod) => {
        setEmployeeDtr(employee.DTRRecords ?? []);
        setDescription(`${employee.FullName} - ${employee.Period}`);
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
                <div className="flex items-end justify-between">
                    <FieldGroup className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5">
                        <Field className="col-span-2">
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
                        <Field className="col-span-2">
                            <div className="relative">
                                <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    id="input-button-group"
                                    placeholder="Type to search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-9 pl-9"
                                />
                                {search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSearch('')}
                                        className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    >
                                        <IconX className="size-4" />
                                        <span className="sr-only">
                                            Clear search
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </Field>
                        <Field>
                            <Button
                                onClick={onProcessDTR}
                                disabled={
                                    employees.data.length == 0 || processing
                                }
                            >
                                {processing ? <Spinner /> : <IconRefresh />}
                                Process All
                            </Button>
                        </Field>
                    </FieldGroup>
                </div>
                <div className="space-y-2">
                    <InfiniteScroll data="employees" className="space-y-2">
                        {employees.data.map((employee) => (
                            <Item
                                variant="outline"
                                className="bg-accent"
                                key={employee.id}
                            >
                                <ItemMedia>
                                    <Avatar className="size-10">
                                        <AvatarImage src={employee.Image} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getInitials(employee.FullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>
                                        <div className="flex items-center justify-between gap-4">
                                            <span>{employee.FullName}</span>
                                            {employee.Remarks ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'capitalize',
                                                                employee.Status ===
                                                                    'flagged' &&
                                                                    'bg-amber-600 text-primary-foreground',
                                                                employee.Status ===
                                                                    'processed' &&
                                                                    'bg-primary text-primary-foreground',
                                                                employee.Status ===
                                                                    'closed' &&
                                                                    'bg-destructive text-destructive-foreground',
                                                            )}
                                                        >
                                                            {employee.Status}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            {employee.Remarks}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'capitalize',
                                                        employee.Status ===
                                                            'flagged' &&
                                                            'bg-amber-600 text-primary-foreground',
                                                        employee.Status ===
                                                            'processed' &&
                                                            'bg-primary text-primary-foreground',
                                                        employee.Status ===
                                                            'closed' &&
                                                            'bg-destructive text-destructive-foreground',
                                                    )}
                                                >
                                                    {employee.Status}
                                                </Badge>
                                            )}
                                            <small>
                                                {employee.ProcessAt
                                                    ? `Last processed: ${employee.ProcessAt} `
                                                    : ''}
                                            </small>
                                        </div>
                                    </ItemTitle>
                                    <ItemDescription>
                                        {employee.EmpNbr}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    {employee.DTRRecords?.length != 0 && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button
                                                    size="icon-sm"
                                                    variant="outline"
                                                    aria-label="View dtr"
                                                    onClick={() =>
                                                        onViewDTR(employee)
                                                    }
                                                >
                                                    <IconEye />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View Dtr</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button
                                                size="icon-sm"
                                                aria-label="Process"
                                                onClick={() =>
                                                    onProcessEmployee(employee)
                                                }
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <Spinner />
                                                ) : (
                                                    <IconRefresh />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Process dtr</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </ItemActions>
                            </Item>
                        ))}
                    </InfiniteScroll>
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
