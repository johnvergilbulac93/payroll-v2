<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\LoanTypeResourceCollection;
use App\Models\LoanType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanTypeController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');
        $query = LoanType::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);
        return Inertia::render(
            'maintenance/loan_type/loan-type',
            [
                'loan_types' => LoanTypeResourceCollection::make($query)
            ]
        );
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        LoanType::create($validated);
        return to_route('maintenance.loan_type.index')->with('success', 'Successfully saved.');
    }
    public function update(Request $request, LoanType $loanType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        $loanType->update($validated);
        return to_route('maintenance.loan_type.index')->with('success', 'Successfully updated.');
    }
    public function destroy(LoanType $loanType)
    {
        $loanType->delete();
        return to_route('maintenance.loan_type.index')->with('success', 'Successfully deleted.');
    }
}
