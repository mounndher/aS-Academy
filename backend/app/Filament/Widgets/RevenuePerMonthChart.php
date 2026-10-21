
<?php

namespace App\Filament\Widgets;

use App\Models\Payment;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenuePerMonthChart extends ChartWidget
{
    protected static ?int $sort = 3;

    protected static ?string $heading = 'Argent encaissé par mois';

    protected static ?string $description =
        'Paiements confirmés sur les 12 derniers mois';

    protected function getData(): array
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $months->push(
                Carbon::now()->subMonths($i)->startOfMonth()
            );
        }

        $payments = Payment::query()
            ->whereIn('status', ['paid', 'completed'])
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [
                $months->first()->copy()->startOfMonth(),
                $months->last()->copy()->endOfMonth(),
            ])
            ->get(['amount', 'paid_at'])
            ->groupBy(
                fn ($payment) => Carbon::parse($payment->paid_at)
                    ->format('Y-m')
            );

        $labels = [];
        $data = [];

        foreach ($months as $month) {
            $key = $month->format('Y-m');

            $labels[] = $month->copy()
                ->locale('fr')
                ->translatedFormat('M Y');

            $data[] = round(
                (float) $payments->get($key, collect())->sum('amount'),
                2
            );
        }

        return [
            'datasets' => [
                [
                    'label' => 'Argent encaissé (€)',
                    'data' => $data,
                    'backgroundColor' => 'rgba(201, 169, 106, 0.75)',
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
