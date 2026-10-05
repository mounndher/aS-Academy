<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationApiController extends Controller
{
    /**
     * Get all active formations with ALL formation days.
     */
    public function index(): JsonResponse
    {
        $formations = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query->orderBy('start_date');
                },
            ])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $formations->map(
                fn (Formation $formation) => $this->formatFormation($formation)
            )->values(),
        ]);
    }

    /**
     * Get one formation by slug with ALL formation days.
     */
    public function show(string $slug): JsonResponse
    {
        $formation = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query->orderBy('start_date');
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

            'title' => $formation->title,

            'slug' => $formation->slug,

            'description' => $formation->description,

            'steps' => $formation->steps ?? [],

            /*
             * Formation main image
             */
            'image' => $formation->image
                ? asset($formation->image)
                : null,

            /*
             * PDF
             */
            'pdf_program' => $formation->pdf_program
                ? asset($formation->pdf_program)
                : null,

            'deposit_amount' => $formation->deposit_amount,

            'personal_price' => $formation->personal_price,

            'has_sale' => (bool) $formation->has_sale,

            'sale_price' => $formation->sale_price,

            'installment_enabled' => (bool) $formation->installment_enabled,

            'installment_count' => $formation->installment_count,

            'is_active' => (bool) $formation->is_active,

            /*
             * Programme
             */
            'programme' => $formation->programme
                ? [
                    'id' => $formation->programme->id,

                    'name' => $formation->programme->name,

                    'slug' => $formation->programme->slug,

                    'description' => $formation->programme->description,

                    'duration' => $formation->programme->duration,

                    'is_active' => (bool) $formation->programme->is_active,
                ]
                : null,

            /*
             * ALL FormationDays
             */
            'formationDays' => $formation->formationDays
                ->map(function ($day) {

                    return [
                        'id' => $day->id,

                        'formation_id' => $day->formation_id,

                        'city' => $day->city,

                        /*
                         * CITY IMAGE
                         */
                        'image' => $day->image
                            ? asset($day->image)
                            : null,

                        'start_date' => $day->start_date,

                        'end_date' => $day->end_date,

                        'personal_price' => $day->price,

                        'cpf_eligible' => (bool) $day->cpf_eligible,

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