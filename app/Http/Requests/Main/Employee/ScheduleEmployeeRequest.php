<?php

namespace App\Http\Requests\Main\EMployee;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ScheduleEmployeeRequest extends FormRequest
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
            'EmpID' => ['required', 'exists:employees,id'],
            'DayOfWeek' => ['required', 'integer', 'between:0,6'],
            'ShiftCodeID' => ['required', 'exists:shift_codes,id'],
            'EffectiveFrom' => ['nullable', 'date'],
            'EffectiveTo' => ['nullable', 'date', 'after_or_equal:EffectiveFrom'],
        ];
    }
    public function messages()
    {
        return [
            'ShiftCodeID.required' => 'Shift Code field is required',
            'EffectiveFrom.required' => 'Effective from  field is required',
            'EffectiveTo.after_or_equal' => 'The effective to field must after or equal to effective from.'
        ];
    }
}
