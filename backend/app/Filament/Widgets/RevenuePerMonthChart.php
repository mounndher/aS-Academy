<?php

namespace App\Filament\Widgets;

use App\Models\Reservation;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenuePerMonthChart extends ChartWidget
{
    protected static ?int $sort = 3;

    protected ?string $heading = 'Chiffre d’affaires';

    protected ?string $description =
        'Prix vendu sur les 12 derniers mois';

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
            ->get([
                'sold_price',
                'created_at',
            ])
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

            $data[] = round(
                $reservations
                    ->get($key, collect())
                    ->sum(function ($reservation) {
                        return (float) $reservation->sold_price;
                    }),
                2
            );
        }

        return [
            'datasets' => [
                [
                    'label' => 'Chiffre d’affaires',
                    'data' => $data,
                    'borderWidth' => 1,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}