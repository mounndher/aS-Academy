<?php

namespace App\Filament\Widgets;

use App\Models\Reservation;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class ReservationsPerMonthChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected ?string $heading = 'Réservations par mois';

    protected ?string $description =
        'Évolution des réservations sur les 12 derniers mois';

    protected function getData(): array
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $months->push(
                Carbon::now()->subMonths($i)->startOfMonth()
            );
        }

        $reservations = Reservation::query()
            ->whereBetween('created_at', [
                $months->first()->copy()->startOfMonth(),
                $months->last()->copy()->endOfMonth(),
            ])
            ->get(['created_at'])
            ->groupBy(function ($reservation) {
                return Carbon::parse(
                    $reservation->created_at
                )->format('Y-m');
            });

        $labels = [];
        $data = [];

        foreach ($months as $month) {
            $key = $month->format('Y-m');

            $labels[] = $month
                ->locale('fr')
                ->translatedFormat('M');

            $data[] = $reservations
                ->get($key, collect())
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Réservations',
                    'data' => $data,
                    'fill' => true,
                    'tension' => 0.4,
                    'borderWidth' => 3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}