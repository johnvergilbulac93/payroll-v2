<?php

namespace App\Http\Requests\Main\Deduction;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DeductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'DeductionTypeId' => ['required', 'integer', 'exists:deduction_types,id'],
            'EmpID' => ['required', 'integer', 'exists:employees,id'],
            'OrigBal' => ['required', 'numeric', 'min:0'],
            'DedAmt' => ['required', 'numeric', 'min:0'],
            'StartDate' => ['required', 'date'],
            'Frequency' => ['nullable', 'string', 'max:255'],
            'BalanceAmt' => ['required', 'numeric', 'min:0'],
            'BalanceasofDate' => ['nullable', 'numeric', 'min:0'],
            'Crtd_Date' => ['nullable', 'date'],
            'Crtd_User' => ['nullable', 'string', 'max:255'],
            'LUpd_Date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'DeductionTypeId.required' => 'Deduction type is required.',
            'EmpID.required' => 'Employee is required.',
            'OrigBal.required' => 'Original balance is required.',
            'DedAmt.required' => 'Deduction amount is required.',
            'StartDate.required' => 'Deduction start date is required.',
            'BalanceAmt.required' => 'Balance amount is required.',
        ];
    }
}
