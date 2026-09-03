import { Head, router } from '@inertiajs/react';

import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/alert-dialog';
import Heading from '@/components/heading';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { EmployeeTable } from '@/pages/employee/employee-table';
import { index, create, show, destroy, scheduleIndex } from '@/routes/employee';
import type { Employee } from '@/types/employee';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    employees: PaginatedData<Employee>;
};
export default function EmployeeList({ employees }: Props) {
    const { trigger: triggerUndoable } = useUndoableAction<number>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const { updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
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
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={() => router.visit(create.url())}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(employee) => router.visit(show(employee.id))}
                onDelete={(value) => onConfirm(value)}
                onSetupSchedule={(value) =>
                    router.visit(scheduleIndex.url(Number(value)))
                }
            />
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete loan?"
                description="This will permanently delete this loan record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Loan record will be deleted',
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
