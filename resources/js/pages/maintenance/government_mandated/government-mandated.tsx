import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import {
    index,
    store,
    update,
} from '@/routes/maintenance/government_mandated';
import { GovernmentMandatedTable } from '@/pages/maintenance/government_mandated/government-mandated-table';
import type { GovernmentMandated } from '@/types/maintenance';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    government_mandateds: PaginatedData<GovernmentMandated>;
};

export default function GovernmentMandatedPage({ government_mandateds }: Props) {
    const [visible, setVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');
    const [isAdd, setIsAdd] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { data, setData, processing, errors, resetAndClearErrors, post } =
        useForm({
            id: '',
            Code: '',
            Description: '',
            ValueType: '',
            DefaultValue: '',
            File: null as File | null,
            Status: true,
        });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const valueType = data.ValueType.trim().toLowerCase();
    const isTableBased = valueType === 'table-based';
    const isPercentage = valueType === 'percentage';
    const showFileUpload = isTableBased || isPercentage;

    const resetForm = () =>
        setData({
            id: '',
            Code: '',
            Description: '',
            ValueType: '',
            DefaultValue: '',
            File: null,
            Status: true,
        });

    const onAdd = () => {
        resetAndClearErrors();
        resetForm();
        setIsAdd(true);
        setDialogTitle('Add Government Mandated');
        setDialogDescription('Add a new government mandated record to the system.');
        setVisible(true);
    };

    const onEdit = (record: GovernmentMandated) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Government Mandated');
        setDialogDescription('Make changes to this government mandated record. Click save when you are done.');
        setData({
            id: String(record.id),
            Code: record.Code,
            Description: record.Description,
            ValueType: record.ValueType ?? '',
            DefaultValue: record.DefaultValue ?? '',
            File: null,
            Status: record.Status,
        });
        setVisible(true);
    };

    const onCreate = () => {
        post(store.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setVisible(false);
                resetAndClearErrors();
            },
        });
    };

    const onUpdate = () => {
        setIsSaving(true);

        router.post(
            update.url(Number(data.id)),
            {
                ...data,
                _method: 'put',
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    resetAndClearErrors();
                    setVisible(false);
                },
                onFinish: () => {
                    setIsSaving(false);
                },
            },
        );
    };

    return (
        <div className="space-y-4 p-4">
            <Head title="Government Mandated" />
            <Heading
                variant="small"
                title="Government Mandated"
                description="Add, update, and manage government mandated settings."
            />

            <GovernmentMandatedTable
                initialSearch={filters.search}
                data={government_mandateds}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={onEdit}
            />

            <FormDialog
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing || isSaving}
                onAdd={isAdd ? onCreate : onUpdate}
                onCancel={() => setVisible(false)}
                size="2xl"
            >
                <FieldGroup className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.Code} className="gap-2">
                        <FieldLabel htmlFor="government_mandated.Code">Code</FieldLabel>
                        <Input
                            value={data.Code}
                            onChange={(e) => setData('Code', e.target.value)}
                            id="government_mandated.Code"
                            placeholder="Code"
                            aria-invalid={!!errors.Code}
                        />
                        {errors.Code && <FieldError>{errors.Code}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.Description} className="gap-2">
                        <FieldLabel htmlFor="government_mandated.Description">Description</FieldLabel>
                        <Input
                            value={data.Description}
                            onChange={(e) => setData('Description', e.target.value)}
                            id="government_mandated.Description"
                            placeholder="Description"
                            aria-invalid={!!errors.Description}
                        />
                        {errors.Description && <FieldError>{errors.Description}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.ValueType} className="gap-2">
                        <FieldLabel htmlFor="government_mandated.ValueType">Value Type</FieldLabel>
                        <Input
                            value={data.ValueType}
                            onChange={(e) => {
                                const value = e.target.value;
                                setData('ValueType', value);
                                if (value.trim().toLowerCase() === 'table-based') {
                                    setData('DefaultValue', '');
                                }
                            }}
                            id="government_mandated.ValueType"
                            placeholder="Value Type"
                            aria-invalid={!!errors.ValueType}
                        />
                        {errors.ValueType && <FieldError>{errors.ValueType}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.DefaultValue} className="gap-2">
                        <FieldLabel htmlFor="government_mandated.DefaultValue">Default Value</FieldLabel>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.DefaultValue}
                            onChange={(e) => setData('DefaultValue', e.target.value)}
                            id="government_mandated.DefaultValue"
                            placeholder="0.00"
                            readOnly={isTableBased}
                            aria-invalid={!!errors.DefaultValue}
                        />
                        {errors.DefaultValue && <FieldError>{errors.DefaultValue}</FieldError>}
                    </Field>
                    {showFileUpload && (
                        <Field data-invalid={!!errors.File} className="col-span-2 gap-2">
                            <FieldLabel htmlFor="government_mandated.File">File</FieldLabel>
                            <Input
                                type="file"
                                accept="*/*"
                                onChange={(e) => setData('File', e.target.files?.[0] ?? null)}
                                id="government_mandated.File"
                                aria-invalid={!!errors.File}
                            />
                            {errors.File && <FieldError>{errors.File}</FieldError>}
                            {!isAdd && (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to keep the current file.
                                </p>
                            )}
                        </Field>
                    )}
                    <Field data-invalid={!!errors.Status} className="col-span-2 gap-2">
                        <FieldLabel htmlFor="government_mandated.Status">Status</FieldLabel>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.Status}
                                onChange={(e) => setData('Status', e.target.checked)}
                            />
                            Active
                        </label>
                        {errors.Status && <FieldError>{errors.Status}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>
        </div>
    );
}

GovernmentMandatedPage.layout = {
    breadcrumbs: [{ title: 'Government Mandated', href: '#' }],
};
