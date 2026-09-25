<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\GovernmentMandatedResourceCollection;
use App\Models\GovernmentMandated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GovernmentMandatedController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');

        $query = GovernmentMandated::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);

        return Inertia::render('maintenance/government_mandated/government-mandated', [
            'government_mandateds' => GovernmentMandatedResourceCollection::make($query),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateRequest($request);
        $file = $request->file('File');

        unset($data['File']);

        $governmentMandated = GovernmentMandated::create($data);

        if ($file) {
            $filename = $file->getClientOriginalName();
            $file->storeAs('pdf/' . $governmentMandated->id, $filename, 'public');
            $governmentMandated->update(['File' => $filename]);
        }

        return to_route('maintenance.government_mandated.index')
            ->with('success', 'Successfully saved.');
    }

    public function update(Request $request, GovernmentMandated $governmentMandated)
    {
        $data = $this->validateRequest($request);

        if ($request->hasFile('File')) {
            // Remove the existing file and any leftover files in this record's folder
            // before storing the replacement.
            Storage::disk('public')->deleteDirectory('pdf/' . $governmentMandated->id);

            // Remove legacy flat-storage file if this record was uploaded before
            // the per-record folder was introduced.
            if ($governmentMandated->File) {
                Storage::disk('public')->delete('pdf/' . basename($governmentMandated->File));
            }

            $file = $request->file('File');
            $filename = $file->getClientOriginalName();
            $data['File'] = $filename;

            Storage::disk('public')->makeDirectory('pdf/' . $governmentMandated->id);
            $file->storeAs('pdf/' . $governmentMandated->id, $filename, 'public');
        } else {
            unset($data['File']);
        }

        $governmentMandated->update($data);

        return to_route('maintenance.government_mandated.index')
            ->with('success', 'Successfully updated.');
    }

    public function download(GovernmentMandated $governmentMandated)
    {
        abort_unless($governmentMandated->File, 404);

        $filename = basename($governmentMandated->File);
        $path = 'pdf/' . $governmentMandated->id . '/' . $filename;

        if (!Storage::disk('public')->exists($path)) {
            $path = 'pdf/' . $filename;
        }

        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->download($path, $filename);
    }

    public function destroy(GovernmentMandated $governmentMandated)
    {
        $governmentMandated->delete();

        return to_route('maintenance.government_mandated.index')
            ->with('success', 'Successfully deleted.');
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'Code' => ['required', 'string', 'max:255'],
            'Description' => ['required', 'string', 'max:255'],
            'ValueType' => ['nullable', 'string', 'max:255'],
            'DefaultValue' => ['nullable', 'numeric'],
            'File' => ['nullable', 'file', 'max:20480'],
            'Status' => ['required', 'boolean'],
        ]);
    }
}
