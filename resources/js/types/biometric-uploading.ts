export type BiometricUploading = {
    id: number;
    FileName: string;
    UploadedBy: string;
    Status: string;
    TotalRows: number;
    ImportedRows: number;
    SkippedRows: number;
    FailedRows: number;
    StartedAt: string;
    FinishedAt: string;
    DateUploaded: string;
};

export type UploadForm = {
    attachments: File[];
};
