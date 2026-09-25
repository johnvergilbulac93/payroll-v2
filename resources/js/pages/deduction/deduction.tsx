import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import { CurrencyField } from '@/components/number-field';
import SearchableSelect from '@/components/searchable-select';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { useUndoableAction } from '@/hooks/use-undoable';
import { DeductionTable } from '@/pages/deduction/deduction-table';
import { index, store, update, destroy as remove } from '@/routes/deduction';
import type { Deduction } from '@/types/deduction';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    deductions: PaginatedData<Deduction>;
    employees: Option[];
    deductionTypes: Option[];
};

const frequencyOptions = [
    { label: 'Every Payday', value: '00' },
    { label: 'Every 15th', value: '15' },
    { label: 'End of Month', value: '30' },
];

export default function Deduction({ deductions, employees, deductionTypes }: Props) {
    const [visible, setVisible] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const { data, setData, processing, errors, resetAndClearErrors, post, put, delete: destroy } =
        useForm({
            id: '',
            EmpID: '',
            DeductionTypeId: '',
            OrigBal: 0,
            DedAmt: 0,
            StartDate: '',
            Frequency: '',
            BalanceAmt: 0,
            BalanceasofDate: 0,
        });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        resetAndClearErrors();
        setData({
            id: '',
            EmpID: '',
            DeductionTypeId: '',
            OrigBal: 0,
            DedAmt: 0,
            StartDate: '',
            Frequency: '',
            BalanceAmt: 0,
            BalanceasofDate: 0,
        });
        setIsAdd(true);
        setVisible(true);
    };

    const onEdit = (record: Deduction) => {
        resetAndClearErrors();
        setIsAdd(false);
        setData({
            id: String(record.id),
            EmpID: record.EmpID,
            DeductionTypeId: record.DeductionTypeId,
            OrigBal: record.OrigBal ?? 0,
            DedAmt: record.DedAmt ?? 0,
            StartDate: record.StartDate,
            Frequency: record.Frequency ?? '',
            BalanceAmt: record.BalanceAmt ?? 0,
            BalanceasofDate: record.BalanceasofDate ?? 0,
        });
        setVisible(true);
    };

    const onCreate = () => {
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setVisible(false);
                resetAndClearErrors();
            },
        });
    };

    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            preserveScroll: true,
            onSuccess: () => {
                setVisible(false);
                resetAndClearErrors();
            },
        });
    };

    const onDelete = (id: number) => {
        destroy(remove.url(id), { preserveScroll: true });
    };

    return (
        <div className="p-4">
            <Head title="Deductions" />
            <Heading
                title="Deductions"
                description="View, add, edit, and manage employee deductions."
            />

            <DeductionTable
                data={deductions}
                initialSearch={filters.search}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={onEdit}
                onDelete={(id) => {
                    setPendingDeleteId(id);
                    setConfirmOpen(true);
                }}
            />

            <FormDialog
                key={isAdd ? 'add' : `edit-${data.id}`}
                open={visible}
                onOpenChange={setVisible}
                title={isAdd ? 'New deduction' : 'Update deduction'}
                description="Manage the selected employee deduction."
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onCreate : onUpdate}
                onCancel={() => setVisible(false)}
                size="4xl"
            >
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.EmpID} className="gap-2">
                        <FieldLabel>Employee</FieldLabel>
                        <SearchableSelect
                            items={employees}
                            value={data.EmpID}
                            onValueChange={(value) => setData('EmpID', value ?? '')}
                            invalid={!!errors.EmpID}
                        />
                        {errors.EmpID && <FieldError>{errors.EmpID}</FieldError>}
                    </Field>

                    <Field data-invalid={!!errors.DeductionTypeId} className="gap-2">
                        <FieldLabel>Deduction type</FieldLabel>
                        <Select
                            value={data.DeductionTypeId}
                            onValueChange={(value) => setData('DeductionTypeId', value)}
                        >
                            <SelectTrigger className="w-full" aria-invalid={!!errors.DeductionTypeId}>
                                <SelectValue placeholder="Select deduction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Deduction type</SelectLabel>
                                    {deductionTypes.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.DeductionTypeId && (
                            <FieldError>{errors.DeductionTypeId}</FieldError>
                        )}
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.OrigBal} className="gap-2">
                        <FieldLabel>Original balance</FieldLabel>
                        <CurrencyField
                            value={data.OrigBal}
                            onChange={(value) => setData('OrigBal', value)}
                            aria-invalid={!!errors.OrigBal}
                        />
                        {errors.OrigBal && <FieldError>{errors.OrigBal}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.DedAmt} className="gap-2">
                        <FieldLabel>Deduction amount</FieldLabel>
                        <CurrencyField
                            value={data.DedAmt}
                            onChange={(value) => setData('DedAmt', value)}
                            aria-invalid={!!errors.DedAmt}
                        />
                        {errors.DedAmt && <FieldError>{errors.DedAmt}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.BalanceAmt} className="gap-2">
                        <FieldLabel>Balance amount</FieldLabel>
                        <CurrencyField
                            value={data.BalanceAmt}
                            onChange={(value) => setData('BalanceAmt', value)}
                            aria-invalid={!!errors.BalanceAmt}
                        />
                        {errors.BalanceAmt && <FieldError>{errors.BalanceAmt}</FieldError>}
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.Frequency} className="gap-2">
                        <FieldLabel>Frequency</FieldLabel>
                        <Select
                            value={data.Frequency}
                            onValueChange={(value) => setData('Frequency', value)}
                        >
                            <SelectTrigger className="w-full" aria-invalid={!!errors.Frequency}>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                {frequencyOptions.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.Frequency && <FieldError>{errors.Frequency}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.StartDate} className="gap-2">
                        <FieldLabel>Deduction start date</FieldLabel>
                        <DatePicker
                            name="StartDate"
                            value={data.StartDate}
                            onChange={(value) => setData('StartDate', value)}
                            error={errors.StartDate}
                        />
                        {errors.StartDate && <FieldError>{errors.StartDate}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.BalanceasofDate} className="gap-2">
                        <FieldLabel>Balance as of date</FieldLabel>
                        <CurrencyField
                            value={data.BalanceasofDate}
                            onChange={(value) => setData('BalanceasofDate', value)}
                            aria-invalid={!!errors.BalanceasofDate}
                        />
                        {errors.BalanceasofDate && <FieldError>{errors.BalanceasofDate}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                icon={<IconTrash />}
                title="Delete deduction?"
                description="This will permanently delete this deduction record."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Deduction record will be deleted',
                            toastId: `delete-deduction-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

Deduction.layout = {
    breadcrumbs: [{ title: 'Deductions', href: index() }],
};
