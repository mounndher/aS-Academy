
<?php

namespace App\Filament\Resources\ReservationResource\Pages;

use App\Filament\Resources\ReservationResource;
use App\Models\Payment;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EditReservation extends EditRecord
{
    protected static string $resource = ReservationResource::class;

    protected function afterSave(): void
    {
        $reservation = $this->record;

        // Only process a newly confirmed reservation.
        if (
            $reservation->status !== 'confirmed' ||
            $reservation->getOriginal('status') === 'confirmed'
        ) {
            return;
        }

        // Do not create a payment when no deposit is due.
        $depositAmount = (float) $reservation->deposit_amount;

        if ($depositAmount <= 0) {
            return;
        }

        DB::transaction(function () use ($reservation, $depositAmount) {
            // Prevent duplicate deposit payments.
            $existingDeposit = Payment::query()
                ->where('reservation_id', $reservation->id)
                ->where('transaction_id', 'DEPOSIT-' . $reservation->reference)
                ->exists();

            if ($existingDeposit) {
                return;
            }

            Payment::create([
                'reservation_id' => $reservation->id,
                'provider' => 'bank_transfer',
                'transaction_id' => 'DEPOSIT-' . $reservation->reference,
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
