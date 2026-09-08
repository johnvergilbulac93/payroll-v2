<?php

namespace App\Http\Requests\Maintenance;

use App\Enums\HolidayType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class HolidayRequest extends FormRequest
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
        $holidayId = $this->route('holiday')?->id;

        return [
            'Name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('holidays', 'Name')
                    ->where(fn($query) => $query->where('Date', $this->input('Date')))
                    ->ignore($holidayId),
            ],
            'Date' => ['required', 'date'],
            'HolidayType' => ['required', new Enum(HolidayType::class)],
            'IsRecurring' => ['required', 'boolean'],
        ];
    }
}
