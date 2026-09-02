import { Head, useForm } from '@inertiajs/react';
import { IconHelp, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import { CurrencyField } from '@/components/number-field';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { LoanTable } from '@/pages/loan/loan-table';
import { index, store, update, destroy as remove } from '@/routes/loan';
import { store as storeLoanType } from '@/routes/loan_type';
import type { Loan } from '@/types/loan';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import SearchableSelect from '@/components/searchable-select';
type Props = {
    loans: PaginatedData<Loan>;
    employees: Option[];
    loanTypes: Option[];
};

export default function Loan({ loans, employees, loanTypes }: Props) {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');

    const [visible, setVisible] = useState(false);
    const [visibleLoanType, setVisibleLoanType] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const [isAdd, setIsAdd] = useState(false);

    const {
        data: loanType,
        setData: setLoanType,
        processing: loanTypeProcessing,
        post: postLoanType,
        reset: resetLoanType,
        errors: errorsLoanType,
        clearErrors: clearErrorsLoanType,
    } = useForm({
        name: '',
    });

    const {
        data,
        setData,
        processing,
        post,
        put,
        delete: destroy,
        errors,
        resetAndClearErrors,
    } = useForm({
        id: '',
        EmpNbr: '',
        EmployeeName: '',
        LoanTypeID: '',
        OrigBal: 0,
        DedAmt: 0,
        StartDate: '',
        Frequency: '',
        BalanceAmt: 0,
        BalanceasofDate: 0,
    });
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const { updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('New loan');
        setDialogDescription('Manage employee loans');
        setVisible(true);
    };
    const onEdit = (loan: Loan) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Update loan');
        setDialogDescription('Manage the selected employee loan');
        setData({
            id: String(loan.id), 
            EmpNbr: loan.EmpNbr,
            LoanTypeID: loan.LoanTypeID,
            OrigBal: loan.OrigBal ?? 0,
            DedAmt: loan.DedAmt ?? 0,
            StartDate: loan.StartDate,
            Frequency: loan.Frequency ?? '',
            BalanceAmt: loan.BalanceAmt ?? 0,
            BalanceasofDate: loan.BalanceasofDate ?? 0,
        });

        setVisible(true);
    };
    const onConfirm = (value: number) => {
        setPendingDeleteId(value);
        setConfirmOpen(true);
    };
    const onDelete = (id: number) => {
        destroy(remove.url(id), {
            preserveScroll: true,
        });
    };
    const onCreate = () => {
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Successfully saved');
                setVisible(false);
            },
        });
    };
    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            preserveScroll: true,
            onSuccess: () => {
                resetAndClearErrors();
                toast.success('Changes saved successfully');
                setVisible(false);
            },
        });
    };

    const onAddLoanType = () => {
        resetLoanType();
        clearErrorsLoanType();
        setVisibleLoanType(true);
    };

    const onCreateLoanType = () => {
        postLoanType(storeLoanType.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Successfully saved.');
                setVisibleLoanType(false);
            },
        });
    };

    return (
        <div className="p-4">
            <Head title="Loans" />
            <Heading
                title="Loans"
                description="View, add, edit, and manage loan records."
            />
            <LoanTable
                data={loans}
                // onSelectionChange={setSelectedUserIds}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(loan) => onEdit(loan)}
                onDelete={(value) => onConfirm(value)}
            />
            <FormDialog
                key={isAdd ? 'add' : `edit-${data.id}`}
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onCreate : onUpdate}
                onCancel={() => setVisible(false)}
                size="4xl"
            >
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.EmpNbr} className="gap-2">
                        <FieldLabel htmlFor="loan.EmpNbr">Employee</FieldLabel>
                        <SearchableSelect
                            id="loan.EmpNbr"
                            items={employees}
                            value={data.EmpNbr}
                            onValueChange={(value) =>
                                setData('EmpNbr', value ?? '')
                            }
                            invalid={!!errors.EmpNbr}
                            tabIndex={1}
                        />
                        {errors.EmpNbr && (
                            <FieldError>{errors.EmpNbr}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.LoanTypeID} className="gap-2">
                        <FieldLabel htmlFor="loan.LoanTypeID">
                            Loan type
                        </FieldLabel>
                        <div className="flex items-center gap-2">
                            <Select
                                value={data.LoanTypeID}
                                onValueChange={(value) =>
                                    setData('LoanTypeID', value)
                                }
                            >
                                <SelectTrigger
                                    id="loan.LoanTypeID"
                                    className="w-full"
                                    tabIndex={2}
                                    aria-invalid={!!errors.LoanTypeID}
                                >
                                    <SelectValue placeholder="Select loan type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Loan type</SelectLabel>
                                        {loanTypes.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="text-primary hover:text-primary/80"
                                        onClick={onAddLoanType}
                                    >
                                        <IconHelp />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add new loan type
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        {errors.LoanTypeID && (
                            <FieldError>{errors.LoanTypeID}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.OrigBal} className="gap-2">
                        <FieldLabel htmlFor="loan.OrigBal">
                            Original Balance
                        </FieldLabel>
                        <CurrencyField
                            id="loan.OrigBal"
                            value={data.OrigBal}
                            onChange={(v) => setData('OrigBal', v)}
                            aria-invalid={!!errors.OrigBal}
                            name="OrigBal"
                            tabIndex={3}
                        />

                        {errors.OrigBal && (
                            <FieldError>{errors.OrigBal}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.DedAmt} className="gap-2">
                        <FieldLabel htmlFor="loan.DedAmt">
                            Deduction amount
                        </FieldLabel>
                        <CurrencyField
                            id="loan.DedAmt"
                            value={data.DedAmt}
                            onChange={(v) => setData('DedAmt', v)}
                            aria-invalid={!!errors.DedAmt}
                            name="DedAmt"
                            tabIndex={4}
                        />
                        {errors.DedAmt && (
                            <FieldError>{errors.DedAmt}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.BalanceAmt} className="gap-2">
                        <FieldLabel htmlFor="loan.BalanceAmt">
                            Balance amount
                        </FieldLabel>
                        <CurrencyField
                            id="loan.BalanceAmt"
                            value={data.BalanceAmt}
                            onChange={(v) => setData('BalanceAmt', v)}
                            aria-invalid={!!errors.BalanceAmt}
                            name="BalanceAmt"
                            tabIndex={5}
                        />
                        {errors.BalanceAmt && (
                            <FieldError>{errors.BalanceAmt}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.Frequency} className="gap-2">
                        <FieldLabel htmlFor="loan.Frequency">
                            Frequency
                        </FieldLabel>
                        <Input
                            value={data.Frequency}
                            onChange={(e) =>
                                setData('Frequency', e.target.value)
                            }
                            type="text"
                            id="employee.Frequency"
                            placeholder="Frequency"
                            aria-invalid={!!errors.Frequency}
                            tabIndex={6}
                        />
                        {errors.Frequency && (
                            <FieldError>{errors.Frequency}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.StartDate} className="gap-2">
                        <FieldLabel htmlFor="loan.StartDate">
                            Deduction start date
                        </FieldLabel>
                        <DatePicker
                            id="loan.StartDate"
                            name="StartDate"
                            value={data.StartDate}
                            onChange={(value) => setData('StartDate', value)}
                            error={errors.StartDate}
                            // toDate={new Date()}
                            tabIndex={7}
                        />
                        {errors.StartDate && (
                            <FieldError>{errors.StartDate}</FieldError>
                        )}
                    </Field>
                    <Field
                        data-invalid={!!errors.BalanceasofDate}
                        className="gap-2"
                    >
                        <FieldLabel htmlFor="loan.BalanceasofDate">
                            Balance as of date
                        </FieldLabel>
                        <CurrencyField
                            id="loan.BalanceasofDate"
                            value={data.BalanceasofDate}
                            onChange={(v) => setData('BalanceasofDate', v)}
                            aria-invalid={!!errors.BalanceasofDate}
                            name="BalanceasofDate"
                            tabIndex={8}
                        />
                        {errors.BalanceasofDate && (
                            <FieldError>{errors.BalanceasofDate}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>

            <FormDialog
                open={visibleLoanType}
                onOpenChange={setVisibleLoanType}
                title="Add Loan type"
                description="Create a new loan type"
                addText="Submit"
                loading={loanTypeProcessing}
                onAdd={onCreateLoanType}
                onCancel={() => setVisibleLoanType(false)}
            >
                <FieldGroup>
                    <Field
                        data-invalid={!!errorsLoanType.name}
                        className="gap-2"
                    >
                        <FieldLabel htmlFor="loanType.name">
                            Loan type
                        </FieldLabel>
                        <Input
                            value={loanType.name}
                            name="loanType.name"
                            onChange={(e) =>
                                setLoanType('name', e.target.value)
                            }
                            type="text"
                            id="loanType.name"
                            placeholder="Description"
                            aria-invalid={!!errorsLoanType.name}
                            tabIndex={1}
                        />
                        {errorsLoanType.name && (
                            <FieldError>{errorsLoanType.name}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>

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
Loan.layout = {
    breadcrumbs: [
        {
            title: 'Loan',
            href: index(),
        },
    ],
};
