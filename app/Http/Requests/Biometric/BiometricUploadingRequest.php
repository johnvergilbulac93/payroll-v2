<?php

namespace App\Http\Requests\Biometric;

use App\Models\BiometricImportBatch;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BiometricUploadingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attachments' => ['required', 'array', 'min:1'],
            'attachments.*' => [
                'required',
                'file',
                'extensions:dat',
                function ($attribute, $value, $fail) {
                    $exists = BiometricImportBatch::where('original_filename', $value->getClientOriginalName())
                        ->exists();

                    if ($exists) {
                        $fail("This file ({$value->getClientOriginalName()}) has already been uploaded.");
                    }
                },
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'attachments.*.required' => 'Each file is required.',
            'attachments.*.file' => 'Each upload must be a valid file.',
            'attachments.*.extensions' => 'Only .dat files are allowed.',
        ];
    }
}
