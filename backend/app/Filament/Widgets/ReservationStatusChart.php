<?php

namespace App\Filament\Widgets;

use App\Models\Reservation;
use Filament\Widgets\ChartWidget;

class ReservationStatusChart extends ChartWidget
{
    protected static ?int $sort = 5;

    protected ?string $heading = 'Statut des réservations';

    protected ?string $description =
        'Répartition actuelle des réservations';

    protected function getData(): array
    {
        $statuses = [
            'pending' => 'En attente',
            'pending_payment' => 'Paiement en attente',
            'confirmed' => 'Confirmées',
            'completed' => 'Terminées',
            'cancelled' => 'Annulées',
        ];

        $data = [];

        foreach ($statuses as $status => $label) {
            $data[] = Reservation::where(
                'status',
                $status
            )->count();
        }

        return [
            'labels' => array_values($statuses),

            'datasets' => [
                [
                    'label' => 'Réservations',
                    'data' => $data,
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