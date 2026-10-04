<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationApiController extends Controller
{
    /**
     * Toutes les formations actives
     */
    public function index(): JsonResponse
    {
        $formations = Formation::query()
            ->with('programme')
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $formations->map(
                fn (Formation $formation) => $this->formatFormation($formation)
            ),
        ]);
    }

    /**
     * Une formation par slug
     */
    public function show(string $slug): JsonResponse
    {
        $formation = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query
                        ->orderBy('start_date', 'asc');
                },
            ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->formatFormation($formation, true),
        ]);
    }

    /**
     * Format API
     */
    private function formatFormation(
        Formation $formation,
        bool $withPlanning = false
    ): array {
        $data = [
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

            'personal_price' => $formation->personal_price,

            'has_sale' => (bool) $formation->has_sale,

            'sale_price' => $formation->sale_price,

            'installment_enabled' => (bool) $formation->installment_enabled,

            'installment_count' => $formation->installment_count,

            'deposit_amount' => $formation->deposit_amount,

            'is_active' => (bool) $formation->is_active,
        ];

        if ($withPlanning) {
            $data['planning'] = $formation->formationDays->map(
                function ($day) {
                    return [
                        'id' => $day->id,

                        'city' => $day->city,

                        'start_date' => $day->start_date?->format('Y-m-d'),

                        'end_date' => $day->end_date?->format('Y-m-d'),

                        'price' => $day->price,

                        'cpf_eligible' => (bool) $day->cpf_eligible,

                        'cpf_price' => $day->cpf_price,

                        'max_places' => $day->max_places,

                        'remaining_places' => $day->remaining_places,

                        'status' => $day->status,
                    ];
                }
            )->values();
        }

        return $data;
    }
}
