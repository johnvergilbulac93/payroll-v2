export type CuffOffDate = {
    id: string | number;
    Name: string;
    Cutoff1StartDay: number | undefined;
    Cutoff1EndDay: number | undefined;
    Cutoff2StartDay: number | undefined;
    Cutoff2EndDay: number | undefined;
    IsActive: boolean;
    Label?: string;
};
