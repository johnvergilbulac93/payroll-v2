<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\Loan\LoanRequest;
use App\Http\Resources\Main\Loan\LoanResourceCollection;
use App\Models\Employee;
use App\Models\LoanMaster;
use App\Models\LoanType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = LoanMaster::with('employee:EmpNbr,FullName,Image', 'loanType:id,name')
            ->filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10);
        return Inertia::render(
            'loan/loan',
            [
                'loans' => LoanResourceCollection::make($query),
                'employees' => Employee::where('Status', 1)->select('EmpNbr as value', 'FullName as label')->get(),
                'loanTypes' => LoanType::select('id as value', 'name as label')->get()
            ]
        );
    }
    public function store(LoanRequest $request)
    {

        LoanMaster::create($request->validated());
        return to_route('loan.index');
    }
    public function update(LoanRequest $request, LoanMaster $loanMaster)
    {
        $loanMaster->update($request->validated());
        return to_route('loan.index');
    }
    public function destroy(LoanMaster $loanMaster)
    {
        $loanMaster->delete();
        return to_route('loan.index');
    }
}
