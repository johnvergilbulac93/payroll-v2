import { useCallback, useState } from 'react';
import type { Permission } from '@/types/permission';
import TreeNode from './tree-node';

type ToggleAction = {
    ids: number[];
    action: 'check' | 'uncheck';
};

type PermissionTreeProps = {
    data: Permission[];
    value: number[];
    onChange: (value: number[]) => void;
    searchActive?: boolean;
};

const flattenChecked = (nodes: Permission[]): number[] =>
    nodes.flatMap((n) => [
        ...(n.checked ? [n.id] : []),
        ...flattenChecked(n.children ?? []),
    ]);

export default function PermissionTree({ data, onChange, searchActive }: PermissionTreeProps) {
    const [selected, setSelected] = useState<number[]>(() => flattenChecked(data));
    const [prevData, setPrevData] = useState(data);

    if (data !== prevData) {
        setPrevData(data);
        setSelected(flattenChecked(data));
    }

    const toggle = useCallback(
        ({ ids, action }: ToggleAction) => {
            const next =
                action === 'check'
                    ? [...new Set([...selected, ...ids])]
                    : selected.filter((id) => !ids.includes(id));

            setSelected(next);
            onChange(next);
        },
        [selected, onChange],
    );

    return (
        <>
            {data.map((item) => (
                <TreeNode
                    key={`${item.id}-${searchActive}`}
                    node={item}
                    selected={selected}
                    searchActive={searchActive}
                    onToggle={toggle}
                />
            ))}
        </>
    );
}