import {
    IconFileText,
    IconPlus,
    IconTrash,
    IconUpload,
    IconX,
} from '@tabler/icons-react';
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';

export interface FileUploaderHandle {
    browse: () => void;
    reset: () => void;
}

export interface FileUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    errors?: Record<string, string>;
    processing?: boolean;
    name?: string;
    accept?: string;
    multiple?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    actions?: ReactNode;
}

const isDuplicate = (a: File, b: File) => {
    return (
        a.name === b.name &&
        a.size === b.size &&
        a.lastModified === b.lastModified
    );
};

const formatSize = (bytes: number): string => {
    if (bytes === 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const getExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');

    if (lastDot <= 0) {
        return '';
    }

    return filename.slice(lastDot + 1);
};

const getNameWithoutExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');

    if (lastDot <= 0) {
        return filename;
    }

    return filename.slice(0, lastDot);
};

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(
    function FileUploader(
        {
            files,
            onFilesChange,
            errors = {},
            processing = false,
            name = 'Files',
            accept,
            multiple = true,
            emptyTitle = 'Upload files',
            emptyDescription = 'Click below to browse (multiple files allowed)',
            actions = null,
        },
        ref,
    ) {
        const inputRef = useRef<HTMLInputElement>(null);

        const browse = useCallback(() => {
            inputRef.current?.click();
        }, []);

        const reset = useCallback(() => {
            onFilesChange([]);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }, [onFilesChange]);

        useImperativeHandle(ref, () => ({ browse, reset }), [browse, reset]);

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            const incoming = Array.from(event.target.files ?? []);

            if (!incoming.length) {
                return;
            }

            const merged = [...files];

            for (const file of incoming) {
                if (!merged.some((existing) => isDuplicate(existing, file))) {
                    merged.push(file);
                }
            }

            onFilesChange(merged);
            event.target.value = '';
        };

        const removeFile = (index: number) => {
            onFilesChange(files.filter((_, i) => i !== index));
        };

        const attachmentState = (
            index: number,
        ): 'error' | 'uploading' | 'idle' => {
            if (errors[`${name}.${index}`]) {
                return 'error';
            }

            if (processing) {
                return 'uploading';
            }

            return 'idle';
        };

        const attachmentDescription = (index: number, file: File) => {
            return (
                errors[`${name}.${index}`] ??
                `${getExtension(file.name).toUpperCase()} - ${formatSize(file.size)}`
            );
        };

        const totalSize = useMemo(() => {
            return files.reduce((sum, file) => sum + file.size, 0);
        }, [files]);

        return (
            <div>
                <input
                    ref={inputRef}
                    type="file"
                    name={`${name}[]`}
                    className="hidden"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleChange}
                />

                <div className="rounded-lg border border-dashed border-gray-300 p-2 text-center transition-colors ">
                    {files.length === 0 ? (
                        <>
                            <IconUpload className="mx-auto mb-2 h-8 w-8 " />

                            <p className="text-sm font-medium ">
                                {emptyTitle}
                            </p>

                            <p className="mb-4 text-xs text-muted-foreground">
                                {emptyDescription}
                            </p>

                            <button
                                type="button"
                                onClick={browse}
                                className="inline-flex items-center justify-center rounded-md bg-primary hover:bg-primary/90 text-primary-foreground  px-4 py-2 text-sm font-medium  transition-colors "
                            >
                                Choose Files
                            </button>
                        </>
                    ) : (
                        <>
                            <div
                                className="mb-2 space-y-2 overflow-y-auto p-3 text-left"
                                style={{ maxHeight: '12.5rem' }}
                            >
                                {files.map((file, index) => {
                                    const state = attachmentState(index);

                                    // return (
                                    //     <div
                                    //         key={`${file.name}-${file.lastModified}-${index}`}
                                    //         className={`flex w-full items-center gap-3 rounded-md border p-2 ${
                                    //             state === 'error'
                                    //                 ? 'border-red-300 bg-red-50'
                                    //                 : 'border-gray-200 bg-white'
                                    //         }`}
                                    //     >
                                    //         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
                                    //             {state === 'uploading' ? (
                                    //                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                    //             ) : (
                                    //                 <IconFileText className="h-4 w-4 text-gray-500" />
                                    //             )}
                                    //         </div>

                                    //         <div className="min-w-0 flex-1">
                                    //             <p className="truncate text-sm font-medium text-gray-900">
                                    //                 {getNameWithoutExtension(
                                    //                     file.name,
                                    //                 )}
                                    //             </p>

                                    //             <p
                                    //                 className={`truncate text-xs ${
                                    //                     state === 'error'
                                    //                         ? 'text-red-600'
                                    //                         : 'text-gray-500'
                                    //                 }`}
                                    //             >
                                    //                 {attachmentDescription(
                                    //                     index,
                                    //                     file,
                                    //                 )}
                                    //             </p>
                                    //         </div>

                                    //         <button
                                    //             type="button"
                                    //             aria-label={`Remove ${file.name}`}
                                    //             onClick={() =>
                                    //                 removeFile(index)
                                    //             }
                                    //             className="flex h-7 w-7 shrink-0 items-center justify-center rounded p-0 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                    //         >
                                    //             <IconX className="h-4 w-4" />
                                    //         </button>
                                    //     </div>
                                    // );
                                    return (
                                        <Attachment
                                            key={`${file.name}-${file.lastModified}-${index}`}
                                            state={state}
                                            className="w-full"
                                        >
                                            <AttachmentMedia>
                                                {processing && <Spinner />}
                                                {!processing && (
                                                    <IconFileText />
                                                )}
                                            </AttachmentMedia>
                                            <AttachmentContent>
                                                <AttachmentTitle>
                                                    {getNameWithoutExtension(
                                                        file.name,
                                                    )}
                                                </AttachmentTitle>
                                                <AttachmentDescription>
                                                    {attachmentDescription(
                                                        index,
                                                        file,
                                                    )}
                                                </AttachmentDescription>
                                            </AttachmentContent>
                                            <AttachmentActions>
                                                <AttachmentAction
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                    aria-label={`Remove ${file.name}`}
                                                >
                                                    <IconX />
                                                </AttachmentAction>
                                            </AttachmentActions>
                                        </Attachment>
                                    );
                                })}
                            </div>

                            <p className="mb-2 text-xs text-muted-foreground">
                                {files.length} file{files.length > 1 ? 's' : ''}{' '}
                                selected · {formatSize(totalSize)}
                            </p>

                            <div className="flex justify-center gap-2">
                                <Button variant="outline" onClick={browse}>
                                    <IconPlus />
                                    Add more
                                </Button>
                                <Button variant="destructive" onClick={reset}>
                                    <IconTrash />
                                    Clear all
                                </Button>

                                {actions}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    },
);

export default FileUploader;

/* --------------------------------------------------------------------
   Example usage:

   const [files, setFiles] = useState<File[]>([]);
   const uploaderRef = useRef<FileUploaderHandle>(null);

   <FileUploader
       ref={uploaderRef}
       files={files}
       onFilesChange={setFiles}
       name="attachments"
       accept="image/*,.pdf"
       errors={form.errors}
       processing={form.processing}
       actions={
           <button type="submit" disabled={form.processing}>
               Upload
           </button>
       }
   />

-------------------------------------------------------------------- */
