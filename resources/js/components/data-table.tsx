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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/use-permission';
import type { PaginatedData } from '@/types/paginated';

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

function DraggableRow<T>({
    row,
    getId,
}: {
    row: Row<typeof features, T>;
    getId: (row: T) => UniqueIdentifier;
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: getId(row.original),
    });

    return (
        <TableRow
            data-state={row.getIsSelected() && 'selected'}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    <FlexRender cell={cell} />
                </TableCell>
            ))}
        </TableRow>
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
    permissionKey?: string;
}

export function DataTable<T extends RowData>({
    data: PaginatedData,
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
    permissionKey = '',
}: DataTableProps<T>) {
    const data = PaginatedData.data;
    const metaPagination = PaginatedData.meta;
    const dataPagination = PaginatedData.pagination;
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
    const { can } = usePermissions();

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

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            
            setData((current) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                const reordered = arrayMoveGeneric(current, oldIndex, newIndex);
                onReorder?.(reordered);

                return reordered;
            });
        }
    }
    const tableBody = (
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 w-full">
                        <div className="flex h-full w-full items-center justify-center">
                            <Spinner className="size-8 text-primary" />
                        </div>
                    </TableCell>
                </TableRow>
            ) : table.getRowModel().rows?.length ? (
                enableDragAndDrop && getId ? (
                    <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {table.getRowModel().rows.map((row) => (
                            <DraggableRow
                                key={row.id}
                                row={row}
                                getId={getId}
                            />
                        ))}
                    </SortableContext>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    style={{ width: cell.column.getSize() }}
                                >
                                    <FlexRender cell={cell} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                )
            ) : (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 w-full text-center"
                    >
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                                <IconDatabase />
                                {emptyMessage}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
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
                                {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
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
            {/* <ButtonGroup className="w-1/2">
                <Input
                    type="search"
                    id="input-button-group"
                    placeholder="Type to search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={() => onSearch?.(search)} variant="outline">
                    Search
                </Button>
            </ButtonGroup> */}

            {can(permissionKey) && (
                <Button onClick={onAdd} variant={'outline'}>
                    <IconPlus data-icon="inline-start" />
                    {buttonText}
                </Button>
            )}
        </div>
    );

    return (
        <div className="space-y-2">
            {tableControls}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <FlexRender header={header} />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {enableDragAndDrop && getId ? (
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                            id={sortableId}
                        >
                            {tableBody}
                        </DndContext>
                    ) : (
                        tableBody
                    )}
                </Table>
            </div>
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
