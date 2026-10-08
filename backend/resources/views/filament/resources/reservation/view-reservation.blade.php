@php

    $reservation = $record;

    $formation = $reservation->formation;
    $programme = $formation?->programme;
    $day = $reservation->formationDay;
    $customer = $reservation->customer;
    $payment = $reservation->payment;

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    /*
     * Prix officiel de la session selon le type de tarif.
     *
     * normal => formation_days.price
     * cpf    => formation_days.cpf_price
     */
    $basePrice = $reservation->pricing_type === 'cpf'
        ? (float) ($day?->cpf_price ?? 0)
        : (float) ($day?->price ?? 0);

    /*
     * Prix réellement vendu pour cette réservation.
     *
     * Le prix peut être modifié plus tard par l'administration
     * sans modifier le prix officiel de la session.
     */
    $soldPrice = (float) (
        $reservation->sold_price
        ?? $basePrice
    );

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    $deposit = (float) (
        $reservation->deposit_amount
        ?? 0
    );

    /*
     * Reste à payer.
     */
    $remaining = max(
        0,
        $soldPrice - $deposit
    );

    /*
     * Remise éventuelle.
     */
    $discount = max(
        0,
        $basePrice - $soldPrice
    );

    /*
     * Type de tarif.
     */
    $pricingLabel = match ($reservation->pricing_type) {

        'cpf' => 'Tarif CPF',

        'normal' => 'Tarif normal',

        default => ucfirst(
            $reservation->pricing_type ?? 'normal'
        ),
    };

    /*
     * Nombre de paiements.
     */
    $paymentInstallments = (int) (
        $reservation->payment_installments ?? 1
    );

    /*
     * Libellé du plan de paiement.
     */
    $paymentPlanLabel = $paymentInstallments === 2
        ? '2 paiements'
        : 'Paiement en 1 fois';

    /*
     |--------------------------------------------------------------------------
     | STATUS
     |--------------------------------------------------------------------------
     */

    $statusLabel = match ($reservation->status) {

        'pending' =>
            'En attente',

        'pending_payment' =>
            'Paiement en attente',

        'confirmed' =>
            'Confirmée',

        'cancelled' =>
            'Annulée',

        'completed' =>
            'Terminée',

        default =>
            ucfirst(
                str_replace(
                    '_',
                    ' ',
                    $reservation->status
                )
            ),
    };

    $statusClass = match ($reservation->status) {

        'confirmed',
        'completed' =>
            'status-success',

        'cancelled' =>
            'status-danger',

        'pending_payment' =>
            'status-warning',

        default =>
            'status-pending',
    };

    /*
     |--------------------------------------------------------------------------
     | SESSION DATE
     |--------------------------------------------------------------------------
     */

    $sessionDate = 'Date à confirmer';

    if ($day) {

        $start = $day->start_date
            ? \Carbon\Carbon::parse(
                $day->start_date
            )
                ->locale('fr')
                ->translatedFormat('d F Y')
            : null;

        $end = $day->end_date
            ? \Carbon\Carbon::parse(
                $day->end_date
            )
                ->locale('fr')
                ->translatedFormat('d F Y')
            : null;

        if ($start && $end) {

            $sessionDate =
                $start . ' → ' . $end;

        } elseif ($start) {

            $sessionDate = $start;
        }
    }

    /*
     |--------------------------------------------------------------------------
     | PAYMENT PROOF
     |--------------------------------------------------------------------------
     |
     | Files are stored directly inside:
     |
     | public/payments/proofs/
     |
     */

    $paymentProofUrl = null;

    if ($payment?->payment_proof) {

        $paymentProofUrl = asset(
            $payment->payment_proof
        );
    }

@endphp


