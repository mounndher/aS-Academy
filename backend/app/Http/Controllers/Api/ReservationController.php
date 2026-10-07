<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Formation;
use App\Models\FormationDay;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'formation_id' => ['required', 'exists:formations,id'],
            'formation_day_id' => ['required', 'exists:formation_days,id'],

            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],

            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:100'],

            'message' => ['nullable', 'string', 'max:2000'],

            'payment_proof' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $reservation = DB::transaction(function () use ($validated, $request) {

            $formation = Formation::findOrFail(
                $validated['formation_id']
            );

            $formationDay = FormationDay::findOrFail(
                $validated['formation_day_id']
            );

            /*
             * Check available places
             */
            if ($formationDay->remaining_places <= 0) {
                abort(422, 'Cette session est complète.');
            }

            /*
             * Create or update customer
             */
            $customer = Customer::updateOrCreate(
                [
                    'email' => $validated['email'],
                ],
                [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'postal_code' => $validated['postal_code'],
                    'city' => $validated['city'],
                ]
            );

            /*
             * Generate reservation reference
             */
            do {
                $reference = 'RES-' . strtoupper(
                    Str::random(8)
                );
            } while (Reservation::where('reference', $reference)->exists());

            /*
             * Calculate amount
             */
            $totalAmount = $formation->price;

            /*
             * Example: 30% deposit
             */
            $depositAmount = round(
                $totalAmount * 0.30,
                2
            );

            /*
             * Create reservation
             */
            $reservation = Reservation::create([
                'reference' => $reference,

                'formation_id' => $formation->id,

                'formation_day_id' => $formationDay->id,

                'customer_id' => $customer->id,

                'total_amount' => $totalAmount,

                'deposit_amount' => $depositAmount,

                'status' => 'pending',

                'notes' => $validated['message'] ?? null,
            ]);

            /*
             * Payment
             */
            $paymentProof = null;

            if ($request->hasFile('payment_proof')) {
                $paymentProof = $request->file('payment_proof')
                    ->store('payments/proofs', 'public');
            }

            Payment::create([
                'reservation_id' => $reservation->id,

                'provider' => 'bank_transfer',

                'transaction_id' => null,

                'amount' => $depositAmount,

                'currency' => 'EUR',

                'status' => 'pending',

                'payment_proof' => $paymentProof,

                'paid_at' => null,
            ]);

            /*
             * Reserve one place
             */
            $formationDay->decrement('remaining_places');

            return $reservation;
        });

        /*
         * Load relationships
         */
        $reservation->load([
            'formation',
            'formationDay',
            'customer',
            'payment',
        ]);

        /*
         * Send notification to admin
         */
        $this->sendAdminNotification($reservation);

        /*
         * Bank information
         */
        $settings = SiteSetting::first();

        return response()->json([
            'success' => true,

            'message' => 'Votre réservation a été envoyée avec succès.',

            'reservation' => [
                'reference' => $reservation->reference,

                'status' => $reservation->status,

                'formation' => $reservation->formation->name,

                'session' => [
                    'city' => $reservation->formationDay->city,
                    'start_date' => $reservation->formationDay->start_date,
                    'end_date' => $reservation->formationDay->end_date,
                ],

                'total_amount' => $reservation->total_amount,

                'deposit_amount' => $reservation->deposit_amount,
            ],

            /*
             * Bank information for confirmation page
             */
            'bank_information' => [
                'iban' => $settings?->iban,
                'bic' => $settings?->bic,
                'account_holder_address' =>
                    $settings?->account_holder_address,
            ],
        ], 201);
    }

    private function sendAdminNotification(
        Reservation $reservation
    ): void {
        $adminEmail = config('mail.admin_email');

        if (!$adminEmail) {
            return;
        }

        Mail::send(
            'emails.reservation-admin',
            [
                'reservation' => $reservation,
            ],
            function ($message) use ($adminEmail, $reservation) {

                $message
                    ->to($adminEmail)
                    ->subject(
                        'Nouvelle réservation - ' .
                        $reservation->reference
                    );
            }
        );
    }
}