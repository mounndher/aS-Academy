<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormationDay;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ProgrammePlanningController extends Controller
{
    /**
     * Get the complete training planning.
     */
    public function index(): JsonResponse
    {
        $formations = Formation::query()
            ->with([
                'programme',
                'formationDays' => function ($query) {
                    $query->orderBy('start_date', 'asc');
                },
            ])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return response()->json([
            'success' => true,

            'data' => $formations->map(function (Formation $formation) {

                return [
                    'formation_id' => $formation->id,

                    'formation' => $formation->title,

                    'slug' => $formation->slug,

                    'sessions' => $formation->formationDays
                        ->map(function (FormationDay $day) {
                            return $this->formatSession($day);
                        })
                        ->values(),
                ];
            }),
        ]);
    }

    /**
     * Get planning for one formation.
     */
    public function show(Formation $formation): JsonResponse
    {
        abort_unless($formation->is_active, 404);

        $formation->load([
            'formationDays' => function ($query) {
                $query->orderBy('start_date', 'asc');
            },
        ]);

        return response()->json([
            'success' => true,

            'data' => [
                'formation_id' => $formation->id,

                'formation' => $formation->title,

                'slug' => $formation->slug,

                'sessions' => $formation->formationDays
                    ->map(function (FormationDay $day) {
                        return $this->formatSession($day);
                    })
                    ->values(),
            ],
        ]);
    }

    /**
     * Format one formation session.
     */
    private function formatSession(FormationDay $day): array
    {
        return [
            'id' => $day->id,

            'city' => $day->city,

            'start_date' => $day->start_date?->format('Y-m-d'),

            'end_date' => $day->end_date?->format('Y-m-d'),

            /*
             |--------------------------------------------------------------------------
             | Pricing
             |--------------------------------------------------------------------------
             */

            'price' => $day->price !== null
                ? (float) $day->price
                : null,

            'cpf_eligible' => (bool) $day->cpf_eligible,

            'cpf_price' => $day->cpf_price !== null
                ? (float) $day->cpf_price
                : null,

            /*
             |--------------------------------------------------------------------------
             | Places
             |--------------------------------------------------------------------------
             */

            'max_places' => (int) $day->max_places,

            'remaining_places' => (int) $day->remaining_places,

            /*
             |--------------------------------------------------------------------------
             | Status
             |--------------------------------------------------------------------------
             */

            'status' => $this->getSessionStatus($day),

            'status_label' => $this->getSessionStatusLabel($day),

            'can_book' => $this->canBook($day),
        ];
    }

    /**
     * Determine the current status automatically.
     */
    private function getSessionStatus(FormationDay $day): string
    {
        // Admin manually cancelled the session.
        if ($day->status === 'cancelled') {
            return 'cancelled';
        }

        // Session has already finished.
        if (
            $day->end_date &&
            $day->end_date->isBefore(Carbon::today())
        ) {
            return 'finished';
        }

        // No places remaining.
        if ((int) $day->remaining_places <= 0) {
            return 'full';
        }

        return 'available';
    }

    /**
     * French status label.
     */
    private function getSessionStatusLabel(FormationDay $day): string
    {
        return match ($this->getSessionStatus($day)) {
            'available' => 'Disponible',
            'full' => 'Complet',
            'cancelled' => 'Annulée',
            'finished' => 'Terminée',
            default => 'Indisponible',
        };
    }

    /**
     * Can the customer book this session?
     */
    private function canBook(FormationDay $day): bool
    {
        return $this->getSessionStatus($day) === 'available';
    }
}
