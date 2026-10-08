<?php

namespace App\Filament\Widgets;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\Reservation;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class DashboardStats extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $reservationsThisMonth = Reservation::whereBetween(
            'created_at',
            [$startOfMonth, $endOfMonth]
        )->count();

        $revenueThisMonth = (float) Reservation::whereBetween(
            'created_at',
            [$startOfMonth, $endOfMonth]
        )->sum('sold_price');

        $paymentsReceivedThisMonth = (float) Payment::where(
            'status',
            'paid'
        )->whereBetween(
            'paid_at',
            [$startOfMonth, $endOfMonth]
        )->sum('amount');

        $totalCustomers = Customer::count();

        $pendingReservations = Reservation::whereIn(
            'status',
            ['pending', 'pending_payment']
        )->count();

        return [
            Stat::make(
                'Réservations ce mois',
                number_format($reservationsThisMonth, 0, ',', ' ')
            )
                ->description(
                    $pendingReservations . ' en attente'
                )
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color('warning'),

            Stat::make(
                'Chiffre d’affaires',
                number_format($revenueThisMonth, 2, ',', ' ') . ' €'
            )
                ->description('Prix vendu ce mois')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make(
                'Paiements reçus',
                number_format(
                    $paymentsReceivedThisMonth,
                    2,
                    ',',
                    ' '
                ) . ' €'
            )
                ->description('Paiements confirmés')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('primary'),

            Stat::make(
                'Clients',
                number_format($totalCustomers, 0, ',', ' ')
            )
                ->description('Clients enregistrés')
                ->descriptionIcon('heroicon-m-users')
                ->color('gray'),
        ];
    }
}