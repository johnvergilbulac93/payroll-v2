<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\Deduction\DeductionRequest;
use App\Http\Resources\Main\Deduction\DeductionResourceCollection;
use App\Models\DeductionMaster;
use App\Models\DeductionType;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeductionController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit');

        $deductions = DeductionMaster::with([
            'employee:id,EmpNbr,FullName,Image',
            'deductionType:id,name',
        ])
            ->filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10)
            ->withQueryString();

        return Inertia::render('deduction/deduction', [
            'deductions' => DeductionResourceCollection::make($deductions),
            'employees' => Employee::select('id', 'EmpNbr', 'FullName', 'Image')
                ->where('Status', 1)
                ->get()
                ->map(fn (Employee $employee) => [
                    'value' => (string) $employee->id,
                    'label' => $employee->FullName,
                    'description' => $employee->EmpNbr,
                    'image_url' => $employee->image_url,
                ]),
            'deductionTypes' => DeductionType::select('id as value', 'name as label')->orderBy('name')->get(),
        ]);
    }

    public function store(DeductionRequest $request)
    {
        DeductionMaster::create($request->validated());

        return to_route('deduction.index');
    }

    public function update(DeductionRequest $request, DeductionMaster $deductionMaster)
    {
        $deductionMaster->update($request->validated());

        return to_route('deduction.index');
    }

    public function destroy(DeductionMaster $deductionMaster)
    {
        $deductionMaster->delete();

        return to_route('deduction.index');
    }
}
