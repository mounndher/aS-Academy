<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormationDay;
use Illuminate\Http\JsonResponse;

class FormationDayController extends Controller
{
    public function index(): JsonResponse
    {
        $days = FormationDay::with('formation')
            ->where('status', 'available')
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $days,
        ]);
    }

    public function byFormation(int $formationId): JsonResponse
    {
        $days = FormationDay::query()
            ->where('formation_id', $formationId)
            ->where('status', 'available')
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $days,
        ]);
    }
}