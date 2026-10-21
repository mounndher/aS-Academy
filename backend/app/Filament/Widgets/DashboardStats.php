
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
        $start = Carbon::now()->startOfMonth();
        $end = Carbon::now()->endOfMonth();

        $confirmedPaymentStatuses = ['paid', 'completed'];

        // Réservations créées ce mois
        $reservationsThisMonth = Reservation::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        // Paiements réellement confirmés ce mois
        $paymentsReceivedThisMonth = (float) Payment::query()
            ->whereIn('status', $confirmedPaymentStatuses)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end])
            ->sum('amount');

        // Total des paiements confirmés depuis le début
        $totalReceived = (float) Payment::query()
            ->whereIn('status', $confirmedPaymentStatuses)
            ->sum('amount');

        // Total vendu pour toutes les réservations
        $totalSold = (float) Reservation::query()
            ->sum('sold_price');

        // Reste global à payer
        $remainingAmount = max(0, $totalSold - $totalReceived);

        // Clients
        $totalCustomers = Customer::query()->count();

        // Réservations en attente
        $pendingReservations = Reservation::query()
            ->whereIn('status', ['pending', 'pending_payment'])
            ->count();

        return [
            Stat::make(
                'Réservations ce mois',
                number_format($reservationsThisMonth, 0, ',', ' ')
            )
                ->description($pendingReservations . ' en attente')
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color('warning'),

            Stat::make(
                'Argent reçu ce mois',
                number_format($paymentsReceivedThisMonth, 2, ',', ' ') . ' €'
            )
                ->description('Paiements confirmés pendant ce mois')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make(
                'Total encaissé',
                number_format($totalReceived, 2, ',', ' ') . ' €'
            )
                ->description('Tous les paiements confirmés')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('primary'),

            Stat::make(
                'Reste à payer',
                number_format($remainingAmount, 2, ',', ' ') . ' €'
            )
                ->description('Solde global des réservations')
                ->descriptionIcon('heroicon-m-clock')
                ->color($remainingAmount > 0 ? 'warning' : 'success'),

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
