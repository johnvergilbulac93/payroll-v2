<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'username' => ['required', 'string', Rule::unique('users', 'username')->ignore($this->route('user'))],
            'role_id' => ['required'],
            'IsActive' => ['boolean', 'nullable']
        ];
    }
    public function messages()
    {
        return [
            'name.required' => 'Name field is required.',
            'username.required' => 'Username field is required.',
            'role_id.required' => 'Role field is required.'
        ];
    }
}
