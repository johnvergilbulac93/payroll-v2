import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconDatabase,
    IconGripVertical,
    IconPlus,
    IconSearch,
    IconX,
} from '@tabler/icons-react';
import {
    columnSizingFeature,
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createSortedRowModel,
    FlexRender,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    ColumnFiltersState,
    ColumnVisibilityState,
    Row,
    RowData,
    SortingState,
} from '@tanstack/react-table';
import { useState, useId, useMemo, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '@/hooks/use-debounce';
import type { PaginatedData } from '@/types/paginated';
import { cn } from '@/lib/utils';

const features = tableFeatures({
    columnFilteringFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
});

export function DragHandle({ id }: { id: UniqueIdentifier }) {
    const { attributes, listeners } = useSortable({ id });

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:bg-transparent"
        >
            <IconGripVertical className="size-3 text-muted-foreground" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    );
}

function RowCard<T>({
    row,
    getId,
    draggable,
    gridTemplateColumns,
}: {
    row: Row<typeof features, T>;
    getId?: (row: T) => UniqueIdentifier;
    draggable: boolean;
    gridTemplateColumns: string;
}) {
    const sortable = useSortable({
        id: getId ? getId(row.original) : row.id,
        disabled: !draggable,
    });

    const style = draggable
        ? {
              gridTemplateColumns,
              transform: CSS.Transform.toString(sortable.transform),
              transition: sortable.transition,
          }
        : { gridTemplateColumns };

    return (
        <div
            ref={draggable ? sortable.setNodeRef : undefined}
            data-state={row.getIsSelected() && 'selected'}
            data-dragging={draggable && sortable.isDragging}
            style={style}
            className={cn(
                'relative z-0 grid items-center gap-4 rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors',
                'hover:bg-muted/40 data-[state=selected]:bg-muted/60',
                'data-[dragging=true]:z-10 data-[dragging=true]:opacity-90 data-[dragging=true]:shadow-md',
            )}
        >
            {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="min-w-0 text-sm">
                    <FlexRender cell={cell} />
                </div>
            ))}
        </div>
    );
}

function useInertiaLoading() {
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setIsNavigating(true));
        const removeFinish = router.on('finish', () => setIsNavigating(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return isNavigating;
}

export interface DataTableProps<T> {
    data: PaginatedData<T>;
    columns: ColumnDef<typeof features, T>[];
    getId?: (row: T) => UniqueIdentifier;
    enableDragAndDrop?: boolean;
    onReorder?: (data: T[]) => void;
    enableRowSelection?: boolean;
    onRowSelectionChange?: (selectedIds: string[]) => void;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    emptyMessage?: string;
    buttonText?: string;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    loading?: boolean;
}

export function DataTable<T extends RowData>({
    data: paginatedData,
    columns,
    getId,
    enableDragAndDrop = false,
    onReorder,
    enableRowSelection = false,
    onRowSelectionChange,
    buttonText = 'New',
    onSearch,
    onAdd,
    onPerPage,
    emptyMessage = 'No result found.',
    loading = false,
}: DataTableProps<T>) {
    const data = paginatedData.data;
    const metaPagination = paginatedData.meta;
    const dataPagination = paginatedData.pagination;
    const [pageSize, setPageSize] = useState(Number(dataPagination.limit));
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const onSearchRef = useRef(onSearch);
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    const isNavigating = useInertiaLoading();
    const isLoading = loading || isNavigating;

    const sortableId = useId();
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    );

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        onSearchRef.current?.(debouncedSearch);
    }, [debouncedSearch]);

    const dataIds = useMemo<UniqueIdentifier[]>(
        () => (getId ? data.map(getId) : []),
        [data, getId],
    );

    const table = useTable({
        features,
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        getRowId: getId ? (row) => String(getId(row)) : undefined,
        enableRowSelection,
        onRowSelectionChange: (updater) => {
            const next =
                typeof updater === 'function' ? updater(rowSelection) : updater;

            setRowSelection(next);

            const selectedIds = Object.entries(next)
                .filter(([, selected]) => selected)
                .map(([id]) => id);

            onRowSelectionChange?.(selectedIds);
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
    });

    // grid widths derived from each column's declared size, so header labels
    // and card rows always line up
    const gridTemplateColumns = useMemo(() => {
        const headers = table.getHeaderGroups()[0]?.headers ?? [];
        
        return headers.map((h) => `${h.getSize()}fr`).join(' ');
    }, [table, columns, columnVisibility]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            const oldIndex = dataIds.indexOf(active.id);
            const newIndex = dataIds.indexOf(over.id);
            const reordered = arrayMoveGeneric(data, oldIndex, newIndex);
            onReorder?.(reordered);
        }
    }

    const rows = table.getRowModel().rows;

    const rowList = isLoading ? (
        <div className="flex h-24 w-full items-center justify-center rounded-xl border bg-card">
            <Spinner className="size-8 text-primary" />
        </div>
    ) : rows?.length ? (
        enableDragAndDrop && getId ? (
            <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2">
                    {rows.map((row) => (
                        <RowCard
                            key={row.id}
                            row={row}
                            getId={getId}
                            draggable
                            gridTemplateColumns={gridTemplateColumns}
                        />
                    ))}
                </div>
            </SortableContext>
        ) : (
            <div className="flex flex-col gap-2">
                {rows.map((row) => (
                    <RowCard
                        key={row.id}
                        row={row}
                        draggable={false}
                        gridTemplateColumns={gridTemplateColumns}
                    />
                ))}
            </div>
        )
    ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-xl border bg-card">
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <IconDatabase />
                {emptyMessage}
            </div>
        </div>
    );

    const pagination = (
        <div className="flex items-center justify-between">
            <span className="text-sm">{dataPagination.name}</span>
            <div className="flex gap-1">
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label
                            htmlFor="rows-per-page"
                            className="text-sm font-medium"
                        >
                            Rows per page
                        </Label>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                const newPageSize = Number(value);
                                setPageSize(newPageSize);
                                onPerPage?.(newPageSize);
                            }}
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-20"
                                id="rows-per-page"
                            >
                                <SelectValue
                                    placeholder={
                                        table.state.pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {metaPagination.links.map((link, index) => {
                    const isPrevious = index === 0;
                    const isNext = index === metaPagination.links.length - 1;

                    return (
                        <Button
                            key={`${link.page}-${index}`}
                            variant={link.active ? 'default' : 'outline'}
                            size="icon-sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                        >
                            {isPrevious ? (
                                <IconChevronLeft />
                            ) : isNext ? (
                                <IconChevronRight />
                            ) : (
                                link.label
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );

    const tableControls = (
        <div className="flex items-center justify-between">
            <div className="relative w-1/2">
                <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    id="input-button-group"
                    placeholder="Type to search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-9 pl-9"
                />
                {search && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearch('')}
                        className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                        <IconX className="size-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>

            <Button onClick={onAdd} variant={'outline'}>
                <IconPlus data-icon="inline-start" />
                {buttonText}
            </Button>
        </div>
    );

    return (
        <div className="space-y-3">
            {tableControls}

            <div
                className="grid gap-4 px-4 text-xs font-medium text-muted-foreground"
                style={{ gridTemplateColumns }}
            >
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                    <div key={header.id}>
                        {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                        )}
                    </div>
                ))}
            </div>

            {enableDragAndDrop && getId ? (
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    id={sortableId}
                >
                    {rowList}
                </DndContext>
            ) : (
                rowList
            )}

            {pagination}
        </div>
    );
}

function arrayMoveGeneric<T>(array: T[], from: number, to: number): T[] {
    const copy = array.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);

    return copy;
}
