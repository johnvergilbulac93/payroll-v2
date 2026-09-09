<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Biometric\BiometricUploadingRequest;
use App\Http\Resources\Main\Biometric\BiometricUploadingResourceCollection;
use App\Models\BiometricImportBatch;
use App\Services\DTR\BiometricLogImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BiometricUploadingController extends Controller
{
    public function __construct(
        private readonly BiometricLogImportService $importService,
    ) {}
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = BiometricImportBatch::filter($request->only(['search']))
            ->with('uploadedBy:id,name')
            ->latest()
            ->paginate($limit ?? 10)
            ->withQueryString();

        return Inertia::render(
            'biometric/biometric-uploading',
            [
                'UploadedFiles' => BiometricUploadingResourceCollection::make($query)
            ]
        );
    }

    public function store(BiometricUploadingRequest $request)
    {
        $batches = [];

        foreach ($request->file('attachments') as $file) {

            $storedPath = $file->storeAs(
                'biometric-imports',
                $file->getClientOriginalName(),
                'local'
            );

            $batch = BiometricImportBatch::create([
                'original_filename' => $file->getClientOriginalName(),
                'stored_path' => $storedPath,
                'uploaded_by' => $request->user()->id,
                'status' => 'pending',
            ]);

            $batches[] = $batch;

            // Queue is recommended
            // ProcessBiometricImportJob::dispatch($batch);

            // Or synchronous
            $this->importService->import($batch);
        }

        return to_route('uploading.index')
            ->with(
                'success',
                count($batches) . ' file(s) uploaded successfully.'
            );
    }
    public function reProcessBiometricData(BiometricImportBatch $biometricImportBatch)
    {
        $this->importService->reprocess($biometricImportBatch);
        return to_route('uploading.index')
            ->with('success', "Reprocessing of '{$biometricImportBatch->original_filename}' completed.");
    }
    public function destroy(BiometricImportBatch $biometricImportBatch)
    {
        Storage::disk('local')->delete($biometricImportBatch->stored_path);
        $biometricImportBatch->delete();
    }
}
