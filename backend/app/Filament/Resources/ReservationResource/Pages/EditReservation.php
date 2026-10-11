<?php

namespace App\Filament\Resources\ReservationResource\Pages;

use App\Filament\Resources\ReservationResource;
use App\Models\Payment;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\DB;

class EditReservation extends EditRecord
{
    protected static string $resource = ReservationResource::class;

    protected function afterSave(): void
    {
        $reservation = $this->record;

        // Process only newly confirmed reservations.
        if ($reservation->status !== 'confirmed') {
            return;
        }

        $depositAmount = (float) $reservation->deposit_amount;

        if ($depositAmount <= 0) {
            return;
        }

        DB::transaction(function () use ($reservation, $depositAmount) {
            $transactionId = 'DEPOSIT-' . $reservation->reference;

            // Avoid creating the same deposit twice.
            $existingDeposit = Payment::query()
                ->where('reservation_id', $reservation->id)
                ->where('transaction_id', $transactionId)
                ->exists();

            if ($existingDeposit) {
                return;
            }

            Payment::create([
                'reservation_id' => $reservation->id,
                'provider' => 'bank_transfer',
                'transaction_id' => $transactionId,
                'amount' => $depositAmount,
                'currency' => 'EUR',
                'status' => 'completed',
                'paid_at' => now(),
            ]);
        });
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
