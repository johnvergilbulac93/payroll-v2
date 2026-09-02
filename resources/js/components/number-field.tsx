import { IconCurrencyPeso } from '@tabler/icons-react';
import { useState } from 'react';
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from '@/components/ui/input-group';

type CurrencyFieldProps = {
    value: number;
    onChange: (value: number) => void;
    id?: string;
    name?: string;
    'aria-invalid'?: boolean;
    tabIndex?: number;
    min?: number;
    disabled?: boolean;
};

function formatWithCommas(raw: string): string {
    if (raw === '') {
        return '';
    }

    const [intPart, decPart] = raw.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function parseNumber(display: string): number {
    return Number(display.replace(/,/g, ''));
}

export function CurrencyField({
    value,
    onChange,
    min = 0,
    name,
    ...props
}: CurrencyFieldProps) {
    const numericValue = Number(value) || 0;

    const [display, setDisplay] = useState(formatWithCommas(numericValue.toFixed(2)));
    const [prevValue, setPrevValue] = useState(numericValue);

    if (numericValue !== prevValue) {
        setPrevValue(numericValue);
        setDisplay(formatWithCommas(numericValue.toFixed(2)));
    }

    function handleChange(raw: string) {
        const stripped = raw.replace(/,/g, '');

        if (!/^\d*\.?\d{0,2}$/.test(stripped)) {
            return;
        }

        setDisplay(formatWithCommas(stripped));
    }

    function handleBlur() {
        const num = parseNumber(display);
        const safe = Number.isNaN(num) || num < min ? min : num;
        const formatted = Number(safe.toFixed(2));

        onChange(formatted);
        setPrevValue(formatted);
        setDisplay(formatWithCommas(formatted.toFixed(2)));
    }

    return (
        <InputGroup>
            <InputGroupInput
                type="text"
                inputMode="decimal"
                name={name}
                value={display}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                {...props}
            />
            <InputGroupAddon>
                <IconCurrencyPeso />
            </InputGroupAddon>
        </InputGroup>
    );
}
