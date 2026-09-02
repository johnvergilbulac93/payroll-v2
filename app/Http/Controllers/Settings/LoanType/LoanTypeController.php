<?php

namespace App\Http\Controllers\Settings\LoanType;

use App\Http\Controllers\Controller;
use App\Models\LoanType;
use Illuminate\Http\Request;

class LoanTypeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ], ['name.required' => 'Loan type is required.']);

        LoanType::create($validated);
        return redirect()->back();
    }
}
