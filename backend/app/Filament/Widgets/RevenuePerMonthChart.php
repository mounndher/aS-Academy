<?php

namespace App\Filament\Widgets;

use App\Models\Reservation;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenuePerMonthChart extends ChartWidget
{
    protected static ?int $sort = 3;

    protected static ?string $heading = 'Chiffre d’affaires';

    protected static ?string $description =
        'Prix vendu sur les 12 derniers mois';

    protected function getData(): array
    {
        /*
        |--------------------------------------------------------------------------
        | LAST 12 MONTHS
        |--------------------------------------------------------------------------
        */

        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $months->push(
                Carbon::now()
                    ->subMonths($i)
                    ->startOfMonth()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RESERVATIONS
        |--------------------------------------------------------------------------
        */

        $reservations = Reservation::query()
            ->whereBetween('created_at', [
                $months
                    ->first()
                    ->copy()
                    ->startOfMonth(),

                $months
                    ->last()
                    ->copy()
                    ->endOfMonth(),
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

        /*
        |--------------------------------------------------------------------------
        | LABELS + DATA
        |--------------------------------------------------------------------------
        */

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

                    'backgroundColor' =>
                        'rgba(201, 169, 106, 0.75)',

                    'borderColor' => '#C9A96A',

                    'borderWidth' => 2,

                    'borderRadius' => 8,
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