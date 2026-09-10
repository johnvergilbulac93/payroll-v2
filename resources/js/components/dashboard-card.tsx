import type { Icon } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

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
        <div className="rounded-lg border overflow-hidden">
            <div className="p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary">
                        <Icon size={25} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-semibold">{value}</p>
                    </div>
                </div>
                {sublabel && (
                    <p className="mt-3 text-xs text-muted">{sublabel}</p>
                )}
            </div>
            <div className="border-t">
                <button
                    className="flex w-full items-center justify-center bg-blue-50 px-4 py-2 text-xs text-primary hover:underline "
                    onClick={onClick}
                >
                    Click here
                </button>
            </div>
        </div>
    );
}
