<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationController extends Controller
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
            'days' => function ($query) {
                $query
                    ->where('status', 'available')
                    ->whereDate('date', '>=', now()->toDateString())
                    ->orderBy('date');
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