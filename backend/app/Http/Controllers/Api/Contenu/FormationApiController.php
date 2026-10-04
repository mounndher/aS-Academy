<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationApiController extends Controller
{
    /**
     * Get all active formations.
     */
    public function index(): JsonResponse
    {
        $formations = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query
                        ->whereDate('start_date', '>=', now()->toDateString())
                        ->orderBy('start_date');
                },
            ])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $formations->map(
                fn (Formation $formation) =>
                    $this->formatFormation($formation)
            ),
        ]);
    }

    /**
     * Get one formation by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $formation = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query
                        ->whereDate('start_date', '>=', now()->toDateString())
                        ->orderBy('start_date');
                },
            ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->formatFormation($formation),
        ]);
    }

    /**
     * Format formation response.
     */
    private function formatFormation(Formation $formation): array
    {
        return [
            'id' => $formation->id,

            'programme_id' => $formation->programme_id,

            'programme' => $formation->programme?->name,

            'title' => $formation->title,

            'slug' => $formation->slug,

            'description' => $formation->description,

            'steps' => $formation->steps ?? [],

            'image' => $formation->image
                ? asset('storage/' . $formation->image)
                : null,

            'pdf_program' => $formation->pdf_program
                ? asset('storage/' . $formation->pdf_program)
                : null,

            'is_active' => (bool) $formation->is_active,

            'formationDays' => $formation->formationDays
                ->map(function ($day) {
                    return [
                        'id' => $day->id,

                        'formation_id' => $day->formation_id,

                        'city' => $day->city,

                        'start_date' => $day->start_date,

                        'end_date' => $day->end_date,

                        'personal_price' => $day->personal_price,

                        'cpf_price' => $day->cpf_price,

                        'max_places' => $day->max_places,

                        'remaining_places' => $day->remaining_places,

                        'status' => $day->status,
                    ];
                })
                ->values(),
        ];
    }
}
