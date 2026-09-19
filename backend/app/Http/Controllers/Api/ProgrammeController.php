<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Programme;
use Illuminate\Http\JsonResponse;

class ProgrammeController extends Controller
{
    public function index(): JsonResponse
    {
        $programmes = Programme::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programmes,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $programme = Programme::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $programme,
        ]);
    }
}