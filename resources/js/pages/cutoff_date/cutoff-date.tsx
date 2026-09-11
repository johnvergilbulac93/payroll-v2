import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import {
    FieldGroup,
    FieldLabel,
    Field,
    FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { CutoffDateTable } from '@/pages/cutoff_date/cutoff-date-table';
import { destroy as remove, index, store, update } from '@/routes/cutoff';
import type { CuffOffDate } from '@/types/cutoff-date';
import type { PaginatedData } from '@/types/paginated';
type Props = {
    cutoff_dates: PaginatedData<CuffOffDate>;
};
const initialData: CuffOffDate = {
    id: '',
    Name: '',
    Cutoff1StartDay: undefined,
    Cutoff1EndDay: undefined,
    Cutoff2StartDay: undefined,
    Cutoff2EndDay: undefined,
    IsActive: true,
};

export default function CutoffDatePage({ cutoff_dates }: Props) {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const [visible, setVisible] = useState(false);
    const [isAdd, setIsAdd] = useState(false);

    const {
        data,
        setData,
        processing,
        post,
        put,
        errors,
        resetAndClearErrors,
        delete: destroy,
    } = useForm(initialData);

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onCreate = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('New Cut-off');
        setDialogDescription('Create a new cut-off date');
        setVisible(true);
    };
    const onEdit = (row: CuffOffDate) => {
        resetAndClearErrors();
        setData({
            id: row.id,
            Name: row.Name,
            Cutoff1StartDay: row.Cutoff1StartDay,
            Cutoff1EndDay: row.Cutoff1EndDay,
            Cutoff2StartDay: row.Cutoff2StartDay,
            Cutoff2EndDay: row.Cutoff2EndDay,
            IsActive: row.IsActive,
        });
        setIsAdd(false);
        setDialogTitle('Edit Cut-off ');
        setDialogDescription(`Update ${row.Name}`);
        setVisible(true);
    };
    const onConfirm = (id: string | number) => {
        setPendingDeleteId(Number(id));
        setConfirmOpen(true);
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
    const onDelete = (id: number) => {
        destroy(remove.url(id));
    };

    return (
        <div className="p-4">
            <Head title="Cut-off dates" />
            <Heading
                title="Cut-off dates"
                description="View, add, edit, and manage cutoff date details."
            />
            <CutoffDateTable
                initialSearch={filters.search}
                data={cutoff_dates}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onCreate}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={onEdit}
                onDelete={onConfirm}
            />
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
                        <FieldLabel htmlFor="CutoffName">
                            Cut-Off name
                        </FieldLabel>
                        <Input
                            id="CutoffName"
                            name="CutoffName"
                            placeholder="Cut-Off name"
                            tabIndex={1}
                            value={data.Name}
                            onChange={(e) => setData('Name', e.target.value)}
                            aria-invalid={!!errors.Name}
                        />
                        {errors.Name && <FieldError>{errors.Name}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.Cutoff1StartDay}>
                        <FieldLabel htmlFor="Cutoff1StartDay">
                            Start Day Cut-off 1
                        </FieldLabel>
                        <Input
                            value={data.Cutoff1StartDay ?? ''}
                            id="Cutoff1StartDay"
                            tabIndex={2}
                            name="Cutoff1StartDay"
                            placeholder="Start Day Cut-off 1"
                            min={0}
                            max={31}
                            type="number"
                            aria-invalid={!!errors.Cutoff1StartDay}
                            onChange={(e) =>
                                setData(
                                    'Cutoff1StartDay',
                                    e.target.value === ''
                                        ? undefined
                                        : Number(e.target.value),
                                )
                            }
                        />
                        {errors.Cutoff1StartDay && (
                            <FieldError>{errors.Cutoff1StartDay}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.Cutoff1EndDay}>
                        <FieldLabel htmlFor="Cutoff2EndDay">
                            End Day Cut-off 1
                        </FieldLabel>
                        <Input
                            value={data.Cutoff1EndDay ?? ''}
                            id="Cutoff1EndDay"
                            tabIndex={3}
                            name="Cutoff1EndDay"
                            placeholder="End Day Cut-off 1"
                            min={0}
                            max={31}
                            type="number"
                            aria-invalid={!!errors.Cutoff1EndDay}
                            onChange={(e) =>
                                setData(
                                    'Cutoff1EndDay',
                                    e.target.value === ''
                                        ? undefined
                                        : Number(e.target.value),
                                )
                            }
                        />
                        {errors.Cutoff1EndDay && (
                            <FieldError>{errors.Cutoff1EndDay}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.Cutoff2StartDay}>
                        <FieldLabel htmlFor="Cutoff2StartDay">
                            Start Day Cut-off 2
                        </FieldLabel>
                        <Input
                            value={data.Cutoff2StartDay ?? ''}
                            id="Cutoff2StartDay"
                            tabIndex={4}
                            name="Cutoff2StartDay"
                            placeholder="Start Day Cut-off 2"
                            min={0}
                            max={31}
                            type="number"
                            aria-invalid={!!errors.Cutoff2StartDay}
                            onChange={(e) =>
                                setData(
                                    'Cutoff2StartDay',
                                    e.target.value === ''
                                        ? undefined
                                        : Number(e.target.value),
                                )
                            }
                        />
                        {errors.Cutoff2StartDay && (
                            <FieldError>{errors.Cutoff2StartDay}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.Cutoff2EndDay}>
                        <FieldLabel htmlFor="Cutoff2EndDay">
                            End Day Cut-off 2
                        </FieldLabel>
                        <Input
                            value={data.Cutoff2EndDay ?? ''}
                            id="Cutoff2EndDay"
                            tabIndex={5}
                            name="Cutoff2EndDay"
                            placeholder="End Day Cut-off 2"
                            min={0}
                            max={31}
                            type="number"
                            aria-invalid={!!errors.Cutoff2EndDay}
                            onChange={(e) =>
                                setData(
                                    'Cutoff2EndDay',
                                    e.target.value === ''
                                        ? undefined
                                        : Number(e.target.value),
                                )
                            }
                        />
                        {errors.Cutoff2EndDay && (
                            <FieldError>{errors.Cutoff2EndDay}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete cut-off date?"
                description="This will permanently delete this cut-off date. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Cut-off date will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

CutoffDatePage.layout = {
    breadcrumbs: [
        {
            title: 'Cut-off Dates',
            href: index.url(),
        },
    ],
};
