<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    protected array $modules = [

        'Employee',
        'Loan',
        'Biometric Uploading',
        'Process DTR',
        'Payroll Periods',
        'Employee Shift Schedule',
        'Shift Code',
        'Cutoff Dates',
        'Generate Payslip',
        'Generate Dtr',
        'Users',
        'Roles',
        'Access Control',
        'Deductions',
        'Maintenance',
    ];

    protected array $actions = [
        'view',
        'create',
        'update',
        'delete',
    ];

    // Modules that should use ONLY these actions, ignoring the default $actions list.
    protected array $moduleOverrideActions = [
        'Access Control' => [
            'view',
        ],
        'Generate Payslip' => [
            'view'
        ],
        'Generate Dtr' => [
            'view'
        ],
        'Maintenance' => [
            'view'
        ]
    ];

    // Extra actions per module, on top of the default $actions above.
    protected array $moduleExtraActions = [
        'Employee' => [
            'setup schedule ',
            'setup biometric id',
        ],
        'Roles' => [
            'role permissions',
        ],
        'Users' => [
            'user permissions',
            'reset password',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->modules as $module) {
            $moduleSlug = Str::slug($module);

            $parent = Permission::updateOrCreate(
                ['slug' => $moduleSlug],
                [
                    'name' => $module,
                    'parent_id' => null,
                    'type' => 'module',
                ]
            );

            $actionsForModule = $this->moduleOverrideActions[$module]
                ?? array_merge(
                    $this->actions,
                    // $this->moduleExtraActions[$module] ?? []
                );

            foreach ($actionsForModule as $action) {
                $childSlug = "{$moduleSlug}-" . Str::slug($action);

                Permission::updateOrCreate(
                    ['slug' => $childSlug],
                    [
                        'name' => "{$module} {$action}",
                        'parent_id' => $parent->id,
                        'type' => 'action',
                    ]
                );
            }
        }
    }
}
