import * as React from 'react';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

type BarChartData = Record<string, string | number>;

type BarChartProps = {
    data: BarChartData[];
    dataKey: string;
    categoryKey: string;
    label?: string;
    color?: string;
    className?: string;
};

export function BarChart({
    data,
    dataKey,
    categoryKey,
    label = 'Value',
    color = 'var(--primary)',
    className,
}: BarChartProps) {
    const config: ChartConfig = {
        [dataKey]: {
            label,
            color,
        },
    };

    return (
        <ChartContainer
            config={config}
            className={className ?? 'h-[280px] w-full'}
        >
            <RechartsBarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={categoryKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
        </ChartContainer>
    );
}
