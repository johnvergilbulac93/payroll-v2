import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Item, ItemContent, ItemTitle, ItemMedia } from '@/components/ui/item';
import { useInitials } from '@/hooks/use-initials';
import type { Option } from '@/types/option';

type ComboBoxProps = {
    items: Option[];
    value?: Option | null;
    onValueChange?: (value: Option | null) => void;
    resultEmpty?: string;
    placeholder?: string;
};

export default function ComboBox({
    items,
    value,
    onValueChange,
    resultEmpty = 'No user found.',
    placeholder = 'Select a user',
}: ComboBoxProps) {
    const getInitials = useInitials();

    return (
        <Combobox
            items={items.filter((item) => item.value !== '')}
            value={value}
            onValueChange={onValueChange}
            itemToStringLabel={(item: Option) => item.label}
            itemToStringValue={(item: Option) => item.value}
        >
            <ComboboxInput placeholder={placeholder} />
            <ComboboxContent>
                <ComboboxEmpty>{resultEmpty}</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                            <Item size="xs" className="p-0">
                                <ItemMedia>
                                    <Avatar>
                                        <AvatarImage
                                            src={item.image_url}
                                            alt="avatar-image"
                                        />
                                        <AvatarFallback>
                                            {getInitials(item.label)}
                                        </AvatarFallback>
                                        <AvatarBadge
                                            className={
                                                item.status
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground'
                                            }
                                        />
                                    </Avatar>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="whitespace-nowrap">
                                        {item.label}{' '}
                                    </ItemTitle>
                                </ItemContent>
                            </Item>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
