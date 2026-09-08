<?php

namespace App\Http\Requests\Main\Employee;

use App\Models\Employee;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
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

            'Image' => ['nullable', 'mimes:jpg,jpeg,png', 'max:5120'], // 5MB
            'remove_image' => ['sometimes', 'boolean'],
            'Group' => ['required', 'string'],
            'EmpNbr' => [
                'required',
                'string',
                Rule::unique('employees', 'EmpNbr')->ignore($this->route('employee')),
            ],
            'FirstName' => ['required', 'string'],
            'MidName' => ['nullable', 'string'],
            'LastName' => ['required', 'string'],
            'Suffix' => ['nullable', 'string'],
            'FullName' => ['nullable', 'string'],
            'Address' => ['nullable', 'string'],
            'CityProv' => ['nullable', 'string'],
            'BirthDate' => ['nullable'],
            'EmployDate' => ['nullable'],
            'RegularDate' => ['nullable'],
            'Position' => ['nullable', 'string'],
            'Assignment' => ['nullable', 'string'],
            'SalaryGrade' => ['nullable', 'string'],
            'BasicPay' => ['nullable', 'numeric'],
            'DailyRate' => ['nullable', 'numeric'],
            'HourlyRate' => ['nullable', 'numeric'],
            'Status' => ['nullable', 'boolean'],
            'SSSNbr' => ['nullable', 'string'],
            'PHICNbr' => ['nullable', 'string'],
            'HDMFNbr' => ['nullable', 'string'],
            'TIN' => ['nullable', 'string'],
            'Degree' => ['nullable', 'string'],
            'AllowReg' => ['nullable', 'numeric'],
            'ResignDate' => ['nullable'],
            'BPIATM' => ['nullable', 'string'],
            'BPIEmpCode' => ['nullable', 'string'],
            'PIN' => ['nullable', 'string'],
            'PERAAID' => ['nullable', 'string'],
            'BiometricID' => ['nullable'],
            'EmploymentStatus' => ['required', 'string'],
            'TenureStatus' => ['required', 'string'],
            'IsLETPasser' => ['nullable', 'boolean'],
            'DailyRateDivisor' => ['required', 'string'],

        ];
    }

    public function messages()
    {
        return [
            'EmpNbr.required' => 'The Employee no. field is required.',
            'EmpNbr.unique' => 'The Employee no. has already been taken.',
            'FirstName.required' => 'The First Name field is required.',
            'LastName.required' => 'The Last Name field is required.',
            'Address.required' => 'The Address field is required.',
            'MidName.required' => 'The Middle Name field is required.',
            'BirthDate.required' => 'The Birth Date field is required.',
            'EmployDate.required' => 'The Employment Date field is required.',
            'CityProv.required' => 'The City/Province field is required.',
            'Group.required' => 'The Group field is required.',
            'EmploymentStatus.required' => 'The Employment status is required.',
            'TenureStatus.required' => 'The Tenure status is required.',
            'DailyRateDivisor.required' => 'The Daily rate basis is required.',

        ];
    }
}
