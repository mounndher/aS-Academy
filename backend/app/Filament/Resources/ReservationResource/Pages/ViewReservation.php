<?php

namespace App\Filament\Resources\ReservationResource\Pages;

use App\Filament\Resources\ReservationResource;
use App\Models\Payment;
use App\Models\Reservation;
use Carbon\Carbon;
use Filament\Actions;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ViewReservation extends ViewRecord
{
    protected static string $resource = ReservationResource::class;

    protected static string $view =
        'filament.resources.reservation.view-reservation';

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('configureInstallments')
                ->label('Configurer les échéances')
                ->icon('heroicon-o-calendar-days')
                ->color('success')
                ->visible(function (Reservation $record): bool {
                    $depositConfirmed = $record->payments()
                        ->where('payment_type', 'deposit')
                        ->where('status', 'completed')
                        ->exists();

                    $installmentsExist = $record->payments()
                        ->where('payment_type', 'installment')
                        ->exists();

                    return $depositConfirmed
                        && ! $installmentsExist
                        && $record->status !== 'cancelled';
                })
                ->form([
                    Select::make('installments_count')
                        ->label('Nombre de paiements pour le solde')
                        ->options([
                            1 => '1 paiement',
                            2 => '2 paiements',
                            3 => '3 paiements',
                        ])
                        ->required()
                        ->native(false),
                ])
                ->modalHeading('Configurer le plan de paiement')
                ->modalDescription(
                    'Le solde sera réparti en paiements à confirmer individuellement.'
                )
                ->modalSubmitActionLabel('Créer les échéances')
                ->action(function (
                    Reservation $record,
                    array $data
                ): void {
                    DB::transaction(function () use ($record, $data): void {
                        $reservation = Reservation::query()
                            ->whereKey($record->getKey())
                            ->lockForUpdate()
                            ->firstOrFail();

                        if ($reservation->status === 'cancelled') {
                            throw ValidationException::withMessages([
                                'installments_count' =>
                                    'Cette réservation est annulée.',
                            ]);
                        }

                        $depositConfirmed = $reservation->payments()
                            ->where('payment_type', 'deposit')
                            ->where('status', 'completed')
                            ->exists();

                        if (! $depositConfirmed) {
                            throw ValidationException::withMessages([
                                'installments_count' =>
                                    'Confirmez d’abord le paiement de l’acompte.',
                            ]);
                        }

                        $installmentsExist = $reservation->payments()
                            ->where('payment_type', 'installment')
                            ->exists();

                        if ($installmentsExist) {
                            throw ValidationException::withMessages([
                                'installments_count' =>
                                    'Un plan de paiement existe déjà pour cette réservation.',
                            ]);
                        }

                        $total = (float) (
                            $reservation->sold_price
                            ?? $reservation->total_amount
                        );

                        $paidCents = (int) round(
                            (float) $reservation->payments()
                                ->where('status', 'completed')
                                ->sum('amount') * 100
                        );

                        $totalCents = (int) round($total * 100);
                        $remainingCents = $totalCents - $paidCents;

                        if ($remainingCents <= 0) {
                            throw ValidationException::withMessages([
                                'installments_count' =>
                                    'Aucun solde restant à répartir.',
                            ]);
                        }

                        $count = (int) $data['installments_count'];

                        if (! in_array($count, [1, 2, 3], true)) {
                            throw ValidationException::withMessages([
                                'installments_count' =>
                                    'Le nombre de paiements est invalide.',
                            ]);
                        }

                        $baseCents = intdiv($remainingCents, $count);
                        $extraCents = $remainingCents % $count;

                        for ($i = 1; $i <= $count; $i++) {
                            $amountCents = $baseCents
                                + ($i <= $extraCents ? 1 : 0);

                            $reservation->payments()->create([
                                'payment_type' => 'installment',
                                'installment_number' => $i,
                                'due_date' => Carbon::today()
                                    ->addMonths($i)
                                    ->toDateString(),
                                'provider' => 'bank_transfer',
                                'transaction_id' => null,
                                'amount' => number_format(
                                    $amountCents / 100,
                                    2,
                                    '.',
                                    ''
                                ),
                                'currency' => 'EUR',
                                'status' => 'pending',
                                'payment_proof' => null,
                                'paid_at' => null,
                            ]);
                        }

                        $reservation->payment_installments = $count;
                        $reservation->save();
                    });

                    Notification::make()
                        ->title('Plan de paiement créé')
                        ->body('Les échéances ont été créées avec le statut « En attente ».')
                        ->success()
                        ->send();
                }),

            Actions\EditAction::make()
                ->label('Modifier'),

            Actions\DeleteAction::make()
                ->label('Supprimer'),
        ];
    }
}
