<?php

namespace App\Http\Requests\Main\Employee;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PerDateScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'EmpID' => ['required', 'integer', 'exists:employees,id'],
            'ScheduleType' => ['required', 'in:default,per_date,date_range'],
            'ShiftCodeID' => ['required', 'integer', 'exists:shift_codes,id'], // nullable = day off, valid for all 3 types
            'EffectiveFrom' => ['required', 'date'],
            'EffectiveTo' => ['nullable', 'date', 'after_or_equal:EffectiveFrom', 'required_if:ScheduleType,date_range'],
            'Remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
    public function messages()
    {
        return [
            'ShiftCodeID.required' => 'Shift code field is required.',
            'EffectiveFrom.required' => 'Please select a date.',
            'EmpID.required' => 'Employee is required',
            'ScheduleType.required' => 'Schedule type is required',
        ];
    }
}
