<?php

namespace App\Http\Requests\Main\Shift;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ShiftFormRequest extends FormRequest
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
            'Name' => ['required', 'string', 'max:255'],
            'TimeIn' => ['required', 'date_format:H:i'],
            'TimeOut' => ['required', 'date_format:H:i'],
            'BreakMinutes' => ['nullable', 'integer', 'min:0'],
            'GracePeriodMinutes' => ['nullable', 'integer', 'min:0'],
            'CrossesMidNight' => ['required', 'boolean'],
            'IsWorkingDay' => ['required', 'boolean'],
            'TotalHours' => ['required', 'numeric', 'min:0'],
            'IsActive' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'Name.required' => 'Shift name is required.',
            'TimeIn.required' => 'Time in is required.',
            'TimeOut.required' => 'Time out is required.',
        ];
    }
}
