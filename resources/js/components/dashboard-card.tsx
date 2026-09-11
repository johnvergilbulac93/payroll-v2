import type { Icon } from '@tabler/icons-react';
type DashboardCardProps = {
    icon: Icon;
    label: string;
    value: string | number;
    sublabel?: string;
    onClick?: () => void;
};

export function DashboardCard({
    icon: Icon,
    label,
    value,
    sublabel,
    onClick,
}: DashboardCardProps) {
    return (
        <div
            className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(event) => {
                if (onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex-1 p-4 sm:p-5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                            {value}
                        </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-11">
                        <Icon size={21} stroke={1.8} />
                    </div>
                </div>
                {sublabel && (
                    <p className="mt-3 text-xs text-muted-foreground">{sublabel}</p>
                )}
            </div>
            {onClick && (
                <div className="border-t bg-muted/20 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    View details <span aria-hidden="true">→</span>
                </div>
            )}
        </div>
    );
}
