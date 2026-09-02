import { IconChevronRight, IconOctagon } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Permission } from '@/types/permission';

type ToggleAction = {
    ids: number[];
    action: 'check' | 'uncheck';
};

type TreeNodeProps = {
    node: Permission;
    selected: number[];
    searchActive?: boolean;
    onToggle: (payload: ToggleAction) => void;
};

const getAllDescendantIds = (node: Permission): number[] => {
    if (!node.children?.length) {
        return [Number(node.id)];
    }

    return [
        Number(node.id),
        ...node.children.flatMap((child) => getAllDescendantIds(child)),
    ];
};

export default function TreeNode({
    node,
    selected,
    searchActive,
    onToggle,
}: TreeNodeProps) {
    const [open, setOpen] = useState(!!searchActive);

    const isChecked = useMemo(() => {
        const allIds = getAllDescendantIds(node).filter(
            (id) => id !== Number(node.id),
        );

        if (!allIds.length) {
            return selected.includes(Number(node.id));
        }

        return allIds.every((id) => selected.includes(id));
    }, [node, selected]);

    const isIndeterminate = useMemo(() => {
        const allIds = getAllDescendantIds(node).filter(
            (id) => id !== Number(node.id),
        );

        if (!allIds.length) {
            return false;
        }

        const someSelected = allIds.some((id) => selected.includes(id));
        const allSelected = allIds.every((id) => selected.includes(id));

        return someSelected && !allSelected;
    }, [node, selected]);

    const handleToggle = () => {
        const allIds = getAllDescendantIds(node);
        const allSelected = allIds.every((id) => selected.includes(id));
        onToggle({ ids: allIds, action: allSelected ? 'uncheck' : 'check' });
    };

    return (
        <Collapsible
            className="h-auto w-full space-y-1"
            open={open}
            onOpenChange={setOpen}
        >
            <div className="group flex items-center justify-between  px-2">
                <CollapsibleTrigger asChild className="w-full cursor-pointer">
                    <div className="flex items-center">
                        {!!node.children?.length && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                            >
                                <IconChevronRight
                                    className={`transition-transform ${open ? 'rotate-90' : ''}`}
                                />
                            </Button>
                        )}
                        {node.type === 'module' && (
                            <IconOctagon
                                className={`h-3 ${!node.children?.length ? 'ml-8' : ''}`}
                            />
                        )}
                        {node.type === 'group' && (
                            <IconOctagon className="h-3" />
                        )}
                        {node.type === 'action' && (
                            <IconOctagon className="ml-6 h-2" />
                        )}

                        {node.type === 'module' && (
                            <h4 className="p-1.5 text-sm">{node.name}</h4>
                        )}
                        {node.type === 'group' && (
                            <h4 className="ml-1 text-sm">{node.name}</h4>
                        )}
                        {node.type === 'action' && (
                            <h4 className="p-1 text-sm">{node.name}</h4>
                        )}
                    </div>
                </CollapsibleTrigger>
                <Checkbox
                    className="flex h-5 w-5 cursor-pointer items-center justify-center border-2 p-0 "
                    checked={isIndeterminate ? 'indeterminate' : isChecked}
                    onClick={handleToggle}
                />
            </div>

            <CollapsibleContent className="flex flex-col">
                {!!node.children?.length && (
                    <div className="ml-6 space-y-0.5 border-l pl-2">
                        {node.children.map((child) => (
                            <TreeNode
                                key={`${child.id}-${searchActive}`}
                                node={child}
                                selected={selected}
                                searchActive={searchActive}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
