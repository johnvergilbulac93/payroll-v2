import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { IconHelp } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { ReusableDrawer } from '@/components/drawer';
import { ImageUpload } from '@/components/image-upload';
import { CurrencyField } from '@/components/number-field';
import { Button } from '@/components/ui/button';

import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldError,
    FieldSet,
    FieldLegend,
    FieldDescription,
    FieldContent,
    FieldTitle,
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
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { index as employeeIndex, store, update } from '@/routes/employee';
import { store as groupStore } from '@/routes/group';
import type { Employee } from '@/types/employee';
import type { Option } from '@/types/option';

type Props = {
    employee?: Employee | null;
    groups: Option[];
};

export default function EmployeeForm({ employee, groups }: Props) {
    const isEditMode = !!employee && Object.keys(employee).length > 0;
    const [open, setOpen] = useState(false);
    const {
        data: group,
        setData: setGroup,
        processing: groupProcessing,
        post: postGroup,
        reset,
        clearErrors,
        errors: groupErrors,
    } = useForm({
        name: '',
    });
    const { data, setData, processing, post, errors } = useForm({
        id: employee?.id ?? '',
        Image: null as File | null,
        remove_image: false,
        FullName: employee?.FullName ?? '',
        EmpNbr: employee?.EmpNbr ?? '',
        FirstName: employee?.FirstName ?? '',
        Group: employee?.Group ?? '',
        MidName: employee?.MidName ?? '',
        LastName: employee?.LastName ?? '',
        Suffix: employee?.Suffix ?? '',
        Address: employee?.Address ?? '',
        CityProv: employee?.CityProv ?? '',
        BirthDate: employee?.BirthDate ?? '',
        EmployDate: employee?.EmployDate ?? '',
        RegularDate: employee?.RegularDate ?? '',
        Position: employee?.Position ?? '',
        Assignment: employee?.Assignment ?? '',
        SalaryGrade: employee?.SalaryGrade ?? '',
        BasicPay: employee?.BasicPay ?? 0,
        DailyRate: employee?.DailyRate ?? 0,
        HourlyRate: employee?.HourlyRate ?? 0,
        Status: employee?.Status ?? true,
        SSSNbr: employee?.SSSNbr ?? '',
        PHICNbr: employee?.PHICNbr ?? '',
        HDMFNbr: employee?.HDMFNbr ?? '',
        TIN: employee?.TIN ?? '',
        Degree: employee?.Degree ?? '',
        AllowReg: employee?.AllowReg ?? 0,
        ResignDate: employee?.ResignDate ?? '',
        BPIATM: employee?.BPIATM ?? '',
        BPIEmpCode: employee?.BPIEmpCode ?? '',
        PIN: employee?.PIN ?? '',
        PERAAID: employee?.PERAAID ?? '',
        ImageUrl: employee?.ImageUrl ?? '',
        BiometricID: employee?.BiometricID ?? '',
    });

    const onSubmit = () => {
        post(store.url(), {
            onSuccess: () => {
                toast.success('Successfully saved.');
            },
        });
    };
    const onUpdate = () => {
        post(update.url(Number(data.id)), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Changes saved successfully');
            },
        });
    };
    const onAddGroup = () => {
        reset();
        clearErrors();
        setOpen(true);
    };
    const handleConfirm = () => {
        postGroup(groupStore.url(), {
            onSuccess: () => {
                toast.success('Successfully saved.');
                setOpen(false);
            },
        });
    };

    return (
        <div className="space-y-4 p-4">
            <Head title={isEditMode ? 'Edit Employee' : 'Add Employee'} />
            <FieldGroup className="flex justify-center">
                <Field
                    data-invalid={!!errors.Image}
                    className="items-center gap-2"
                >
                    <ImageUpload
                        id="employee.Image"
                        name="Image"
                        value={
                            data.remove_image
                                ? null
                                : (data.Image ?? employee?.ImageUrl ?? null)
                        }
                        aria-invalid={!!errors.Image}
                        className="justify-center"
                        onChange={(file) => {
                            setData('Image', file);
                            setData('remove_image', false);
                        }}
                        onRemove={() => {
                            setData('Image', null);
                            setData('remove_image', true);
                        }}
                    />
                    {errors.Image && (
                        <FieldError className="text-center">
                            {errors.Image}
                        </FieldError>
                    )}
                </Field>
            </FieldGroup>

            <FieldSet className="rounded border px-4 pb-4">
                <FieldLegend>Employee Information</FieldLegend>
                <FieldDescription>
                    Enter employee information and details here
                </FieldDescription>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.LastName} className="gap-2">
                        <FieldLabel htmlFor="employee.LastName">
                            Last name
                        </FieldLabel>
                        <Input
                            value={data.LastName}
                            onChange={(e) =>
                                setData('LastName', e.target.value)
                            }
                            type="text"
                            id="employee.LastName"
                            placeholder="Last name"
                            aria-invalid={!!errors.LastName}
                            tabIndex={1}
                        />
                        {errors.LastName && (
                            <FieldError>{errors.LastName}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.MidName} className="gap-2">
                        <FieldLabel htmlFor="employee.MidName">
                            Middle name
                        </FieldLabel>
                        <Input
                            value={data.MidName}
                            onChange={(e) => setData('MidName', e.target.value)}
                            type="text"
                            id="employee.MidName"
                            placeholder="Middle name"
                            aria-invalid={!!errors.MidName}
                            tabIndex={2}
                        />
                        {errors.MidName && (
                            <FieldError>{errors.MidName}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.FirstName} className="gap-2">
                        <FieldLabel htmlFor="employee.FirstName">
                            First name
                        </FieldLabel>
                        <Input
                            value={data.FirstName}
                            onChange={(e) =>
                                setData('FirstName', e.target.value)
                            }
                            type="text"
                            id="employee.FirstName"
                            placeholder="First name"
                            aria-invalid={!!errors.FirstName}
                            tabIndex={3}
                        />
                        {errors.FirstName && (
                            <FieldError>{errors.FirstName}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.Suffix} className="gap-2">
                        <FieldLabel htmlFor="employee.Suffix">
                            Suffix
                        </FieldLabel>

                        <Input
                            value={data.Suffix}
                            onChange={(e) => setData('Suffix', e.target.value)}
                            type="text"
                            id="employee.Suffix"
                            placeholder="Jr.,Sr.,I,II,etc"
                            aria-invalid={!!errors.Suffix}
                            tabIndex={4}
                        />
                        {errors.Suffix && (
                            <FieldError>{errors.Suffix}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.Group} className="gap-2">
                        <FieldLabel htmlFor="employee.Group">Group</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Select
                                value={data.Group}
                                onValueChange={(value) =>
                                    setData('Group', value)
                                }
                            >
                                <SelectTrigger
                                    id="employee.Group"
                                    className="w-full"
                                    tabIndex={5}
                                    aria-invalid={!!errors.Group}
                                >
                                    <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Groups</SelectLabel>
                                        {groups.map((group) => (
                                            <SelectItem
                                                key={group.value}
                                                value={group.value}
                                            >
                                                {group.label}
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
                                        className="text-primary hover:text-chart-5"
                                        onClick={onAddGroup}
                                    >
                                        <IconHelp />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add new group</TooltipContent>
                            </Tooltip>
                        </div>

                        {errors.Group && (
                            <FieldError>{errors.Group}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.Address} className="gap-2">
                        <FieldLabel htmlFor="employee.Address">
                            Address
                        </FieldLabel>
                        <Input
                            value={data.Address}
                            onChange={(e) => setData('Address', e.target.value)}
                            type="text"
                            id="employee.Address"
                            placeholder="Address"
                            aria-invalid={!!errors.Address}
                            tabIndex={6}
                        />
                        {errors.Address && (
                            <FieldError>{errors.Address}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.CityProv} className="gap-2">
                        <FieldLabel htmlFor="employee.CityProv">
                            City/Province
                        </FieldLabel>
                        <Input
                            value={data.CityProv}
                            onChange={(e) =>
                                setData('CityProv', e.target.value)
                            }
                            type="text"
                            id="employee.CityProv"
                            placeholder="City/Province"
                            aria-invalid={!!errors.CityProv}
                            tabIndex={7}
                        />
                        {errors.CityProv && (
                            <FieldError>{errors.CityProv}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.BirthDate} className="gap-2">
                        <FieldLabel htmlFor="employee.BirthDate">
                            Birth date
                        </FieldLabel>
                        <DatePicker
                            id="BirthDate"
                            name="BirthDate"
                            value={data.BirthDate}
                            onChange={(value) => setData('BirthDate', value)}
                            error={errors.BirthDate}
                            // toDate={new Date()}
                            tabIndex={8}
                        />
                        {errors.BirthDate && (
                            <FieldError>{errors.BirthDate}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.EmployDate} className="gap-2">
                        <FieldLabel htmlFor="employee.EmployDate">
                            Date of employment
                        </FieldLabel>
                        <DatePicker
                            id="EmployDate"
                            name="EmployDate"
                            value={data.EmployDate}
                            onChange={(value) => setData('EmployDate', value)}
                            error={errors.EmployDate}
                            // toDate={new Date()}
                            tabIndex={9}
                        />
                        {errors.EmployDate && (
                            <FieldError>{errors.EmployDate}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.Position} className="gap-2">
                        <FieldLabel htmlFor="employee.Position">
                            Position
                        </FieldLabel>
                        <Input
                            value={data.Position}
                            onChange={(e) =>
                                setData('Position', e.target.value)
                            }
                            type="text"
                            id="employee.Position"
                            placeholder="Position"
                            aria-invalid={!!errors.Position}
                            tabIndex={10}
                        />
                        {errors.Position && (
                            <FieldError>{errors.Position}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.Assignment} className="gap-2">
                        <FieldLabel htmlFor="employee.Assignment">
                            Area of assignment
                        </FieldLabel>
                        <Input
                            value={data.Assignment}
                            onChange={(e) =>
                                setData('Assignment', e.target.value)
                            }
                            type="text"
                            id="employee.Assignment"
                            placeholder="Area of assignment"
                            aria-invalid={!!errors.Assignment}
                            tabIndex={11}
                        />
                        {errors.Assignment && (
                            <FieldError>{errors.Assignment}</FieldError>
                        )}
                    </Field>
                    <Field
                        data-invalid={!!errors.SalaryGrade}
                        className="gap-2"
                    >
                        <FieldLabel htmlFor="employee.SalaryGrade">
                            Salary grade
                        </FieldLabel>
                        <Input
                            value={data.SalaryGrade}
                            onChange={(e) =>
                                setData('SalaryGrade', e.target.value)
                            }
                            type="text"
                            id="employee.SalaryGrade"
                            placeholder="Salary grade"
                            aria-invalid={!!errors.SalaryGrade}
                            tabIndex={12}
                        />
                        {errors.SalaryGrade && (
                            <FieldError>{errors.SalaryGrade}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.BasicPay} className="gap-2">
                        <FieldLabel htmlFor="employee.BasicPay">
                            Basic pay
                        </FieldLabel>
                        <CurrencyField
                            id="employee.BasicPay"
                            value={data.BasicPay}
                            onChange={(v) => setData('BasicPay', v)}
                            aria-invalid={!!errors.BasicPay}
                            name="BasicPay"
                            tabIndex={13}
                        />
                        {errors.BasicPay && (
                            <FieldError>{errors.BasicPay}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.DailyRate} className="gap-2">
                        <FieldLabel htmlFor="employee.DailyRate">
                            Daily rate
                        </FieldLabel>
                        <CurrencyField
                            id="employee.DailyRate"
                            value={data.DailyRate}
                            onChange={(v) => setData('DailyRate', v)}
                            aria-invalid={!!errors.DailyRate}
                            name="DailyRate"
                            tabIndex={14}
                        />
                        {errors.DailyRate && (
                            <FieldError>{errors.DailyRate}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.HourlyRate} className="gap-2">
                        <FieldLabel htmlFor="employee.HourlyRate">
                            Hourly rate
                        </FieldLabel>
                        <CurrencyField
                            id="employee.HourlyRate"
                            value={data.HourlyRate}
                            onChange={(v) => setData('HourlyRate', v)}
                            aria-invalid={!!errors.HourlyRate}
                            name="HourlyRate"
                            tabIndex={15}
                        />
                        {errors.HourlyRate && (
                            <FieldError>{errors.HourlyRate}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.PHICNbr} className="gap-2">
                        <FieldLabel htmlFor="employee.PHICNbr">
                            PHIC number
                        </FieldLabel>
                        <Input
                            value={data.PHICNbr}
                            onChange={(e) => setData('PHICNbr', e.target.value)}
                            type="text"
                            id="employee.PHICNbr"
                            placeholder="XX-XXXXXXXXX-X"
                            aria-invalid={!!errors.PHICNbr}
                            tabIndex={16}
                        />
                        {errors.PHICNbr && (
                            <FieldError>{errors.PHICNbr}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.HDMFNbr} className="gap-2">
                        <FieldLabel htmlFor="employee.HDMFNbr">
                            HDMF number
                        </FieldLabel>
                        <Input
                            value={data.HDMFNbr}
                            onChange={(e) => setData('HDMFNbr', e.target.value)}
                            type="text"
                            id="employee.HDMFNbr"
                            placeholder="XXXX-XXXX-XXXX"
                            aria-invalid={!!errors.HDMFNbr}
                            tabIndex={17}
                        />
                        {errors.HDMFNbr && (
                            <FieldError>{errors.HDMFNbr}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.TIN} className="gap-2">
                        <FieldLabel htmlFor="employee.TIN">
                            TIN number
                        </FieldLabel>
                        <Input
                            value={data.TIN}
                            onChange={(e) => setData('TIN', e.target.value)}
                            type="text"
                            id="employee.TIN"
                            placeholder="XXX-XXX-XXX"
                            aria-invalid={!!errors.TIN}
                            tabIndex={18}
                        />
                        {errors.TIN && <FieldError>{errors.TIN}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.Degree} className="gap-2">
                        <FieldLabel htmlFor="employee.Degree">
                            Degree / Educational attainment
                        </FieldLabel>
                        <Input
                            value={data.Degree}
                            onChange={(e) => setData('Degree', e.target.value)}
                            type="text"
                            id="employee.Degree"
                            placeholder="Degree / Educational attainment"
                            aria-invalid={!!errors.Degree}
                            tabIndex={19}
                        />
                        {errors.Degree && (
                            <FieldError>{errors.Degree}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.AllowReg} className="gap-2">
                        <FieldLabel htmlFor="employee.AllowReg">
                            Allowances regularly received
                        </FieldLabel>
                        <CurrencyField
                            id="employee.AllowReg"
                            value={data.AllowReg}
                            onChange={(v) => setData('AllowReg', v)}
                            aria-invalid={!!errors.AllowReg}
                            name="AllowReg"
                            tabIndex={20}
                        />
                        {errors.AllowReg && (
                            <FieldError>{errors.AllowReg}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.ResignDate} className="gap-2">
                        <FieldLabel htmlFor="employee.ResignDate">
                            Resignation date
                        </FieldLabel>
                        <DatePicker
                            id="ResignDate"
                            name="ResignDate"
                            value={data.ResignDate}
                            onChange={(value) => setData('ResignDate', value)}
                            error={errors.ResignDate}
                            // toDate={new Date()}
                            tabIndex={21}
                        />
                        {errors.ResignDate && (
                            <FieldError>{errors.ResignDate}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                    <Field data-invalid={!!errors.BPIATM} className="gap-2">
                        <FieldLabel htmlFor="employee.BPIATM">
                            BPI ATM no.
                        </FieldLabel>
                        <Input
                            value={data.BPIATM}
                            onChange={(e) => setData('BPIATM', e.target.value)}
                            type="text"
                            id="employee.BPIATM"
                            placeholder="BPI ATM no."
                            aria-invalid={!!errors.BPIATM}
                            tabIndex={22}
                        />
                        {errors.BPIATM && (
                            <FieldError>{errors.BPIATM}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.BPIEmpCode} className="gap-2">
                        <FieldLabel htmlFor="employee.BPIEmpCode">
                            BPI Employee code
                        </FieldLabel>
                        <Input
                            value={data.BPIEmpCode}
                            onChange={(e) =>
                                setData('BPIEmpCode', e.target.value)
                            }
                            type="text"
                            id="employee.BPIEmpCode"
                            placeholder="BPI Employee code"
                            aria-invalid={!!errors.BPIEmpCode}
                            tabIndex={23}
                        />
                        {errors.BPIEmpCode && (
                            <FieldError>{errors.BPIEmpCode}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.PIN} className="gap-2">
                        <FieldLabel htmlFor="employee.PIN">PIN</FieldLabel>
                        <Input
                            value={data.PIN}
                            onChange={(e) => setData('PIN', e.target.value)}
                            type="text"
                            id="employee.PIN"
                            placeholder="PIN"
                            aria-invalid={!!errors.PIN}
                            tabIndex={24}
                        />
                        {errors.PIN && <FieldError>{errors.PIN}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.PERAAID} className="gap-2">
                        <FieldLabel htmlFor="employee.PERAAID">
                            PERAA ID
                        </FieldLabel>
                        <Input
                            value={data.PERAAID}
                            onChange={(e) => setData('PERAAID', e.target.value)}
                            type="text"
                            id="employee.PERAAID"
                            placeholder="PERAAID"
                            aria-invalid={!!errors.PERAAID}
                            tabIndex={24}
                        />
                        {errors.PERAAID && (
                            <FieldError>{errors.PERAAID}</FieldError>
                        )}
                    </Field>
                    <Field
                        data-invalid={!!errors.BiometricID}
                        className="gap-2"
                    >
                        <FieldLabel htmlFor="employee.BiometricID">
                            Biometric ID
                        </FieldLabel>
                        <Input
                            value={data.BiometricID}
                            onChange={(e) =>
                                setData('BiometricID', e.target.value)
                            }
                            type="text"
                            id="employee.BiometricID"
                            placeholder="Biometric ID"
                            aria-invalid={!!errors.BiometricID}
                            tabIndex={19}
                        />
                        {errors.BiometricID && (
                            <FieldError>{errors.BiometricID}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldLabel htmlFor="switch-status">
                    <Field
                        orientation="horizontal"
                        className="flex items-center"
                    >
                        <FieldContent>
                            <FieldTitle> Status</FieldTitle>
                            <FieldDescription>
                                This indicates whether the employee is still
                                active.
                            </FieldDescription>
                        </FieldContent>
                        <Switch
                            id="switch-status"
                            checked={data.Status}
                            tabIndex={20}
                            onCheckedChange={(checked) =>
                                setData('Status', checked)
                            }
                        />
                    </Field>
                </FieldLabel>
            </FieldSet>
            <ReusableDrawer
                open={open}
                onOpenChange={setOpen}
                title="Add new group"
                description="Manage you new group"
                onSubmit={handleConfirm}
                loading={groupProcessing}
            >
                <FieldGroup className="mt-4">
                    <Field data-invalid={!!groupErrors.name} className="gap-2">
                        <FieldLabel htmlFor="group.name">Group name</FieldLabel>
                        <Input
                            value={group.name}
                            onChange={(e) => setGroup('name', e.target.value)}
                            type="text"
                            id="group.name"
                            placeholder="Group name"
                            aria-invalid={!!groupErrors.name}
                            tabIndex={1}
                        />
                        {groupErrors.name && (
                            <FieldError>{groupErrors.name}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </ReusableDrawer>
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.visit(employeeIndex.url())}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={isEditMode ? onUpdate : onSubmit}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {isEditMode ? 'Save changes' : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

EmployeeForm.layout = {
    breadcrumbs: [
        {
            title: 'Employee',
            href: employeeIndex(),
        },
    ],
};
