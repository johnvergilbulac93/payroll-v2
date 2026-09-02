<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::where('name', 'Admin')->first();
        $user = User::create(
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make(config('auth.default_password')),
                'role_id' => $role->id,
                'IsActive' => true,
            ],

        );
        // Assign all permissions to the super admin role and user
        $allPermissionIds = Permission::pluck('id');
        $role->permissions()->sync($allPermissionIds);
        $user->permissions()->sync($allPermissionIds);
    }
}
