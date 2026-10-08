<div class="space-y-6">

    {{-- HEADER --}}
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
            <div class="text-sm font-medium text-gray-500">
                RÉSERVATION
            </div>

            <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                {{ $record->reference }}
            </h1>

            <div class="mt-2 text-sm text-gray-500">
                Créée le
                {{ $record->created_at?->format('d/m/Y à H:i') }}
            </div>
        </div>

        <div>
            @php
                $status = $record->status;

                $statusLabel = match ($status) {
                    'pending' => 'En attente',
                    'pending_payment' => 'Paiement en attente',
                    'confirmed' => 'Confirmée',
                    'cancelled' => 'Annulée',
                    'completed' => 'Terminée',
                    default => $status,
                };
            @endphp

            <span
                class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium
                {{ $status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : ($status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700') }}"
            >
                {{ $statusLabel }}
            </span>
        </div>

    </div>


    {{-- INVOICE --}}
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {{-- INVOICE HEADER --}}
        <div class="border-b border-gray-200 px-6 py-6 sm:px-8">

            <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                <div>
                    <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Formation
                    </div>

                    <h2 class="mt-2 text-xl font-semibold text-gray-950">
                        {{ $record->formation?->title ?? 'Formation' }}
                    </h2>
                </div>

                <div class="text-left sm:text-right">

                    <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Référence
                    </div>

                    <div class="mt-2 font-semibold text-gray-950">
                        {{ $record->reference }}
                    </div>

                </div>

            </div>

        </div>


        {{-- CUSTOMER + SESSION --}}
        <div class="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">

            {{-- CLIENT --}}
            <div class="p-6 sm:p-8">

                <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Cliente
                </div>

                <div class="mt-4 space-y-1">

                    <div class="text-lg font-semibold text-gray-950">
                        {{ $record->customer?->first_name }}
                        {{ $record->customer?->last_name }}
                    </div>

                    <div class="text-sm text-gray-600">
                        {{ $record->customer?->email }}
                    </div>

                    <div class="text-sm text-gray-600">
                        {{ $record->customer?->phone }}
                    </div>

                    @if($record->customer?->address)
                        <div class="pt-2 text-sm text-gray-600">
                            {{ $record->customer->address }}
                        </div>
                    @endif

                    @if($record->customer?->postal_code || $record->customer?->city)
                        <div class="text-sm text-gray-600">
                            {{ $record->customer?->postal_code }}
                            {{ $record->customer?->city }}
                        </div>
                    @endif

                </div>

            </div>


            {{-- SESSION --}}
            <div class="p-6 sm:p-8">

                <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Session sélectionnée
                </div>

                @php
                    $day = $record->formationDay;
                @endphp

                <div class="mt-4 space-y-2">

                    <div class="text-lg font-semibold text-gray-950">
                        {{ $day?->city ?? '—' }}
                    </div>

                    @if($day)
                        <div class="text-sm text-gray-600">

                            {{ \Carbon\Carbon::parse($day->start_date)->format('d/m/Y') }}

                            @if($day->end_date)
                                →
                                {{ \Carbon\Carbon::parse($day->end_date)->format('d/m/Y') }}
                            @endif

                        </div>
                    @endif

                    <div class="pt-2 text-sm text-gray-500">
                        Session #{{ $day?->id }}
                    </div>

                </div>

            </div>

        </div>


        {{-- FORMATION DETAILS --}}
        <div class="border-t border-gray-200 px-6 py-6 sm:px-8">

            <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Détails de la formation
            </div>

            <div class="mt-5 overflow-hidden rounded-lg border border-gray-200">

                <div class="grid grid-cols-1 sm:grid-cols-2">

                    <div class="border-b border-gray-200 px-5 py-4 sm:border-r">
                        <div class="text-xs text-gray-400">
                            Formation
                        </div>

                        <div class="mt-1 font-medium text-gray-900">
                            {{ $record->formation?->title ?? '—' }}
                        </div>
                    </div>


                    <div class="border-b border-gray-200 px-5 py-4">
                        <div class="text-xs text-gray-400">
                            Programme
                        </div>

                        <div class="mt-1 font-medium text-gray-900">
                            {{ $record->formation?->programme?->name ?? '—' }}
                        </div>
                    </div>


                    <div class="border-b border-gray-200 px-5 py-4 sm:border-r">
                        <div class="text-xs text-gray-400">
                            Ville
                        </div>

                        <div class="mt-1 font-medium text-gray-900">
                            {{ $day?->city ?? '—' }}
                        </div>
                    </div>


                    <div class="border-b border-gray-200 px-5 py-4">
                        <div class="text-xs text-gray-400">
                            Places restantes
                        </div>

                        <div class="mt-1 font-medium text-gray-900">
                            {{ $day?->remaining_places ?? '—' }}
                        </div>
                    </div>

                </div>

            </div>

        </div>


        {{-- PRICING --}}
        <div class="border-t border-gray-200 px-6 py-6 sm:px-8">

            <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Facturation
            </div>

            @php
                $formationPrice = $day?->personal_price ?? 0;
                $deposit = $record->deposit_amount ?? 0;
                $remaining = max(0, $formationPrice - $deposit);
            @endphp

            <div class="mt-5 space-y-4">

                {{-- FORMATION PRICE --}}
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">

                    <span class="text-sm text-gray-600">
                        Prix de la formation
                    </span>

                    <span class="font-medium text-gray-900">
                        {{ number_format($formationPrice, 2, ',', ' ') }} €
                    </span>

                </div>


                {{-- DEPOSIT --}}
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">

                    <span class="text-sm text-gray-600">
                        Acompte
                    </span>

                    <span class="font-medium text-gray-900">
                        {{ number_format($deposit, 2, ',', ' ') }} €
                    </span>

                </div>


                {{-- REMAINING --}}
                <div class="flex items-center justify-between">

                    <span class="font-semibold text-gray-950">
                        Reste à payer
                    </span>

                    <span class="text-xl font-semibold text-gray-950">
                        {{ number_format($remaining, 2, ',', ' ') }} €
                    </span>

                </div>

            </div>

        </div>


        {{-- PAYMENT PROOF --}}
        @if($record->payment?->payment_proof)

            <div class="border-t border-gray-200 px-6 py-6 sm:px-8">

                <div class="flex items-center justify-between">

                    <div>

                        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Paiement
                        </div>

                        <div class="mt-2 font-medium text-gray-900">
                            Preuve de paiement
                        </div>

                    </div>

                    <a
                        href="{{ asset('storage/' . $record->payment->payment_proof) }}"
                        target="_blank"
                        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Voir la preuve
                    </a>

                </div>

            </div>

        @endif


        {{-- NOTES --}}
        @if($record->notes)

            <div class="border-t border-gray-200 px-6 py-6 sm:px-8">

                <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Message
                </div>

                <div class="mt-3 text-sm leading-6 text-gray-600">
                    {{ $record->notes }}
                </div>

            </div>

        @endif


        {{-- TOTAL --}}
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-8">

            <div class="flex items-center justify-between">

                <div>
                    <div class="text-xs uppercase tracking-widest text-gray-400">
                        Total formation
                    </div>

                    <div class="mt-1 text-sm text-gray-500">
                        Session {{ $day?->city }}
                    </div>
                </div>

                <div class="text-2xl font-semibold text-gray-950">

                    {{ number_format($formationPrice, 2, ',', ' ') }} €

                </div>

            </div>

        </div>

    </div>

</div>