<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $limit = min(max($request->integer('limit', 10), 1), 100);
        $search = $request->string('search')->trim()->toString();
        $event = $request->string('event')->trim()->toString();

        $paginator = LoginActivity::query()
            ->with('user')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('username', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('failure_reason', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($event, ['login_success', 'login_failed', 'logout'], true), fn ($query) => $query->where('event', $event))
            ->latest('created_at')
            ->paginate($limit)
            ->withQueryString();

        $activities = [
            'data' => $paginator->getCollection()->map(fn (LoginActivity $activity) => [
                'id' => $activity->id,
                'date' => $activity->created_at?->format('Y-m-d H:i:s'),
                'user' => $activity->user?->name ?? $activity->username ?? 'Unknown',
                'username' => $activity->username ?? $activity->user?->username ?? '—',
                'event' => $activity->event,
                'ip_address' => $activity->ip_address ?? '—',
                'user_agent' => $activity->user_agent,
                'failure_reason' => $activity->failure_reason,
                'session_id' => $activity->session_id,
            ])->values(),
            'pagination' => [
                'total' => $paginator->total(),
                'limit' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'first_page_url' => $paginator->url(1),
                'last_page_url' => $paginator->url($paginator->lastPage()),
                'prev_page_url' => $paginator->previousPageUrl(),
                'next_page_url' => $paginator->nextPageUrl(),
                'name' => $paginator->total()
                    ? "Showing {$paginator->firstItem()} to {$paginator->lastItem()} of {$paginator->total()} entries."
                    : 'Showing 0 to 0 of 0 entries.',
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'links' => collect($paginator->linkCollection())->map(fn ($link) => [
                    'url' => $link['url'],
                    'label' => $link['label'],
                    'page' => is_numeric(strip_tags($link['label'])) ? (int) strip_tags($link['label']) : null,
                    'active' => $link['active'],
                ])->values(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];

        return Inertia::render('maintenance/login_activity/login-activity', [
            'activities' => $activities,
            'filters' => ['search' => $search, 'event' => $event, 'limit' => $limit],
        ]);
    }
}