<style>
    * {
        box-sizing: border-box;
    }

    .as-reservation-page {
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 0 40px;
        color: #171717;

        font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
    }

    .as-invoice {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        overflow: hidden;

        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.05);
    }

    /* =====================================================
       TOP
    ===================================================== */

    .as-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        gap: 32px;

        padding: 34px 38px 30px;

        border-bottom: 1px solid #e5e7eb;
    }

    .as-brand {
        font-size: 12px;
        font-weight: 700;

        letter-spacing: 0.28em;
        text-transform: uppercase;

        color: #111111;
    }

    .as-document-title {
        margin-top: 12px;

        font-size: 28px;
        font-weight: 600;

        letter-spacing: -0.03em;

        color: #111111;
    }

    .as-document-subtitle {
        margin-top: 7px;

        font-size: 13px;

        color: #6b7280;
    }

    .as-reference-block {
        text-align: right;
    }

    .as-reference-label {
        font-size: 10px;
        font-weight: 700;

        text-transform: uppercase;
        letter-spacing: 0.17em;

        color: #9ca3af;
    }

    .as-reference {
        margin-top: 7px;

        font-size: 17px;
        font-weight: 600;

        color: #111111;
    }

    .as-created {
        margin-top: 6px;

        font-size: 12px;

        color: #6b7280;
    }

    .as-status {
        display: inline-flex;

        align-items: center;
        justify-content: center;

        margin-top: 12px;

        padding: 7px 12px;

        border-radius: 999px;

        font-size: 11px;
        font-weight: 700;
    }

    .status-pending {
        background: #fff7ed;
        color: #b45309;
    }

    .status-warning {
        background: #fef3c7;
        color: #92400e;
    }

    .status-success {
        background: #ecfdf5;
        color: #047857;
    }

    .status-danger {
        background: #fef2f2;
        color: #b91c1c;
    }

    /* =====================================================
       SECTIONS
    ===================================================== */

    .as-section {
        padding: 30px 38px;

        border-bottom: 1px solid #e5e7eb;
    }

    .as-section-title {
        margin-bottom: 18px;

        font-size: 10px;
        font-weight: 700;

        text-transform: uppercase;
        letter-spacing: 0.18em;

        color: #9ca3af;
    }

    /* =====================================================
       CLIENT + SESSION
    ===================================================== */

    .as-grid-two {
        display: grid;

        grid-template-columns: 1fr 1fr;

        gap: 26px;
    }

    .as-info-card {
        border: 1px solid #e5e7eb;
        border-radius: 10px;

        padding: 20px;

        background: #ffffff;
    }

    .as-card-label {
        font-size: 10px;
        font-weight: 700;

        text-transform: uppercase;
        letter-spacing: 0.15em;

        color: #9ca3af;
    }

    .as-main-value {
        margin-top: 10px;

        font-size: 17px;
        font-weight: 600;

        color: #111111;
    }

    .as-small-value {
        margin-top: 5px;

        font-size: 13px;
        line-height: 1.6;

        color: #6b7280;
    }

    .as-session-city {
        margin-top: 9px;

        font-size: 22px;
        font-weight: 600;

        letter-spacing: -0.02em;
    }

    .as-session-date {
        margin-top: 7px;

        font-size: 13px;

        color: #4b5563;
    }

    .as-session-id {
        margin-top: 11px;

        font-size: 11px;

        color: #9ca3af;
    }

    /* =====================================================
       FORMATION
    ===================================================== */

    .as-formation-grid {
        display: grid;

        grid-template-columns: 1.5fr 1fr 0.7fr;

        border: 1px solid #e5e7eb;
        border-radius: 10px;

        overflow: hidden;
    }

    .as-formation-item {
        padding: 20px;

        border-right: 1px solid #e5e7eb;
    }

    .as-formation-item:last-child {
        border-right: none;
    }

    .as-value {
        margin-top: 8px;

        font-size: 14px;
        font-weight: 500;

        color: #111111;
    }

    /* =====================================================
       PRICING
    ===================================================== */

    .as-price-table {
        width: 100%;

        border-collapse: collapse;
    }

    .as-price-table tr {
        border-bottom: 1px solid #f0f0f0;
    }

    .as-price-table tr:last-child {
        border-bottom: none;
    }

    .as-price-table td {
        padding: 15px 0;

        font-size: 14px;
    }

    .as-price-label {
        color: #6b7280;
    }

    .as-price-value {
        text-align: right;

        font-weight: 500;

        color: #111111;

        white-space: nowrap;
    }

    .as-discount {
        color: #047857;
        font-weight: 600;
    }

    .as-total {
        display: flex;

        align-items: center;
        justify-content: space-between;

        gap: 20px;

        margin-top: 18px;
        padding-top: 20px;

        border-top: 1px solid #111111;
    }

    .as-total-label {
        font-size: 15px;
        font-weight: 600;
    }

    .as-total-value {
        font-size: 25px;
        font-weight: 700;

        letter-spacing: -0.03em;
    }

    .as-remaining {
        display: flex;

        align-items: center;
        justify-content: space-between;

        margin-top: 8px;

        font-size: 13px;

        color: #6b7280;
    }

    .as-remaining strong {
        font-weight: 600;

        color: #111111;
    }

    /* =====================================================
       PAYMENT
    ===================================================== */

    .as-payment {
        display: grid;

        grid-template-columns: 150px 1fr;

        gap: 22px;

        align-items: center;
    }

    .as-proof-image {
        width: 150px;
        height: 105px;

        object-fit: cover;

        border: 1px solid #e5e7eb;
        border-radius: 8px;

        background: #f9fafb;
    }

    .as-proof-placeholder {
        width: 150px;
        height: 105px;

        display: flex;

        align-items: center;
        justify-content: center;

        border: 1px dashed #d1d5db;
        border-radius: 8px;

        background: #fafafa;

        color: #9ca3af;

        font-size: 12px;

        text-align: center;
    }

    .as-proof-name {
        font-size: 14px;
        font-weight: 600;

        color: #111111;
    }

    .as-proof-description {
        margin-top: 6px;

        font-size: 13px;

        color: #6b7280;
    }

    .as-proof-button {
        display: inline-flex;

        align-items: center;

        margin-top: 13px;
        padding: 9px 15px;

        border: 1px solid #d1d5db;
        border-radius: 7px;

        color: #374151;

        text-decoration: none;

        font-size: 12px;
        font-weight: 600;

        transition: 0.2s ease;
    }

    .as-proof-button:hover {
        background: #111111;

        border-color: #111111;

        color: #ffffff;
    }

    .as-payment-details {
        margin-top: 15px;
        padding-top: 15px;

        border-top: 1px solid #f0f0f0;
    }

    .as-payment-detail-row {
        display: flex;

        align-items: center;
        justify-content: space-between;

        gap: 20px;

        padding: 5px 0;

        font-size: 13px;
    }

    .as-payment-detail-row span:first-child {
        color: #6b7280;
    }

    .as-payment-detail-row strong {
        color: #111111;
    }

    /* =====================================================
       NOTES
    ===================================================== */

    .as-note {
        padding: 17px 19px;

        border: 1px solid #e5e7eb;
        border-radius: 9px;

        background: #fafafa;

        font-size: 13px;
        line-height: 1.7;

        color: #4b5563;
    }

    /* =====================================================
       FOOTER
    ===================================================== */

    .as-footer {
        display: flex;

        align-items: center;
        justify-content: space-between;

        gap: 20px;

        padding: 24px 38px;

        background: #fafafa;
    }

    .as-footer-brand {
        font-size: 11px;
        font-weight: 700;

        text-transform: uppercase;
        letter-spacing: 0.2em;

        color: #111111;
    }

    .as-footer-text {
        margin-top: 5px;

        font-size: 12px;

        color: #6b7280;
    }

    .as-footer-right {
        text-align: right;
    }

    /* =====================================================
       RESPONSIVE
    ===================================================== */

    @media (max-width: 900px) {

        .as-top {
            padding: 28px 24px;
        }

        .as-section {
            padding: 26px 24px;
        }

        .as-footer {
            padding: 22px 24px;
        }

        .as-formation-grid {
            grid-template-columns: 1fr 1fr;
        }

        .as-formation-item:nth-child(2) {
            border-right: none;
        }

        .as-formation-item:last-child {
            grid-column: 1 / -1;

            border-top: 1px solid #e5e7eb;
            border-right: none;
        }
    }

    @media (max-width: 640px) {

        .as-reservation-page {
            padding: 0;
        }

        .as-invoice {
            border-radius: 0;

            border-left: none;
            border-right: none;
        }

        .as-top {
            flex-direction: column;
            gap: 20px;
        }

        .as-reference-block {
            text-align: left;
        }

        .as-grid-two {
            grid-template-columns: 1fr;
        }

        .as-formation-grid {
            grid-template-columns: 1fr;
        }

        .as-formation-item {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
        }

        .as-formation-item:last-child {
            border-bottom: none;
        }

        .as-payment {
            grid-template-columns: 1fr;
        }

        .as-proof-image,
        .as-proof-placeholder {
            width: 100%;
            height: 190px;
        }

        .as-footer {
            flex-direction: column;
            align-items: flex-start;
        }

        .as-footer-right {
            text-align: left;
        }

        .as-total-value {
            font-size: 21px;
        }
    }
