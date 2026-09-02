<?php

namespace App\Http\Requests\Main\PayrollPeriod;

use App\Models\PayrollPeriod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class PayrollPeriodFormRequest extends FormRequest
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
            'Year' => ['required'],
            'CutoffDateID' => ['required']
        ];
    }
    public function messages()
    {
        return [
            'Year.required' => 'Please select a year',
            'CutoffDateID.required' => 'Please select a cutoff date',
        ];
    }
    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $alreadyExists = PayrollPeriod::where('Year', $this->input('Year'))
                ->where('CutoffDateID', $this->input('CutoffDateID'))
                ->exists();

            if ($alreadyExists) {
                $validator->errors()->add(
                    'Year',
                    'Periods for this year and scheme have already been generated.'
                );
            }
        });
    }
}
