<?php

namespace App\Http\Requests\Main\CutOff;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CutOffFormRequest extends FormRequest
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
            'Name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('cutoff_dates', 'Name')->ignore($this->cutoffDate),
            ],
            'Cutoff1StartDay' => ['required', 'integer', 'between:1,31'],
            'Cutoff1EndDay'   => ['required', 'integer', 'between:1,31'],
            'Cutoff2StartDay' => ['required', 'integer', 'between:1,31'],
            'Cutoff2EndDay'   => ['required', 'integer', 'between:1,31'],
            'IsActive'        => ['boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $c1Start = (int) $this->input('Cutoff1StartDay');
            $c1End   = (int) $this->input('Cutoff1EndDay');
            $c2Start = (int) $this->input('Cutoff2StartDay');
            $c2End   = (int) $this->input('Cutoff2EndDay');

            if ($c2Start >= $c2End) {
                $validator->errors()->add(
                    'Cutoff2EndDay',
                    'Cutoff 2 end day must be after Cutoff 2 start day.'
                );
            }

            if ($c1Start === $c1End) {
                $validator->errors()->add(
                    'Cutoff1EndDay',
                    'Cutoff 1 start and end day cannot be the same.'
                );
            }

            $cutoff1Days = $this->expandDayRange($c1Start, $c1End, wraps: true);
            $cutoff2Days = $this->expandDayRange($c2Start, $c2End, wraps: false);

            $overlap = array_intersect($cutoff1Days, $cutoff2Days);

            if (! empty($overlap)) {
                $validator->errors()->add(
                    'Cutoff2StartDay',
                    'Cutoff 1 and Cutoff 2 date ranges overlap on day(s): ' . implode(', ', $overlap)
                );
            }
        });
    }

    private function expandDayRange(int $start, int $end, bool $wraps): array
    {
        if ($start <= $end) {
            return range($start, $end);
        }

        if ($wraps) {
            return array_merge(range($start, 31), range(1, $end));
        }

        return [];
    }

    public function messages(): array
    {
        return [
            'Cutoff1StartDay.between' => 'Cutoff 1 start day must be between 1 and 31.',
            'Cutoff1EndDay.between'   => 'Cutoff 1 end day must be between 1 and 31.',
            'Cutoff2StartDay.between' => 'Cutoff 2 start day must be between 1 and 31.',
            'Cutoff2EndDay.between'   => 'Cutoff 2 end day must be between 1 and 31.',
        ];
    }
}
