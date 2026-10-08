<?php

namespace App\Filament\Widgets;

use App\Models\Customer;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class CustomersPerMonthChart extends ChartWidget
{
    protected static ?int $sort = 4;

    protected ?string $heading = 'Nouveaux clients';

    protected ?string $description =
        'Nouveaux clients enregistrés par mois';

    protected function getData(): array
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $months->push(
                Carbon::now()->subMonths($i)->startOfMonth()
            );
        }

        $customers = Customer::query()
            ->whereBetween('created_at', [
                $months->first()->copy()->startOfMonth(),
                $months->last()->copy()->endOfMonth(),
            ])
            ->get(['created_at'])
            ->groupBy(function ($customer) {
                return Carbon::parse(
                    $customer->created_at
                )->format('Y-m');
            });

        $labels = [];
        $data = [];

        foreach ($months as $month) {
            $key = $month->format('Y-m');

            $labels[] = $month
                ->locale('fr')
                ->translatedFormat('M');

            $data[] = $customers
                ->get($key, collect())
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Nouveaux clients',
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