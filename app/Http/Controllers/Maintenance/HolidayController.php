<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maintenance\HolidayRequest;
use App\Http\Resources\Maintenance\HolidayResourceCollection;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');

        $query = Holiday::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);

        return Inertia::render('maintenance/holiday/holiday', [
            'holidays' => HolidayResourceCollection::make($query),
        ]);
    }

    public function store(HolidayRequest $request)
    {
        Holiday::create($request->validated());

        return to_route('maintenance.holiday.index')->with('success', 'Successfully saved.');
    }

    public function update(HolidayRequest $request, Holiday $holiday)
    {
        $holiday->update($request->validated());

        return to_route('maintenance.holiday.index')->with('success', 'Successfully updated.');
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return to_route('maintenance.holiday.index')->with('success', 'Successfully deleted.');
    }
}
