<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\EMployee\ScheduleEmployeeRequest;
use App\Http\Resources\Main\Shift\ShiftResource;
use App\Models\Employee;
use App\Models\ScheduleTemplate;
use App\Models\ShiftCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function indexSchedule(Employee $employee)
    {

        return Inertia::render('employee/employee-schedule', [
            'employee' => $employee->only('id', 'FullName', 'EmpNbr'),
            'templates' => $employee->load('scheduleTemplate.shiftCode:id,Name,TimeIn,TimeOut,IsWorkingDay')
                ->scheduleTemplate,
            'shiftCodes' => ShiftResource::collection(ShiftCode::get())->resolve()

        ]);
    }

    public function storeSchedule(ScheduleEmployeeRequest $request)
    {
        ScheduleTemplate::create($request->validated());

        return redirect()->back()
            ->with('success', 'Success: schedule added.');
    }
    public function destroySchedule(ScheduleTemplate $scheduleTemplate)
    {
        $scheduleTemplate->delete();
        return redirect()->back()
            ->with('success', 'Success: schedule deleted.');
    }
}
