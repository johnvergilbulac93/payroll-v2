import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { BiometricUploadingTable } from '@/pages/biometric/biometric-uploading-table';
import type { FileUploaderHandle } from '@/pages/biometric/file-uploader';
import FileUploader from '@/pages/biometric/file-uploader';
import { store, index, destroy as remove } from '@/routes/uploading';
import { reprocess } from '@/routes/uploading';
import type {
    BiometricUploading,
    UploadForm,
} from '@/types/biometric-uploading';
import type { PaginatedData } from '@/types/paginated';
type Props = {
    UploadedFiles: PaginatedData<BiometricUploading>;
};
export default function UploadBiometric({ UploadedFiles }: Props) {
    const [open, setOpen] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const uploaderRef = useRef<FileUploaderHandle>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, errors, post, resetAndClearErrors, processing } =
        useForm<UploadForm>({
            attachments: [],
        });

    const {
        data: form,
        setData: setForm,
        post: update,
        delete: destroy,
        processing: reprocessLoading,
    } = useForm({
        id: '',
        filename: '',
        uploadedBy: '',
        status: '',
        total_rows: 0,
        imported_rows: 0,
        skipped_rows: 0,
        failed_row: 0,
        start_at: '',
        finished_at: '',
        uploaded_at: '',
    });
    const { trigger: triggerUndoable } = useUndoableAction<number>();
    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        resetAndClearErrors();
        setOpen(true);
    };
    const onEdit = (file: BiometricUploading) => {
        setForm('filename', file.FileName);
        setForm('id', String(file.id));
        setForm('uploadedBy', file.UploadedBy);
        setForm('status', file.Status);
        setForm('total_rows', file.TotalRows);
        setForm('imported_rows', file.ImportedRows);
        setForm('skipped_rows', file.SkippedRows);
        setForm('failed_row', file.FailedRows);
        setForm('start_at', file.StartedAt);
        setForm('finished_at', file.FinishedAt);
        setForm('uploaded_at', file.DateUploaded);
        setOpenViewDialog(true);
    };
    const onConfirm = (value: number) => {
        setPendingDeleteId(value);
        setConfirmOpen(true);
    };

    const onUpload = () => {
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                resetAndClearErrors();
                setOpen(false);
            },
        });
    };

    const onReprocess = () => {
        update(reprocess.url(Number(form.id)), {
            preserveScroll: true,
            onSuccess: () => setOpenViewDialog(false),
        });
    };
    const onDelete = (id: number) => {
        destroy(remove.url(id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="p-4">
            <Head title="Biometric Uploading" />
            <Heading
                title="Biometric Uploading"
                description="Upload biometric .dat files for processing."
            />
            <BiometricUploadingTable
                initialSearch={filters.search}
                data={UploadedFiles}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(file) => onEdit(file)}
                onDelete={(value) => onConfirm(value)}
            />
            <FormDialog
                key="biometric-uploading"
                open={open}
                onOpenChange={setOpen}
                title="Biometric Uploading"
                description="Upload biometric .dat file for processing"
                addText="Upload"
                onAdd={onUpload}
                loading={processing}
                onCancel={() => setOpen(false)}
                size="xl"
                disabled={data.attachments.length === 0}
            >
                <FileUploader
                    ref={uploaderRef}
                    files={data.attachments}
                    onFilesChange={(files) => setData('attachments', files)}
                    name="attachments"
                    accept=".dat"
                    errors={errors}
                    processing={processing}
                />
            </FormDialog>
            <FormDialog
                key="biometric-uploaded-viewing"
                open={openViewDialog}
                onOpenChange={setOpenViewDialog}
                title={form.filename}
                description="Reprocess the selected biometric file"
                addText="Reprocess"
                onAdd={onReprocess}
                loading={reprocessLoading}
                onCancel={() => setOpenViewDialog(false)}
                size="3xl"
            >
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="form.filename">
                            File name
                        </FieldLabel>
                        <Input
                            tabIndex={1}
                            id="form.filename"
                            value={form.filename}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.uploadedBy">
                            Uploaded by
                        </FieldLabel>
                        <Input
                            tabIndex={2}
                            id="form.uploadedBy"
                            value={form.uploadedBy}
                            readOnly
                        />
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Field>
                        <FieldLabel htmlFor="form.total_rows">
                            Total rows
                        </FieldLabel>
                        <Input
                            tabIndex={3}
                            id="form.total_rows"
                            value={form.total_rows}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.imported_rows">
                            Imported rows
                        </FieldLabel>
                        <Input
                            tabIndex={4}
                            id="form.imported_rows"
                            value={form.imported_rows}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.skipped_rows">
                            Skipped rows
                        </FieldLabel>
                        <Input
                            tabIndex={5}
                            id="form.skipped_rows"
                            value={form.skipped_rows}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.failed_rows">
                            Failed rows
                        </FieldLabel>
                        <Input
                            tabIndex={6}
                            id="form.failed_rows"
                            value={form.failed_row}
                            readOnly
                        />
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field>
                        <FieldLabel htmlFor="form.start_at">
                            Start at
                        </FieldLabel>
                        <Input
                            tabIndex={7}
                            id="form.start_at"
                            value={form.start_at}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.finished_at">
                            Finished at
                        </FieldLabel>
                        <Input
                            tabIndex={8}
                            id="form.finished_at"
                            value={form.finished_at}
                            readOnly
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="form.uploaded_at">
                            Date uploaded
                        </FieldLabel>
                        <Input
                            tabIndex={9}
                            id="form.uploaded_at"
                            value={form.uploaded_at}
                            readOnly
                        />
                    </Field>
                </FieldGroup>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete file?"
                description="This will permanently delete this record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'File will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}
UploadBiometric.layout = {
    breadcrumbs: [
        {
            title: 'Biometric uploading',
            href: index(),
        },
    ],
};
