import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { useInitials } from '@/hooks/use-initials';

import { cn } from '@/lib/utils';
import type { Option } from '@/types/option';

type SearchableSelectProps = {
    items: Option[];
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    placeholder?: string;
    emptyText?: string;
    invalid?: boolean;
    disabled?: boolean;
    className?: string;
    tabIndex?: number;
    id?: string;
};

export default function SearchableSelect({
    items,
    value,
    onValueChange,
    placeholder = 'Select an employee',
    emptyText = 'No results found.',
    invalid,
    disabled,
    className,
    tabIndex,
    id,
}: SearchableSelectProps) {
    const getInitials = useInitials();
    const [open, setOpen] = useState(false);

    const filteredItems = items.filter((item) => item.value !== '');
    const selectedItem =
        filteredItems.find((item) => item.value === value) ?? null;

    const handleSelect = (itemValue: string) => {
        const isSame = itemValue === value;
        onValueChange?.(isSame ? null : itemValue);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={invalid}
                    disabled={disabled}
                    tabIndex={tabIndex}
                    className={cn(
                        'w-full justify-between font-normal',
                        !selectedItem && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">
                        {selectedItem ? selectedItem.label : placeholder}
                    </span>
                    <IconChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
            >
                <Command
                    filter={(itemValue, search) => {
                        const item = filteredItems.find(
                            (i) => i.value === itemValue,
                        );

                        if (!item) {
                            return 0;
                        }

                        return item.label
                            .toLowerCase()
                            .includes(search.toLowerCase())
                            ? 1
                            : 0;
                    }}
                >
                    <CommandInput placeholder="Search..." />
                    <CommandList >
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup heading="Employees">
                            {filteredItems.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={handleSelect}
                                    className="w-full"
                                >
                                    <Avatar>
                                        <AvatarImage
                                            src={item.image_url}
                                            alt="avatar-image"
                                        />
                                        <AvatarFallback>
                                            {getInitials(item.label)}
                                        </AvatarFallback>
                                        {/* <AvatarBadge
                                            className={
                                                item.status
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground'
                                            }
                                        /> */}
                                    </Avatar>
                                    <div className="flex flex-col gap-1">
                                        <span>{item.label}</span>
                                        <small className="text-muted-foreground">
                                            {item.description}
                                        </small>
                                    </div>
                                    {value === item.value && (
                                        <CommandShortcut>
                                            <IconCheck />
                                        </CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
