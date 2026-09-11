<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\ActivityLogResource;
use App\Http\Resources\Maintenance\ActivityLogResourceCollection;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $limit = $request->integer('limit');
        $search = $request->string('search')->trim()->toString();

        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('description', 'like', "%{$search}%")
                        ->orWhere('log_name', 'like', "%{$search}%")
                        ->orWhere('event', 'like', "%{$search}%")
                        ->orWhereHasMorph('causer', [User::class], function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('created_at');

        $activities = ActivityLogResourceCollection::make(
            $query->paginate($limit ?: 10)
        );

        return Inertia::render('maintenance/activity_logs/activity-logs', [
            'activities' => $activities,
        ]);
    }
}
