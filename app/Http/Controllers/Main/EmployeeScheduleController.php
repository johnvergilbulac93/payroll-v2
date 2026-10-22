<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\Employee\PerDateScheduleRequest;
use App\Http\Requests\Main\EMployee\ScheduleEmployeeRequest;
use App\Http\Resources\Main\Shift\ShiftResource;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\ScheduleTemplate;
use App\Models\ShiftCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeScheduleController extends Controller
{
    public function index(Request $request)
    {
        $employeeId = $request->query('emp_id');

        $employee = null;
        $templates = null;
        $perDateSchedule = null;
        $defaultSchedule = null;


        if ($employeeId) {
            $employee = Employee::where('Status', 1)->select('id', 'FullName', 'EmpNbr', 'Image')
                ->findOrFail($employeeId)
                ->append('image_url');

            $templates = $employee->load('scheduleTemplate.shiftCode:id,Name,TimeIn,TimeOut,IsWorkingDay')
                ->scheduleTemplate;
            $schedules = $employee->load('schedule.shiftCode:id,Name,TimeIn,TimeOut,IsWorkingDay')->schedule;
            $perDateSchedule = $schedules->where('ScheduleType', 'per_date')->values();
            $defaultSchedule = $schedules->firstWhere('ScheduleType', 'default');
        }

        return Inertia::render('schedule_employee/schedule-employee', [
            'employees' => Employee::select('id', 'FullName', 'Image', 'Group')
                ->where('Status', 1)
                ->with('group:id,name')
                ->get()
                ->map(fn($employee) => [
                    'value' => (string) $employee->id,
                    'label' => $employee->FullName,
                    'description' => $employee->group?->name,
                    'image_url' => $employee->image_url,
                ]),
            'employee' => $employee,
            'templates' => $templates,
            'shiftCodes' => ShiftResource::collection(ShiftCode::get())->resolve(),
            'perDateSchedules' => $perDateSchedule,
            'defaultSchedule' => $defaultSchedule,
        ]);
    }
    public function store(ScheduleEmployeeRequest $request)
    {
        ScheduleTemplate::create($request->validated());

        return redirect()->back()
            ->with('success', 'Employee schedule assigned.');
    }
    public function destroy(ScheduleTemplate $scheduleTemplate)
    {
        $scheduleTemplate->delete();
        return redirect()->back()
            ->with('success', 'Employee schedule deleted.');
    }

    public function storePerDate(PerDateScheduleRequest $request)
    {
        $validated = $request->validated();
        EmployeeSchedule::updateOrCreate(
            [
                'EmpID' =>  $validated['EmpID'],
                'ScheduleType' => $validated['ScheduleType'],
                'EffectiveFrom' => $validated['EffectiveFrom'],
            ],
            [

                'ShiftCodeID' => $validated['ShiftCodeID'],
                'EffectiveTo' => $validated['EffectiveTo'] ?? null,
                'Remarks' => $validated['Remarks'] ?? null,
                'IsActive' => true,
            ]
        );
        return redirect()->back()->with('success', 'Employee schedule assigned.');
    }
    public function destroyPerDate(EmployeeSchedule $employeeSchedule)
    {
        $employeeSchedule->delete();
        return redirect()->back()->with('success', 'Employee schedule deleted.');
    }
}
