import { Head, InfiniteScroll, useForm } from '@inertiajs/react';
import {
    IconClock,
    IconEdit,
    IconLoader2,
    IconPlus,
    IconSearch,
    IconTrash,
    IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FieldGroup,
    FieldLabel,
    Field,
    FieldContent,
    FieldError,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/hooks/use-debounce';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { cn } from '@/lib/utils';
import { destroy as remove, index, store, update } from '@/routes/shift';
import type { PaginatedData } from '@/types/paginated';
import type { ShiftCode } from '@/types/shift-code';
type Props = {
    shift_codes: PaginatedData<ShiftCode>;
};

function calculateTotalHours(
    timeIn: string | null | undefined,
    timeOut: string | null | undefined,
    breakMinutes: number,
    gracePeriodMinutes: number,
    crossesMidnight: boolean,
) {
    if (typeof timeIn !== 'string' || typeof timeOut !== 'string') {
        return 0;
    }

    const [startHours, startMinutes] = timeIn.split(':').map(Number);
    const [endHours, endMinutes] = timeOut.split(':').map(Number);

    if (
        [startHours, startMinutes, endHours, endMinutes].some((value) =>
            Number.isNaN(value),
        )
    ) {
        return 0;
    }

    const start = startHours * 60 + startMinutes;
    let end = endHours * 60 + endMinutes;

    if (crossesMidnight && end <= start) {
        end += 24 * 60;
    }

    const elapsedMinutes = end - start;
    const totalMinutes =
        elapsedMinutes -
        Math.max(0, breakMinutes || 0) +
        Math.max(0, gracePeriodMinutes || 0);

    return Math.round((Math.max(0, totalMinutes) / 60) * 100) / 100;
}

function crossesMidnight(
    timeIn: string | null | undefined,
    timeOut: string | null | undefined,
) {
    if (typeof timeIn !== 'string' || typeof timeOut !== 'string') {
        return false;
    }

    const [startHours, startMinutes] = timeIn.split(':').map(Number);
    const [endHours, endMinutes] = timeOut.split(':').map(Number);

    if (
        [startHours, startMinutes, endHours, endMinutes].some((value) =>
            Number.isNaN(value),
        )
    ) {
        return false;
    }

    return endHours * 60 + endMinutes < startHours * 60 + startMinutes;
}

export default function ShiftCodeList({ shift_codes }: Props) {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');

    const [visible, setVisible] = useState(false);
    const [isAdd, setIsAdd] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        setData,
        processing,
        post,
        put,
        errors,
        resetAndClearErrors,
        delete: destroy,
    } = useForm({
        id: '',
        Name: '',
        TimeIn: new Date().toTimeString().slice(0, 5),
        TimeOut: new Date().toTimeString().slice(0, 5),
        BreakMinutes: 0,
        GracePeriodMinutes: 0,
        CrossesMidNight: false,
        IsWorkingDay: false,
        TotalHours: 0,
        IsActive: true,
    });
    const { getData, isLoading } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '' },
    });

    useEffect(() => {
        getData({ search: debouncedSearch, page: 1 });
    }, [debouncedSearch, getData]);

    useEffect(() => {
        const shouldCrossMidnight = crossesMidnight(data.TimeIn, data.TimeOut);

        if (data.CrossesMidNight !== shouldCrossMidnight) {
            setData('CrossesMidNight', shouldCrossMidnight);
        }
    }, [data.TimeIn, data.TimeOut, data.CrossesMidNight, setData]);

    useEffect(() => {
        const totalHours = calculateTotalHours(
            data.TimeIn,
            data.TimeOut,
            data.BreakMinutes,
            data.GracePeriodMinutes,
            data.CrossesMidNight,
        );

        if (data.TotalHours !== totalHours) {
            setData('TotalHours', totalHours);
        }
    }, [
        data.TimeIn,
        data.TimeOut,
        data.BreakMinutes,
        data.GracePeriodMinutes,
        data.CrossesMidNight,
        data.TotalHours,
        setData,
    ]);

    const onCreate = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('New shift');
        setDialogDescription('Create a new shift');
        setVisible(true);
    };
    const onSubmit = () => {
        post(store.url(), {
            onSuccess: () => {
                resetAndClearErrors();
                setVisible(false);
            },
        });
    };
    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            onSuccess: () => {
                resetAndClearErrors();
                setVisible(false);
            },
        });
    };
    const onEdit = (row: ShiftCode) => {
        resetAndClearErrors();
        setData({
            id: String(row.id),
            Name: row.Name,
            TimeIn: row.TimeIn ?? '',
            TimeOut: row.TimeOut ?? '',
            BreakMinutes: row.BreakMinutes,
            GracePeriodMinutes: row.GracePeriodMinutes,
            CrossesMidNight: row.CrossesMidNight,
            IsWorkingDay: row.IsWorkingDay,
            TotalHours: row.TotalHours,
            IsActive: row.IsActive,
        });
        setIsAdd(false);
        setDialogTitle('Edit shift');
        setDialogDescription(`Update ${row.Name}.`);
        setVisible(true);
    };
    const onDelete = (id: number) => {
        destroy(remove.url(id));
    };
    const onConfirm = (id: number) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    return (
        <div className="p-4">
            <Head title="Shift Code" />
            <Heading
                title="Shift code"
                description="View, add, edit, and manage shift details."
            />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="relative w-1/2">
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
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={onCreate}>
                        <IconPlus />
                        New shift
                    </Button>
                </div>
                <InfiniteScroll data="shift_codes" className="space-y-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                            <IconLoader2 className="size-4 animate-spin" />
                            Searching shifts...
                        </div>
                    ) : shift_codes.data.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    ) : (
                        shift_codes.data.map((row) => (
                            <Item
                                variant="outline"
                                key={row.id}
                                className="bg-accent"
                            >
                                <ItemMedia>
                                    <IconClock className="text-muted-foreground" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>{row.Name} </ItemTitle>
                                    <ItemDescription>
                                        {row.Schedule}
                                        <br />
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'capitalize',
                                                row.IsActive && 'text-primary',
                                            )}
                                        >
                                            {row.IsActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Button
                                        onClick={() => onEdit(row)}
                                        size="icon-sm"
                                        aria-label="edit"
                                    >
                                        <IconEdit />
                                    </Button>
                                    <Button
                                        onClick={() => onConfirm(row.id)}
                                        size="icon-sm"
                                        variant="destructive"
                                        aria-label="trash"
                                    >
                                        <IconTrash />
                                    </Button>
                                </ItemActions>
                            </Item>
                        ))
                    )}
                </InfiniteScroll>
            </div>
            <FormDialog
                key={isAdd ? 'add' : `edit-${data.id}`}
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onSubmit : onUpdate}
                onCancel={() => setVisible(false)}
                size="2xl"
            >
                <FieldGroup>
                    <Field data-invalid={!!errors.Name}>
                        <FieldLabel htmlFor="Name">Shift name</FieldLabel>
                        <Input
                            id="Name"
                            name="Name"
                            tabIndex={1}
                            value={data.Name}
                            onChange={(e) => setData('Name', e.target.value)}
                            aria-invalid={!!errors.Name}
                        />
                        {errors.Name && <FieldError>{errors.Name}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.TimeIn}>
                        <FieldLabel htmlFor="TimeIn">Time in</FieldLabel>
                        <Input
                            value={data.TimeIn}
                            id="time_in"
                            tabIndex={2}
                            name="TimeIn"
                            type="time"
                            placeholder="time in"
                            onChange={(e) => setData('TimeIn', e.target.value)}
                            aria-invalid={!!errors.TimeIn}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {errors.TimeIn && (
                            <FieldError>{errors.TimeIn}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.TimeOut}>
                        <FieldLabel htmlFor="TimeOut">Time out</FieldLabel>
                        <Input
                            value={data.TimeOut}
                            tabIndex={3}
                            id="time_out"
                            name="TimeOut"
                            type="time"
                            placeholder="time in"
                            onChange={(e) => setData('TimeOut', e.target.value)}
                            aria-invalid={!!errors.TimeOut}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {errors.TimeOut && (
                            <FieldError>{errors.TimeOut}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.BreakMinutes}>
                        <FieldLabel htmlFor="BreakMinutes">
                            Minutes of break
                        </FieldLabel>
                        <Input
                            value={data.BreakMinutes}
                            id="BreakMinutes"
                            tabIndex={4}
                            name="BreakMinutes"
                            min={0}
                            type="number"
                            aria-invalid={!!errors.BreakMinutes}
                            onChange={(e) =>
                                setData(
                                    'BreakMinutes',
                                    Number(e.target.value) || 0,
                                )
                            }
                        />
                        {errors.BreakMinutes && (
                            <FieldError>{errors.BreakMinutes}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.GracePeriodMinutes}>
                        <FieldLabel htmlFor="TimeOut">
                            Grace period minutes
                        </FieldLabel>
                        <Input
                            value={data.GracePeriodMinutes}
                            tabIndex={5}
                            id="GracePeriodMinutes"
                            name="GracePeriodMinutes"
                            type="number"
                            min={0}
                            aria-invalid={!!errors.GracePeriodMinutes}
                            onChange={(e) =>
                                setData(
                                    'GracePeriodMinutes',
                                    Number(e.target.value) || 0,
                                )
                            }
                        />
                        {errors.GracePeriodMinutes && (
                            <FieldError>
                                {errors.GracePeriodMinutes}
                            </FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.TotalHours}>
                        <FieldLabel htmlFor="TotalHours">
                            Total hours
                        </FieldLabel>
                        <Input
                            value={data.TotalHours}
                            tabIndex={6}
                            id="TotalHours"
                            name="TotalHours"
                            type="number"
                            min={0}
                            readOnly
                            aria-invalid={!!errors.TotalHours}
                        />
                        {errors.TotalHours && (
                            <FieldError>{errors.TotalHours}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <FieldLabel htmlFor="crosses-midnight">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Cross midnight</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="crosses-midnight"
                                tabIndex={7}
                                checked={data.CrossesMidNight}
                                onCheckedChange={(checked) =>
                                    setData('CrossesMidNight', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="is-working-day">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Working day</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="is-working-day"
                                tabIndex={8}
                                checked={data.IsWorkingDay}
                                onCheckedChange={(checked) =>
                                    setData('IsWorkingDay', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="is-active">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Status</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="is-active"
                                tabIndex={9}
                                checked={data.IsActive}
                                onCheckedChange={(checked) =>
                                    setData('IsActive', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                </FieldGroup>
            </FormDialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete shift?"
                description="This will permanently delete this shift record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Shift will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}
ShiftCodeList.layout = {
    breadcrumbs: [
        {
            title: 'Shift Code',
            href: '#',
        },
    ],
};
