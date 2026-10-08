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
    /**
     * Create a new reservation.
     */
    public function store12(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */
         

        $validated = $request->validate([
            'formation_
            id' => [
                'required',
                'integer',
                'exists:formations,id',
            ],

            'formation_day_id' => [
                'required',
                'integer',
                'exists:formation_days,id',
            ],

            'first_name' => [
                'required',
                'string',
                'max:100',
            ],

            'last_name' => [
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:50',
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],

            'postal_code' => [
                'required',
                'string',
                'max:20',
            ],

            'city' => [
                'required',
                'string',
                'max:100',
            ],

            'message' => [
                'nullable',
                'string',
                'max:2000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Payment proof
            |--------------------------------------------------------------------------
            */

            'payment_proof' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create reservation inside transaction
        |--------------------------------------------------------------------------
        */

        $reservation = DB::transaction(function () use (
            $validated,
            $request
        ) {

            /*
            |--------------------------------------------------------------------------
            | Formation
            |--------------------------------------------------------------------------
            */

            $formation = Formation::findOrFail(
                $validated['formation_id']
            );

            /*
            |--------------------------------------------------------------------------
            | Formation day / session
            |--------------------------------------------------------------------------
            */

            $formationDay = FormationDay::findOrFail(
                $validated['formation_day_id']
            );

            /*
            |--------------------------------------------------------------------------
            | Make sure the session belongs to this formation
            |--------------------------------------------------------------------------
            */

            if (
                (int) $formationDay->formation_id !==
                (int) $formation->id
            ) {
                abort(
                    422,
                    'La session sélectionnée ne correspond pas à cette formation.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Check available places
            |--------------------------------------------------------------------------
            */

            if (
                $formationDay->remaining_places === null ||
                $formationDay->remaining_places <= 0
            ) {
                abort(
                    422,
                    'Cette session est complète.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Get total price
            |--------------------------------------------------------------------------
            |
            | The price belongs to FormationDay.
            |
            | Example:
            |
            | Paris:
            | personal_price = 850
            |
            */

            $totalAmount = $formationDay->personal_price;

            if (
                $totalAmount === null ||
                $totalAmount === ''
            ) {
                abort(
                    422,
                    'Le tarif de cette session n\'est pas disponible.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Get deposit
            |--------------------------------------------------------------------------
            |
            | The deposit belongs to Formation.
            |
            | Example:
            |
            | deposit_amount = 150
            |
            */

            $depositAmount = $formation->deposit_amount;

            if (
                $depositAmount === null ||
                $depositAmount === ''
            ) {
                abort(
                    422,
                    'Le montant de l\'acompte n\'est pas configuré.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Create or update customer
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | Generate reservation reference
            |--------------------------------------------------------------------------
            */

            do {
                $reference =
                    'RES-' .
                    strtoupper(
                        Str::random(8)
                    );
            } while (
                Reservation::where(
                    'reference',
                    $reference
                )->exists()
            );

            /*
            |--------------------------------------------------------------------------
            | Upload payment proof
            |--------------------------------------------------------------------------
            */

            $paymentProof = null;

            if (
                $request->hasFile('payment_proof')
            ) {
                $paymentProof = $request
                    ->file('payment_proof')
                    ->store(
                        'payments/proofs',
                        'public'
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Create reservation
            |--------------------------------------------------------------------------
            */

            $reservation = Reservation::create([
                'reference' => $reference,

                'formation_id' => $formation->id,

                'formation_day_id' => $formationDay->id,

                'customer_id' => $customer->id,

                'total_amount' => $totalAmount,

                'deposit_amount' => $depositAmount,

                'status' => 'pending',

                'notes' =>
                    $validated['message'] ?? null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create payment
            |--------------------------------------------------------------------------
            */

            Payment::create([
                'reservation_id' =>
                    $reservation->id,

                'provider' =>
                    'bank_transfer',

                'transaction_id' => null,

                'amount' =>
                    $depositAmount,

                'currency' =>
                    'EUR',

                'status' =>
                    'pending',

                'payment_proof' =>
                    $paymentProof,

                'paid_at' => null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Reserve one place
            |--------------------------------------------------------------------------
            */

            $formationDay->decrement(
                'remaining_places'
            );

            return $reservation;
        });

        /*
        |--------------------------------------------------------------------------
        | Load relationships
        |--------------------------------------------------------------------------
        */

        $reservation->load([
            'formation',
            'formationDay',
            'customer',
            'payment',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Send notification to admin
        |--------------------------------------------------------------------------
        */

        $this->sendAdminNotification(
            $reservation
        );

        /*
        |--------------------------------------------------------------------------
        | Bank information
        |--------------------------------------------------------------------------
        */

        $settings = SiteSetting::first();

        /*
        |--------------------------------------------------------------------------
        | JSON response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Votre réservation a été envoyée avec succès.',

            'reservation' => [
                'id' =>
                    $reservation->id,

                'reference' =>
                    $reservation->reference,

                'status' =>
                    $reservation->status,

                'formation' =>
                    $reservation->formation->title,

                'formation_day_id' =>
                    $reservation->formationDay->id,

                'session' => [
                    'city' =>
                        $reservation
                            ->formationDay
                            ->city,

                    'start_date' =>
                        $reservation
                            ->formationDay
                            ->start_date,

                    'end_date' =>
                        $reservation
                            ->formationDay
                            ->end_date,
                ],

                'total_amount' =>
                    $reservation->total_amount,

                'deposit_amount' =>
                    $reservation->deposit_amount,

                'payment_proof' =>
                    $reservation
                        ->payment
                        ?->payment_proof,
            ],

            /*
            |--------------------------------------------------------------------------
            | Bank information
            |--------------------------------------------------------------------------
            */

            'bank_information' => [
                'iban' =>
                    $settings?->iban,

                'bic' =>
                    $settings?->bic,

                'account_holder_address' =>
                    $settings
                        ?->account_holder_address,
            ],
        ], 201);
    }
    public function store13(Request $request)
{
    // =========================================================
    // 1. VALIDATION
    // =========================================================

    $validated = $request->validate([
        'formation_id' => [
            'required',
            'integer',
            'exists:formations,id',
        ],

        'formation_day_id' => [
            'required',
            'integer',
            'exists:formation_days,id',
        ],

        'first_name' => [
            'required',
            'string',
            'max:100',
        ],

        'last_name' => [
            'required',
            'string',
            'max:100',
        ],

        'email' => [
            'required',
            'email',
            'max:255',
        ],

        'phone' => [
            'required',
            'string',
            'max:50',
        ],

        'address' => [
            'required',
            'string',
            'max:255',
        ],

        'postal_code' => [
            'required',
            'string',
            'max:20',
        ],

        'city' => [
            'required',
            'string',
            'max:100',
        ],

        'message' => [
            'nullable',
            'string',
            'max:2000',
        ],

        'payment_proof' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],
    ]);


    // =========================================================
    // 2. TRANSACTION
    // =========================================================

    $reservation = DB::transaction(function () use ($validated, $request) {

        // -----------------------------------------------------
        // Formation
        // -----------------------------------------------------

        $formation = Formation::findOrFail(
            $validated['formation_id']
        );


        // -----------------------------------------------------
        // Formation Day / Session
        // -----------------------------------------------------

        $formationDay = FormationDay::findOrFail(
            $validated['formation_day_id']
        );


        // -----------------------------------------------------
        // Make sure the session belongs to this formation
        // -----------------------------------------------------

        if ((int) $formationDay->formation_id !== (int) $formation->id) {
            abort(
                422,
                'La session sélectionnée ne correspond pas à cette formation.'
            );
        }


        // -----------------------------------------------------
        // Check available places
        // -----------------------------------------------------

        if ($formationDay->remaining_places <= 0) {
            abort(
                422,
                'Cette session est complète.'
            );
        }


        // =====================================================
        // 3. CUSTOMER
        // =====================================================

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


        // =====================================================
        // 4. RESERVATION REFERENCE
        // =====================================================

        do {
            $reference = 'RES-' . strtoupper(
                Str::random(8)
            );
        } while (
            Reservation::where(
                'reference',
                $reference
            )->exists()
        );


        // =====================================================
        // 5. PRICE
        // =====================================================

        /*
         * Your formation currently has:
         *
         * personal_price
         * sale_price
         * deposit_amount
         *
         * We use the following priority:
         *
         * sale_price if active
         * otherwise personal_price
         * otherwise price
         */

        if (
            $formation->has_sale &&
            $formation->sale_price !== null
        ) {
            $totalAmount = (float) $formation->sale_price;
        } elseif (
            $formation->personal_price !== null
        ) {
            $totalAmount = (float) $formation->personal_price;
        } elseif (
            isset($formation->price)
        ) {
            $totalAmount = (float) $formation->price;
        } else {
            $totalAmount = 0;
        }


        // =====================================================
        // 6. DEPOSIT
        // =====================================================

        /*
         * If deposit_amount exists in the formation,
         * use it.
         *
         * Otherwise calculate 30%.
         */

        if ($formation->deposit_amount !== null) {

            $depositAmount = (float) $formation->deposit_amount;

        } else {

            $depositAmount = round(
                $totalAmount * 0.30,
                2
            );
        }


        // =====================================================
        // 7. PAYMENT PROOF
        // =====================================================

        $paymentProof = null;

        if ($request->hasFile('payment_proof')) {

            $paymentProof = $request
                ->file('payment_proof')
                ->store(
                    'payments/proofs',
                    'public'
                );
        }


        // =====================================================
        // 8. CREATE RESERVATION
        // =====================================================

        $reservation = Reservation::create([
            'reference' => $reference,

            'formation_id' => $formation->id,

            'formation_day_id' => $formationDay->id,

            'customer_id' => $customer->id,

            'total_amount' => $totalAmount,

            'deposit_amount' => $depositAmount,

            'status' => 'pending',

            'notes' => $validated['message'] ?? null,

            // If your reservations table has this column:
            'payment_proof' => $paymentProof,
        ]);


        // =====================================================
        // 9. CREATE PAYMENT
        // =====================================================

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
        

        // =====================================================
        // 10. REMOVE ONE AVAILABLE PLACE
        // =====================================================

        $formationDay->decrement(
            'remaining_places'
        );


        return $reservation;
    });


    // =========================================================
    // 11. LOAD RELATIONSHIPS
    // =========================================================

    $reservation->load([
        'formation',
        'formationDay',
        'customer',
        'payment',
    ]);
     dd($request->all());

    // =========================================================
    // 12. ADMIN EMAIL
    // =========================================================

    $this->sendAdminNotification(
        $reservation
    );


    // =========================================================
    // 13. BANK INFORMATION
    // =========================================================

    $settings = SiteSetting::first();


    // =========================================================
    // 14. RESPONSE
    // =========================================================

    return response()->json([
        'success' => true,

        'message' =>
            'Votre réservation a été envoyée avec succès.',

        'reservation' => [

            'reference' =>
                $reservation->reference,

            'status' =>
                $reservation->status,

            'formation' =>
                $reservation->formation->title,

            'session' => [

                'id' =>
                    $reservation->formationDay->id,

                'city' =>
                    $reservation->formationDay->city,

                'start_date' =>
                    $reservation->formationDay->start_date,

                'end_date' =>
                    $reservation->formationDay->end_date,

                'remaining_places' =>
                    $reservation->formationDay->remaining_places,
            ],

            'customer' => [

                'first_name' =>
                    $reservation->customer->first_name,

                'last_name' =>
                    $reservation->customer->last_name,

                'email' =>
                    $reservation->customer->email,
            ],

            'total_amount' =>
                $reservation->total_amount,

            'deposit_amount' =>
                $reservation->deposit_amount,

            'payment_proof' =>
                $reservation->payment?->payment_proof,
        ],

        'bank_information' => [

            'iban' =>
                $settings?->iban,

            'bic' =>
                $settings?->bic,

            'account_holder_address' =>
                $settings?->account_holder_address,
        ],
    ], 201);
}


public function store(Request $request)
{
    /*
    |--------------------------------------------------------------------------
    | 1. VALIDATION
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([
        'formation_id' => [
            'required',
            'integer',
            'exists:formations,id',
        ],

        'formation_day_id' => [
            'required',
            'integer',
            'exists:formation_days,id',
        ],

        'first_name' => [
            'required',
            'string',
            'max:100',
        ],

        'last_name' => [
            'required',
            'string',
            'max:100',
        ],

        'email' => [
            'required',
            'email',
            'max:255',
        ],

        'phone' => [
            'required',
            'string',
            'max:50',
        ],

        'address' => [
            'required',
            'string',
            'max:255',
        ],

        'postal_code' => [
            'required',
            'string',
            'max:20',
        ],

        'city' => [
            'required',
            'string',
            'max:100',
        ],

        'message' => [
            'nullable',
            'string',
            'max:2000',
        ],

        'payment_proof' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],
    ]);


    /*
    |--------------------------------------------------------------------------
    | 2. CREATE RESERVATION
    |--------------------------------------------------------------------------
    */

    $reservation = DB::transaction(function () use ($validated, $request) {

        /*
        |--------------------------------------------------------------------------
        | Formation
        |--------------------------------------------------------------------------
        */

        $formation = Formation::findOrFail(
            $validated['formation_id']
        );


        /*
        |--------------------------------------------------------------------------
        | Selected Formation Day
        |--------------------------------------------------------------------------
        */

        $formationDay = FormationDay::query()
            ->where('id', $validated['formation_day_id'])
            ->where('formation_id', $formation->id)
            ->lockForUpdate()
            ->first();

        if (!$formationDay) {
            abort(
                422,
                'La session sélectionnée ne correspond pas à cette formation.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Check available places
        |--------------------------------------------------------------------------
        */

        if (
            $formationDay->remaining_places === null ||
            $formationDay->remaining_places <= 0
        ) {
            abort(
                422,
                'Cette session est complète.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | PRICE
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Your real database column is:
        |
        | formation_days.price
        |
        | NOT personal_price.
        |
        */

        $totalAmount = (float) $formationDay->price;

        if ($totalAmount <= 0) {
            abort(
                422,
                'Le tarif de cette session n\'est pas configuré.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DEPOSIT
        |--------------------------------------------------------------------------
        |
        | Deposit comes from formations.deposit_amount.
        |
        */

        $depositAmount = (float) $formation->deposit_amount;

        if ($depositAmount <= 0) {
            $depositAmount = round(
                $totalAmount * 0.30,
                2
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Safety
        |--------------------------------------------------------------------------
        */

        if ($depositAmount > $totalAmount) {
            $depositAmount = $totalAmount;
        }


        /*
        |--------------------------------------------------------------------------
        | CUSTOMER
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | RESERVATION REFERENCE
        |--------------------------------------------------------------------------
        */

        do {
            $reference = 'RES-' . strtoupper(
                Str::random(8)
            );
        } while (
            Reservation::where(
                'reference',
                $reference
            )->exists()
        );


        /*
        |--------------------------------------------------------------------------
        | PAYMENT PROOF
        |--------------------------------------------------------------------------
        |
        | Store directly in:
        |
        | backend/public/payments/proofs/
        |
        */

        $paymentProof = null;

        if ($request->hasFile('payment_proof')) {

            $directory = public_path(
                'payments/proofs'
            );

            if (!is_dir($directory)) {
                mkdir(
                    $directory,
                    0755,
                    true
                );
            }

            $file = $request->file(
                'payment_proof'
            );

            $filename =
                (string) Str::uuid()
                . '.'
                . $file->getClientOriginalExtension();

            $file->move(
                $directory,
                $filename
            );

            $paymentProof =
                'payments/proofs/' . $filename;
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE RESERVATION
        |--------------------------------------------------------------------------
        */

        $reservation = Reservation::create([
            'reference' =>
                $reference,

            'formation_id' =>
                $formation->id,

            'formation_day_id' =>
                $formationDay->id,

            'customer_id' =>
                $customer->id,

            'total_amount' =>
                $totalAmount,

            'deposit_amount' =>
                $depositAmount,

            'status' =>
                'pending',

            'notes' =>
                $validated['message'] ?? null,
        ]);


        /*
        |--------------------------------------------------------------------------
        | CREATE PAYMENT
        |--------------------------------------------------------------------------
        */

        Payment::create([
            'reservation_id' =>
                $reservation->id,

            'provider' =>
                'bank_transfer',

            'transaction_id' =>
                null,

            'amount' =>
                $depositAmount,

            'currency' =>
                'EUR',

            'status' =>
                'pending',

            'payment_proof' =>
                $paymentProof,

            'paid_at' =>
                null,
        ]);


        /*
        |--------------------------------------------------------------------------
        | RESERVE ONE PLACE
        |--------------------------------------------------------------------------
        */

        $formationDay->decrement(
            'remaining_places'
        );


        return $reservation;
    });


    /*
    |--------------------------------------------------------------------------
    | LOAD RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    $reservation->load([
        'formation',
        'formation.programme',
        'formationDay',
        'customer',
        'payment',
    ]);


    /*
    |--------------------------------------------------------------------------
    | SEND ADMIN NOTIFICATION
    |--------------------------------------------------------------------------
    */

    $this->sendAdminNotification(
        $reservation
    );


    /*
    |--------------------------------------------------------------------------
    | BANK INFORMATION
    |--------------------------------------------------------------------------
    */

    $settings = SiteSetting::first();


    /*
    |--------------------------------------------------------------------------
    | REMAINING AMOUNT
    |--------------------------------------------------------------------------
    */

    $remainingAmount = max(
        0,
        (float) $reservation->total_amount
        - (float) $reservation->deposit_amount
    );


    /*
    |--------------------------------------------------------------------------
    | PAYMENT PROOF URL
    |--------------------------------------------------------------------------
    */

    $paymentProofUrl = null;

    if (
        $reservation->payment?->payment_proof
    ) {
        $paymentProofUrl = asset(
            $reservation->payment->payment_proof
        );
    }


    /*
    |--------------------------------------------------------------------------
    | JSON RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([
        'success' => true,

        'message' =>
            'Votre réservation a été envoyée avec succès.',

        'reservation' => [

            'id' =>
                $reservation->id,

            'reference' =>
                $reservation->reference,

            'status' =>
                $reservation->status,

            /*
            |--------------------------------------------------------------------------
            | Formation
            |--------------------------------------------------------------------------
            */

            'formation' => [

                'id' =>
                    $reservation->formation->id,

                'title' =>
                    $reservation->formation->title,

                'programme' =>
                    $reservation
                        ->formation
                        ->programme
                        ?->name,
            ],

            /*
            |--------------------------------------------------------------------------
            | Selected session
            |--------------------------------------------------------------------------
            */

            'session' => [

                'id' =>
                    $reservation
                        ->formationDay
                        ->id,

                'city' =>
                    $reservation
                        ->formationDay
                        ->city,

                'start_date' =>
                    $reservation
                        ->formationDay
                        ->start_date,

                'end_date' =>
                    $reservation
                        ->formationDay
                        ->end_date,

                /*
                | Real database column:
                | formation_days.price
                */

                'price' =>
                    $reservation
                        ->formationDay
                        ->price,

                'remaining_places' =>
                    $reservation
                        ->formationDay
                        ->remaining_places,
            ],

            /*
            |--------------------------------------------------------------------------
            | Customer
            |--------------------------------------------------------------------------
            */

            'customer' => [

                'first_name' =>
                    $reservation
                        ->customer
                        ->first_name,

                'last_name' =>
                    $reservation
                        ->customer
                        ->last_name,

                'email' =>
                    $reservation
                        ->customer
                        ->email,

                'phone' =>
                    $reservation
                        ->customer
                        ->phone,
            ],

            /*
            |--------------------------------------------------------------------------
            | Amounts
            |--------------------------------------------------------------------------
            */

            'total_amount' =>
                $reservation->total_amount,

            'deposit_amount' =>
                $reservation->deposit_amount,

            'remaining_amount' =>
                $remainingAmount,

            /*
            |--------------------------------------------------------------------------
            | Payment proof
            |--------------------------------------------------------------------------
            */

            'payment_proof' =>
                $reservation
                    ->payment
                    ?->payment_proof,

            'payment_proof_url' =>
                $paymentProofUrl,
        ],

        /*
        |--------------------------------------------------------------------------
        | Bank information
        |--------------------------------------------------------------------------
        */

        'bank_information' => [

            'iban' =>
                $settings?->iban,

            'bic' =>
                $settings?->bic,

            'account_holder_address' =>
                $settings
                    ?->account_holder_address,
        ],
    ], 201);
}

    /**
     * Send reservation notification to admin.
     */
    private function sendAdminNotification(
        Reservation $reservation
    ): void {

        $adminEmail = config(
            'mail.admin_email'
        );

        if (!$adminEmail) {
            return;
        }

        Mail::send(
            'emails.reservation-admin',
            [
                'reservation' =>
                    $reservation,
            ],
            function ($message) use (
                $adminEmail,
                $reservation
            ) {

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