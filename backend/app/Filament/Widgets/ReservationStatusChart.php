<?php

namespace App\Filament\Widgets;

use App\Models\Reservation;
use Filament\Widgets\ChartWidget;

class ReservationStatusChart extends ChartWidget
{
    protected static ?int $sort = 5;

    protected static ?string $heading =
        'Statut des réservations';

    protected static ?string $description =
        'Répartition actuelle des réservations';

    protected function getData(): array
    {
        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        $statuses = [
            'pending' => 'En attente',

            'pending_payment' =>
                'Paiement en attente',

            'confirmed' =>
                'Confirmées',

            'completed' =>
                'Terminées',

            'cancelled' =>
                'Annulées',
        ];

        /*
        |--------------------------------------------------------------------------
        | DATA
        |--------------------------------------------------------------------------
        */

        $data = [];

        foreach ($statuses as $status => $label) {

            $data[] = Reservation::query()
                ->where('status', $status)
                ->count();
        }

        return [

            'labels' => array_values(
                $statuses
            ),

            'datasets' => [

                [
                    'label' => 'Réservations',

                    'data' => $data,

                    'backgroundColor' => [

                        '#F59E0B',

                        '#EAB308',

                        '#18453B',

                        '#22C55E',

                        '#EF4444',
                    ],

                    'borderWidth' => 0,
                ],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}