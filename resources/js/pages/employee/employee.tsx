import { Head, router } from '@inertiajs/react';

import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/heading';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { EmployeeTable } from '@/pages/employee/employee-table';
import { index, create, show, destroy } from '@/routes/employee';
import type { Employee } from '@/types/employee';
import type { PaginatedData } from '@/types/paginated';

type FilterOption = { value: number | string; label: string };
type Props = {
    employees: PaginatedData<Employee>;
    groups: FilterOption[];
    positions: FilterOption[];
    filters: { search?: string; group?: string; position?: string; employment_status?: string; tenure_status?: string; limit?: string | number };
};
export default function EmployeeList({ employees, groups, positions, filters: appliedFilters }: Props) {
    const { trigger: triggerUndoable } = useUndoableAction<number>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(appliedFilters.group || 'all');
    const [selectedPosition, setSelectedPosition] = useState(appliedFilters.position || 'all');
    const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState(appliedFilters.employment_status || 'all');
    const [selectedTenureStatus, setSelectedTenureStatus] = useState(appliedFilters.tenure_status || 'all');

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10, group: '', position: '', employment_status: '', tenure_status: '' },
    });

    const onConfirm = (value: number) => {
        setPendingDeleteId(value);
        setConfirmOpen(true);
    };
    const onDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => {
                toast.success('Successfully deleted.');
            },
        });
    };

    return (
        <div className="p-4">
            <Head title="Employee" />
            <Heading
                title="Employee List"
                description="View, add, edit, and manage employee records."
            />
            <EmployeeTable
                data={employees}
                // onSelectionChange={setSelectedUserIds}
                initialSearch={filters.search}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={() => router.visit(create.url())}
                onFilter={() => {
                    setSelectedGroup(filters.group || 'all');
                    setSelectedPosition(filters.position || 'all');
                    setSelectedEmploymentStatus(filters.employment_status || 'all');
                    setSelectedTenureStatus(filters.tenure_status || 'all');
                    setFilterOpen(true);
                }}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(employee) => router.visit(show(employee.id))}
                onDelete={(value) => onConfirm(value)}
            />
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Filter Employees</DialogTitle>
                        <DialogDescription>Choose a group and position to narrow the employee list.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-3">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Group</label>
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="All groups" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All groups</SelectItem>
                                    {groups.map((group) => <SelectItem key={group.value} value={String(group.value)}>{group.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Position</label>
                            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="All positions" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All positions</SelectItem>
                                    {positions.map((position) => <SelectItem key={position.value} value={String(position.value)}>{position.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Employment Status</label>
                            <Select value={selectedEmploymentStatus} onValueChange={setSelectedEmploymentStatus}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="All employment statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All employment statuses</SelectItem>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="contractual">Contractual</SelectItem>
                                    <SelectItem value="probationary">Probationary</SelectItem>
                                    <SelectItem value="consultant">Consultant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tenure Status</label>
                            <Select value={selectedTenureStatus} onValueChange={setSelectedTenureStatus}>
                                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="All tenure statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All tenure statuses</SelectItem>
                                    <SelectItem value="tenured">Tenured</SelectItem>
                                    <SelectItem value="non_tenured">Non-tenured</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setSelectedGroup('all');
                            setSelectedPosition('all');
                            setSelectedEmploymentStatus('all');
                            setSelectedTenureStatus('all');
                            updateFilters({ group: '', position: '', employment_status: '', tenure_status: '', page: 1 });
                            setFilterOpen(false);
                        }}>Clear filters</Button>
                        <Button onClick={() => {
                            updateFilters({
                                group: selectedGroup === 'all' ? '' : selectedGroup,
                                position: selectedPosition === 'all' ? '' : selectedPosition,
                                employment_status: selectedEmploymentStatus === 'all' ? '' : selectedEmploymentStatus,
                                tenure_status: selectedTenureStatus === 'all' ? '' : selectedTenureStatus,
                                page: 1,
                            });
                            setFilterOpen(false);
                        }}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete employee?"
                description="This will permanently delete this employee record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Employee record will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

EmployeeList.layout = {
    breadcrumbs: [
        {
            title: 'Employee',
            href: index(),
        },
    ],
};