</style>


<div class="as-reservation-page">

    <div class="as-invoice">

        {{-- ==================================================
             HEADER
        ================================================== --}}

        <div class="as-top">

            <div>

                <div class="as-brand">
                    AS Academy
                </div>

                <div class="as-document-title">
                    Réservation
                </div>

                <div class="as-document-subtitle">
                    Récapitulatif de réservation
                </div>

            </div>


            <div class="as-reference-block">

                <div class="as-reference-label">
                    Référence
                </div>

                <div class="as-reference">
                    {{ $reservation->reference }}
                </div>

                <div class="as-created">
                    Créée le
                    {{ $reservation->created_at?->format('d/m/Y à H:i') }}
                </div>

                <div>
                    <span class="as-status {{ $statusClass }}">
                        {{ $statusLabel }}
                    </span>
                </div>

            </div>

        </div>


        {{-- ==================================================
             CLIENT + SESSION
        ================================================== --}}

        <div class="as-section">

            <div class="as-section-title">
                Informations
            </div>

            <div class="as-grid-two">

                {{-- CLIENT --}}

                <div class="as-info-card">

                    <div class="as-card-label">
                        Cliente
                    </div>

                    <div class="as-main-value">
                        {{ $customer?->first_name }}
                        {{ $customer?->last_name }}
                    </div>

                    @if($customer?->email)

                        <div class="as-small-value">
                            {{ $customer->email }}
                        </div>

                    @endif

                    @if($customer?->phone)

                        <div class="as-small-value">
                            {{ $customer->phone }}
                        </div>

                    @endif

                    @if($customer?->address)

                        <div class="as-small-value">
                            {{ $customer->address }}
                        </div>

                    @endif

                    @if($customer?->postal_code || $customer?->city)

                        <div class="as-small-value">
                            {{ $customer->postal_code }}
                            {{ $customer->city }}
                        </div>

                    @endif

                </div>


                {{-- SESSION --}}

                <div class="as-info-card">

                    <div class="as-card-label">
                        Session sélectionnée
                    </div>

                    <div class="as-session-city">
                        {{ $day?->city ?? '—' }}
                    </div>

                    <div class="as-session-date">
                        {{ $sessionDate }}
                    </div>

                    @if($day)

                        <div class="as-session-id">
                            Session #{{ $day->id }}
                        </div>

                    @endif

                </div>

            </div>

        </div>


        {{-- ==================================================
             FORMATION
        ================================================== --}}

        <div class="as-section">

            <div class="as-section-title">
                Formation
            </div>

            <div class="as-formation-grid">

                <div class="as-formation-item">

                    <div class="as-card-label">
                        Formation
                    </div>

                    <div class="as-value">
                        {{ $formation?->title ?? '—' }}
                    </div>

                </div>


                <div class="as-formation-item">

                    <div class="as-card-label">
                        Programme
                    </div>

                    <div class="as-value">
                        {{ $programme?->name ?? '—' }}
                    </div>

                </div>


                <div class="as-formation-item">

                    <div class="as-card-label">
                        Durée
                    </div>

                    <div class="as-value">
                        {{ $programme?->duration ?? '—' }}
                    </div>

                </div>

            </div>

        </div>


        {{-- ==================================================
             FACTURATION
        ================================================== --}}

        <div class="as-section">

            <div class="as-section-title">
                Facturation
            </div>

            <table class="as-price-table">

                <tbody>

                    {{-- PRIX OFFICIEL --}}

                    <tr>

                        <td class="as-price-label">
                            Prix officiel de la formation
                        </td>

                        <td class="as-price-value">
                            {{ number_format($basePrice, 2, ',', ' ') }} €
                        </td>

                    </tr>


                    {{-- TYPE DE TARIF --}}

                    <tr>

                        <td class="as-price-label">
                            Type de tarif
                        </td>

                        <td class="as-price-value">
                            {{ $pricingLabel }}
                        </td>

                    </tr>


                    {{-- PRIX VENDU --}}

                    <tr>

                        <td class="as-price-label">
                            Prix vendu
                        </td>

                        <td class="as-price-value">
                            {{ number_format($soldPrice, 2, ',', ' ') }} €
                        </td>

                    </tr>


                    {{-- REMISE --}}

                    @if($discount > 0)

                        <tr>

                            <td class="as-price-label">
                                Remise
                            </td>

                            <td class="as-price-value as-discount">
                                -{{ number_format($discount, 2, ',', ' ') }} €
                            </td>

                        </tr>

                    @endif


                    {{-- PLAN DE PAIEMENT --}}

                    <tr>

                        <td class="as-price-label">
                            Plan de paiement
                        </td>

                        <td class="as-price-value">
                            {{ $paymentPlanLabel }}
                        </td>

                    </tr>


                    {{-- ACOMPTE --}}

                    <tr>

                        <td class="as-price-label">
                            Acompte
                        </td>

                        <td class="as-price-value">
                            {{ number_format($deposit, 2, ',', ' ') }} €
                        </td>

                    </tr>

                </tbody>

            </table>


            {{-- TOTAL --}}

            <div class="as-total">

                <div class="as-total-label">
                    Total formation
                </div>

                <div class="as-total-value">
                    {{ number_format($soldPrice, 2, ',', ' ') }} €
                </div>

            </div>


            {{-- RESTE --}}

            <div class="as-remaining">

                <span>
                    Reste à payer
                </span>

                <strong>
                    {{ number_format($remaining, 2, ',', ' ') }} €
                </strong>

            </div>

        </div>


        {{-- ==================================================
             PAIEMENT
        ================================================== --}}

        <div class="as-section">

            <div class="as-section-title">
                Paiement
            </div>

            <div class="as-payment">

                @if($paymentProofUrl)

                    <a
                        href="{{ $paymentProofUrl }}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <img
                            src="{{ $paymentProofUrl }}"
                            alt="Preuve de paiement"
                            class="as-proof-image"
                        >

                    </a>


                    <div>

                        <div class="as-proof-name">
                            Preuve de paiement reçue
                        </div>

                        <div class="as-proof-description">
                            La cliente a transmis une preuve de paiement.
                        </div>

                        <a
                            href="{{ $paymentProofUrl }}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="as-proof-button"
                        >
                            Voir la preuve en grand
                        </a>

                    </div>

                @else

                    <div class="as-proof-placeholder">
                        Aucune preuve<br>
                        de paiement
                    </div>

                    <div>

                        <div class="as-proof-name">
                            Aucune preuve de paiement
                        </div>

                        <div class="as-proof-description">
                            Aucun document n'a encore été transmis.
                        </div>

                    </div>

                @endif

            </div>


            {{-- DETAILS DU PAIEMENT --}}

            @if($payment)

                <div class="as-payment-details">

                    <div class="as-payment-detail-row">

                        <span>
                            Montant du premier paiement
                        </span>

                        <strong>
                            {{ number_format((float) $payment->amount, 2, ',', ' ') }} €
                        </strong>

                    </div>


                    <div class="as-payment-detail-row">

                        <span>
                            Statut du paiement
                        </span>

                        <strong>
                            @switch($payment->status)

                                @case('paid')
                                    Payé
                                    @break

                                @case('pending')
                                    En attente
                                    @break

                                @case('failed')
                                    Échec
                                    @break

                                @case('cancelled')
                                    Annulé
                                    @break

                                @default
                                    {{ ucfirst($payment->status ?? '—') }}

                            @endswitch
                        </strong>

                    </div>


                    @if($payment->paid_at)

                        <div class="as-payment-detail-row">

                            <span>
                                Payé le
                            </span>

                            <strong>
                                {{ \Carbon\Carbon::parse($payment->paid_at)->format('d/m/Y à H:i') }}
                            </strong>

                        </div>

                    @endif

                </div>

            @endif

        </div>


        {{-- ==================================================
             MESSAGE
        ================================================== --}}

        @if($reservation->notes)

            <div class="as-section">

                <div class="as-section-title">
                    Message de la cliente
                </div>

                <div class="as-note">
                    {{ $reservation->notes }}
                </div>

            </div>

        @endif


        {{-- ==================================================
             FOOTER
        ================================================== --}}

        <div class="as-footer">

            <div>

                <div class="as-footer-brand">
                    AS Academy
                </div>

                <div class="as-footer-text">
                    Formation professionnelle
                </div>

            </div>


            <div class="as-footer-right">

                <div class="as-footer-brand">
                    Réservation
                </div>

                <div class="as-footer-text">
                    {{ $reservation->reference }}
                </div>

            </div>

        </div>

    </div>

</div>