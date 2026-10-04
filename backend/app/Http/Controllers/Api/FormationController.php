<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationapiController extends Controller
{
    public function index(): JsonResponse
    {
        $formations = Formation::with('programme')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $formations,
        ]);
    }

   public function show(string $slug): JsonResponse
{
    $formation = Formation::with([
        'programme',
        'formationDays' => function ($query) {
            $query
                ->whereIn('status', ['available', 'full'])
                ->whereDate('end_date', '>=', now()->toDateString())
                ->orderBy('start_date');
        },
    ])
        ->where('slug', $slug)
        ->where('is_active', true)
        ->firstOrFail();

    return response()->json([
        'success' => true,
        'data' => $formation,
    ]);
}
}
