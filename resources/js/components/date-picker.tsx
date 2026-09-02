// components/date-picker.tsx
import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    id?: string;
    name?: string;
    value: string; // 'yyyy-MM-dd' or ''
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    fromDate?: Date;
    toDate?: Date;
    tabIndex?: number
}

export function DatePicker({
    id,
    name,
    value,
    onChange,
    placeholder = 'Pick a date',
    error,
    disabled,
    className,
    fromDate,
    toDate,
    tabIndex,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? new Date(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={!!error}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                    tabIndex={tabIndex}
                >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {selected ? (
                        format(selected, 'PPP')
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        setOpen(false);
                    }}
                    disabled={(date) =>
                        (fromDate ? date < fromDate : false) ||
                        (toDate ? date > toDate : false)
                    }
                    captionLayout="dropdown"
                    startMonth={new Date(1950, 0)}
                    endMonth={new Date(new Date().getFullYear() + 1, 11)}
                    autoFocus
                />
            </PopoverContent>
            {name && <input type="hidden" name={name} value={value} />}
        </Popover>
    );
}
