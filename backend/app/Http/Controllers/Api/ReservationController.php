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
use App\Services\TwilioService;
use Illuminate\Support\Facades\Log;
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
    // 1. Validation
    $validated = $request->validate([
        'formation_id' => ['required', 'integer', 'exists:formations,id'],
        'formation_day_id' => ['required', 'integer', 'exists:formation_days,id'],

        'first_name' => ['required', 'string', 'max:100'],
        'last_name' => ['required', 'string', 'max:100'],
        'email' => ['required', 'email', 'max:255'],
        'phone' => ['required', 'string', 'max:50'],
        'address' => ['required', 'string', 'max:255'],
        'postal_code' => ['required', 'string', 'max:20'],
        'city' => ['required', 'string', 'max:100'],
        'message' => ['nullable', 'string', 'max:2000'],

        'pricing_type' => ['required', 'in:normal,cpf'],
        'payment_installments' => ['required', 'integer', 'in:1,2'],

        'payment_proof' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],
    ]);

    $paymentProof = null;

    try {
        $reservation = DB::transaction(function () use (
            $validated,
            $request,
            &$paymentProof
        ) {
            // 2. Formation
            $formation = Formation::findOrFail(
                $validated['formation_id']
            );

            // 3. Lock selected session and verify availability
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

            if (
                $formationDay->remaining_places === null ||
                $formationDay->remaining_places <= 0
            ) {
                abort(422, 'Cette session est complète.');
            }

            // 4. Determine authoritative price
            if ($validated['pricing_type'] === 'cpf') {
                if (
                    !$formationDay->cpf_eligible ||
                    $formationDay->cpf_price === null ||
                    (float) $formationDay->cpf_price <= 0
                ) {
                    abort(
                        422,
                        'Le tarif CPF n’est pas disponible pour cette session.'
                    );
                }

                $basePrice = (float) $formationDay->cpf_price;
            } else {
                if (
                    $formationDay->price === null ||
                    (float) $formationDay->price <= 0
                ) {
                    abort(
                        422,
                        'Le tarif de cette session n’est pas configuré.'
                    );
                }

                $basePrice = (float) $formationDay->price;
            }

            $soldPrice = round($basePrice, 2);

            // 5. Deposit and installment plan
            // The chosen number is the number of payments AFTER the deposit.
            $paymentInstallments = (int) $validated['payment_installments'];

            $depositAmount = round(
                (float) ($formation->deposit_amount ?? 0),
                2
            );

            // Use 30% only if no deposit has been configured.
            if ($depositAmount <= 0) {
                $depositAmount = round($soldPrice * 0.30, 2);
            }

            if (
                $soldPrice <= 0 ||
                $depositAmount <= 0 ||
                $depositAmount >= $soldPrice
            ) {
                abort(
                    422,
                    'Le prix ou le montant de l’acompte est invalide.'
                );
            }

            // Never replace the deposit with the full price
            // when the customer chooses one remaining payment.
            $remainingAfterDeposit = round(
                $soldPrice - $depositAmount,
                2
            );

            $standardInstallment = round(
                $remainingAfterDeposit / $paymentInstallments,
                2
            );

            // 6. Create or update customer
            $customer = Customer::updateOrCreate(
                ['email' => $validated['email']],
                [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'postal_code' => $validated['postal_code'],
                    'city' => $validated['city'],
                ]
            );

            // 7. Unique reservation reference
            do {
                $reference = 'RES-' . strtoupper(Str::random(8));
            } while (
                Reservation::where('reference', $reference)->exists()
            );

            // 8. Save proof, if provided
            if ($request->hasFile('payment_proof')) {
                $directory = public_path('payments/proofs');

                if (
                    !is_dir($directory) &&
                    !mkdir($directory, 0755, true) &&
                    !is_dir($directory)
                ) {
                    abort(500, 'Impossible de créer le dossier des justificatifs.');
                }

                $file = $request->file('payment_proof');

                $filename = (string) Str::uuid()
                    . '.'
                    . strtolower($file->getClientOriginalExtension());

                $file->move($directory, $filename);

                $paymentProof = 'payments/proofs/' . $filename;
            }

            // 9. Create reservation
            $reservation = Reservation::create([
                'reference' => $reference,
                'formation_id' => $formation->id,
                'formation_day_id' => $formationDay->id,
                'customer_id' => $customer->id,
                'pricing_type' => $validated['pricing_type'],
                'sold_price' => $soldPrice,
                'payment_installments' => $paymentInstallments,
                'total_amount' => $soldPrice,
                'deposit_amount' => $depositAmount,
                'status' => 'pending',
                'payment_proof' => $paymentProof,
                'notes' => $validated['message'] ?? null,
            ]);

            // 10. Create deposit payment.
            // It remains pending until an administrator confirms receipt.
            Payment::create([
                'reservation_id' => $reservation->id,
                'payment_type' => 'deposit',
                'installment_number' => null,
                'provider' => 'bank_transfer',
                'transaction_id' => null,
                'amount' => $depositAmount,
                'currency' => 'EUR',
                'status' => 'pending',
                'payment_proof' => $paymentProof,
                'paid_at' => null,
            ]);

            // 11. Create the remaining payment(s).
            // The final installment absorbs any rounding difference.
            for ($i = 1; $i <= $paymentInstallments; $i++) {
                $amount = $i === $paymentInstallments
                    ? round(
                        $remainingAfterDeposit -
                        ($standardInstallment * ($paymentInstallments - 1)),
                        2
                    )
                    : $standardInstallment;

                Payment::create([
                    'reservation_id' => $reservation->id,
                    'payment_type' => 'installment',
                    'installment_number' => $i,
                    'provider' => 'bank_transfer',
                    'transaction_id' => null,
                    'amount' => $amount,
                    'currency' => 'EUR',
                    'status' => 'pending',
                    'payment_proof' => null,
                    'paid_at' => null,
                ]);
            }

            // 12. Reserve one place
            $formationDay->decrement('remaining_places');

            return $reservation;
        });
    } catch (\Throwable $e) {
        // Do not silently swallow unexpected errors.
        throw $e;
    }

    // 13. Load reservation relations
    $reservation->load([
        'formation',
        'formation.programme',
        'formationDay',
        'customer',
        'payments',
    ]);

    // 14. Send admin notification
    $this->sendAdminNotification($reservation);

    // 15. Bank details
    $settings = SiteSetting::first();

    $basePrice = $reservation->pricing_type === 'cpf'
        ? (float) ($reservation->formationDay?->cpf_price ?? 0)
        : (float) ($reservation->formationDay?->price ?? 0);

    $remainingAfterDeposit = max(
        0,
        round(
            (float) $reservation->total_amount
            - (float) $reservation->deposit_amount,
            2
        )
    );

    // This is the planned balance after the deposit,
    // not the balance calculated from confirmed payments.
    $installmentAmount = round(
        $remainingAfterDeposit / $reservation->payment_installments,
        2
    );

    return response()->json([
        'success' => true,
        'message' => 'Votre réservation a été envoyée avec succès.',

        'reservation' => [
            'id' => $reservation->id,
            'reference' => $reservation->reference,
            'status' => $reservation->status,

            'pricing_type' => $reservation->pricing_type,
            'base_price' => $basePrice,
            'sold_price' => (float) $reservation->sold_price,
            'total_amount' => (float) $reservation->total_amount,

            'payment_installments' => (int) $reservation->payment_installments,
            'deposit_amount' => (float) $reservation->deposit_amount,

            'remaining_after_deposit' => $remainingAfterDeposit,
            'installment_amount' => $installmentAmount,

            // Pending payments are not counted as money received.
            'paid_amount' => $reservation->paid_amount,
            'outstanding_balance' => $reservation->remaining_amount,

            'payments' => $reservation->payments->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_type' => $payment->payment_type,
                'installment_number' => $payment->installment_number,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'due_date' => $payment->due_date?->format('Y-m-d'),
            ])->values(),

            'formation' => [
                'id' => $reservation->formation->id,
                'title' => $reservation->formation->title,
                'programme' => $reservation->formation->programme?->name,
            ],

            'session' => [
                'id' => $reservation->formationDay->id,
                'city' => $reservation->formationDay->city,
                'start_date' => $reservation->formationDay->start_date,
                'end_date' => $reservation->formationDay->end_date,
                'normal_price' => $reservation->formationDay->price,
                'cpf_price' => $reservation->formationDay->cpf_price,
            ],

            'customer' => [
                'first_name' => $reservation->customer->first_name,
                'last_name' => $reservation->customer->last_name,
                'email' => $reservation->customer->email,
                'phone' => $reservation->customer->phone,
            ],

            'payment_proof' => $paymentProof,
            'payment_proof_url' => $paymentProof
                ? asset($paymentProof)
                : null,
        ],

        'bank_information' => [
            'iban' => $settings?->iban,
            'bic' => $settings?->bic,
            'account_holder_address' => $settings?->account_holder_address,
        ],
    ], 201);
}


public function store1(Request $request)
{
    return response()->json([
        'reached_controller' => true,
        'method' => $request->method(),
        'path' => $request->path(),
        'data' => $request->except([
            'payment_proof',
            'password',
            '_token',
        ]),
    ]);
}

    /**
     * Send reservation notification to admin.
     */
    

    private function sendAdminNotification(
    Reservation $reservation
): void {
    $adminEmail = config('mail.admin_email');

    if (!$adminEmail) {
        return;
    }

    Mail::send(
        'emails.reservation-admin',
        ['reservation' => $reservation],
        function ($message) use ($adminEmail, $reservation) {
            $message->to($adminEmail)
                ->subject(
                    'Nouvelle réservation - '
                    . $reservation->reference
                );
        }
    );
}

}