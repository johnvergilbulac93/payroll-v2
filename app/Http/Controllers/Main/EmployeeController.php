<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\Employee\EmployeeRequest;
use App\Http\Resources\Main\Employee\EmployeeResource;
use App\Http\Resources\Main\Employee\EmployeeResourceCollection;
use App\Models\Employee;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input("limit");

        $employees = Employee::with(['group:id,name'])->filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10);

        return Inertia::render(
            'employee/employee',
            [
                'employees' => EmployeeResourceCollection::make($employees)
            ]
        );
    }
    public function create()
    {
        return Inertia::render(
            'employee/employee-form',
            [
                'groups' => Group::select('id as value', 'name as label')->get()
            ]
        );
    }
    public function store(EmployeeRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('Image')) {
            $validated['Image'] = $request->file('Image')->store('employees', 'public');
        }
        Employee::create($validated);
        return to_route('employee.index');
    }
    public function show(Employee $employee)
    {
        return Inertia::render('employee/employee-form', [
            'employee' => (new EmployeeResource($employee))->resolve(),
            'groups' => Group::select('id as value', 'name as label')->get()
        ]);
    }
    public function update(EmployeeRequest $request, Employee $employee)
    {

        $validated = $request->validated();
        if ($request->hasFile('Image')) {
            if ($employee->Image) {
                Storage::disk('public')->delete($employee->Image);
            }
            $validated['Image'] = $request->file('Image')->store('employees', 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($employee->Image) {
                Storage::disk('public')->delete($employee->Image);
            }
            $validated['Image'] = null;
        } else {
            unset($validated['Image']);
        }

        $employee->update($validated);
        return to_route('employee.index');
    }
    public function destroy(Employee $employee)
    {
        dd($employee);
        $employee->delete();
        return to_route('employee.index');
    }
}
