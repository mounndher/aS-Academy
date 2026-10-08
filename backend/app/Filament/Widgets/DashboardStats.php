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

        /*
        |--------------------------------------------------------------------------
        | RESERVATIONS THIS MONTH
        |--------------------------------------------------------------------------
        */

        $reservationsThisMonth = Reservation::query()
            ->whereBetween('created_at', [
                $startOfMonth,
                $endOfMonth,
            ])
            ->count();

        /*
        |--------------------------------------------------------------------------
        | REVENUE THIS MONTH
        |--------------------------------------------------------------------------
        */

        $revenueThisMonth = (float) Reservation::query()
            ->whereBetween('created_at', [
                $startOfMonth,
                $endOfMonth,
            ])
            ->sum('sold_price');

        /*
        |--------------------------------------------------------------------------
        | PAYMENTS RECEIVED THIS MONTH
        |--------------------------------------------------------------------------
        */

        $paymentsReceivedThisMonth = (float) Payment::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [
                $startOfMonth,
                $endOfMonth,
            ])
            ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | TOTAL CUSTOMERS
        |--------------------------------------------------------------------------
        */

        $totalCustomers = Customer::query()->count();

        /*
        |--------------------------------------------------------------------------
        | PENDING RESERVATIONS
        |--------------------------------------------------------------------------
        */

        $pendingReservations = Reservation::query()
            ->whereIn('status', [
                'pending',
                'pending_payment',
            ])
            ->count();

        return [

            /*
            |--------------------------------------------------------------------------
            | RESERVATIONS
            |--------------------------------------------------------------------------
            */

            Stat::make(
                'Réservations ce mois',
                number_format(
                    $reservationsThisMonth,
                    0,
                    ',',
                    ' '
                )
            )
                ->description(
                    $pendingReservations . ' en attente'
                )
                ->descriptionIcon(
                    'heroicon-m-calendar-days'
                )
                ->color('warning'),

            /*
            |--------------------------------------------------------------------------
            | REVENUE
            |--------------------------------------------------------------------------
            */

            Stat::make(
                'Chiffre d’affaires',
                number_format(
                    $revenueThisMonth,
                    2,
                    ',',
                    ' '
                ) . ' €'
            )
                ->description(
                    'Prix vendu ce mois'
                )
                ->descriptionIcon(
                    'heroicon-m-banknotes'
                )
                ->color('success'),

            /*
            |--------------------------------------------------------------------------
            | PAYMENTS
            |--------------------------------------------------------------------------
            */

            Stat::make(
                'Paiements reçus',
                number_format(
                    $paymentsReceivedThisMonth,
                    2,
                    ',',
                    ' '
                ) . ' €'
            )
                ->description(
                    'Paiements confirmés ce mois'
                )
                ->descriptionIcon(
                    'heroicon-m-credit-card'
                )
                ->color('primary'),

            /*
            |--------------------------------------------------------------------------
            | CUSTOMERS
            |--------------------------------------------------------------------------
            */

            Stat::make(
                'Clients',
                number_format(
                    $totalCustomers,
                    0,
                    ',',
                    ' '
                )
            )
                ->description(
                    'Clients enregistrés'
                )
                ->descriptionIcon(
                    'heroicon-m-users'
                )
                ->color('gray'),
        ];
    }
}