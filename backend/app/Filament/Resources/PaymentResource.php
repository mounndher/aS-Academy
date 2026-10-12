<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use App\Models\Reservation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationGroup = 'Formations';
    protected static ?int $navigationSort = 2;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationLabel = 'Paiements';
    protected static ?string $modelLabel = 'Paiement';
    protected static ?string $pluralModelLabel = 'Paiements';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informations du paiement')
                ->schema([
                    Forms\Components\Select::make('reservation_id')
                        ->label('Réservation / Client')
                        ->relationship(name: 'reservation', titleAttribute: 'reference')
                        ->getOptionLabelFromRecordUsing(
                            fn (Reservation $record): string =>
                                $record->reference . ' — ' .
                                trim(
                                    ($record->customer?->first_name ?? '') . ' ' .
                                    ($record->customer?->last_name ?? '')
                                )
                        )
                        ->searchable()
                        ->preload()
                        ->required()
                        ->live(),

                    Forms\Components\Placeholder::make('total_amount_display')
                        ->label('Prix final de la formation')
                        ->content(function (Forms\Get $get): string {
                            $reservation = Reservation::find($get('reservation_id'));

                            if (! $reservation) {
                                return 'Sélectionnez une réservation';
                            }

                            $total = (float) ($reservation->sold_price ?? $reservation->total_amount);

                            return number_format($total, 2, ',', ' ') . ' €';
                        }),

                    Forms\Components\Placeholder::make('paid_amount_display')
                        ->label('Total des paiements confirmés')
                        ->content(function (Forms\Get $get): string {
                            $reservation = Reservation::find($get('reservation_id'));

                            if (! $reservation) {
                                return '—';
                            }

                            $paid = $reservation->payments()
                                ->where('status', 'completed')
                                ->sum('amount');

                            return number_format((float) $paid, 2, ',', ' ') . ' €';
                        }),

                    Forms\Components\Select::make('payment_type')
                        ->label('Type de paiement')
                        ->options([
                            'deposit' => 'Acompte',
                            'installment' => 'Échéance',
                        ])
                        ->default('installment')
                        ->required(),

                    Forms\Components\TextInput::make('installment_number')
                        ->label('Numéro de l’échéance')
                        ->numeric()
                        ->integer()
                        ->minValue(1)
                        ->nullable()
                        ->helperText('Laissez vide pour l’acompte initial.'),

                    Forms\Components\DatePicker::make('due_date')
                        ->label('Date d’échéance')
                        ->native(false)
                        ->nullable(),

                    Forms\Components\TextInput::make('amount')
                        ->label('Montant de ce paiement')
                        ->numeric()
                        ->prefix('€')
                        ->required()
                        ->minValue(0.01)
                        ->step('0.01')
                        ->rules(['decimal:0,2']),

                    Forms\Components\Select::make('provider')
                        ->label('Mode de paiement')
                        ->options([
                            'paypal' => 'PayPal',
                            'bank_transfer' => 'Virement bancaire',
                            'card' => 'Carte bancaire',
                            'cash' => 'Espèces',
                            'other' => 'Autre',
                        ])
                        ->required()
                        ->default('bank_transfer'),

                    Forms\Components\TextInput::make('transaction_id')
                        ->label('Référence / ID de transaction')
                        ->maxLength(255)
                        ->nullable(),

                    Forms\Components\Select::make('currency')
                        ->label('Devise')
                        ->options(['EUR' => 'EUR (€)'])
                        ->required()
                        ->default('EUR'),

                    // A payment must be confirmed only with the dedicated action below.
                    // This form intentionally does not allow setting status to completed.
                    Forms\Components\Select::make('status')
                        ->label('Statut du paiement')
                        ->options([
                            'pending' => 'En attente de vérification',
                            'failed' => 'Échoué',
                            'refunded' => 'Remboursé',
                        ])
                        ->required()
                        ->default('pending')
                        ->helperText('Pour confirmer un virement reçu, utilisez « Confirmer le paiement » dans la liste.'),

                    Forms\Components\TextInput::make('payment_proof')
                        ->label('Chemin du justificatif de paiement')
                        ->maxLength(255)
                        ->nullable(),

                    Forms\Components\DateTimePicker::make('paid_at')
                        ->label('Date du paiement')
                        ->native(false)
                        ->seconds(false)
                        ->visible(fn (Forms\Get $get): bool => $get('status') === 'completed')
                        ->dehydrated(false),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reservation.reference')
                    ->label('Réservation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('reservation.customer.first_name')
                    ->label('Prénom')
                    ->placeholder('—')
                    ->searchable(),

                Tables\Columns\TextColumn::make('reservation.customer.last_name')
                    ->label('Nom')
                    ->placeholder('—')
                    ->searchable(),

                Tables\Columns\TextColumn::make('payment_type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'deposit' => 'Acompte',
                        'installment' => 'Échéance',
                        default => $state ?? '—',
                    }),

                Tables\Columns\TextColumn::make('installment_number')
                    ->label('Échéance n°')
                    ->placeholder('—')
                    ->sortable(),

                Tables\Columns\TextColumn::make('due_date')
                    ->label('Échéance le')
                    ->date('d/m/Y')
                    ->placeholder('—')
                    ->sortable(),

                Tables\Columns\TextColumn::make('provider')
                    ->label('Mode de paiement')
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'paypal' => 'PayPal',
                        'bank_transfer' => 'Virement bancaire',
                        'card' => 'Carte bancaire',
                        'cash' => 'Espèces',
                        'other' => 'Autre',
                        default => $state ?? '—',
                    })
                    ->badge(),

                Tables\Columns\TextColumn::make('transaction_id')
                    ->label('Référence')
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Montant')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('reservation.sold_price')
                    ->label('Prix final')
                    ->state(fn (Payment $record) =>
                        $record->reservation?->sold_price
                        ?? $record->reservation?->total_amount
                    )
                    ->money('EUR')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('reservation.paid_amount')
                    ->label('Total confirmé')
                    ->money('EUR')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('reservation.remaining_amount')
                    ->label('Reste à payer')
                    ->money('EUR')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'completed' => 'Payé / confirmé',
                        'failed' => 'Échoué',
                        'refunded' => 'Remboursé',
                        default => $state ?? '—',
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'completed' => 'success',
                        'pending' => 'warning',
                        'failed' => 'danger',
                        'refunded' => 'gray',
                        default => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Payé le')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Non payé')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'completed' => 'Payé / confirmé',
                        'failed' => 'Échoué',
                        'refunded' => 'Remboursé',
                    ]),

                Tables\Filters\SelectFilter::make('provider')
                    ->label('Mode de paiement')
                    ->options([
                        'paypal' => 'PayPal',
                        'bank_transfer' => 'Virement bancaire',
                        'card' => 'Carte bancaire',
                        'cash' => 'Espèces',
                        'other' => 'Autre',
                    ]),

                Tables\Filters\SelectFilter::make('payment_type')
                    ->label('Type de paiement')
                    ->options([
                        'deposit' => 'Acompte',
                        'installment' => 'Échéance',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('confirmPayment')
                    ->label('Confirmer le paiement')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Confirmer la réception du paiement')
                    ->modalDescription(
                        'Confirmez uniquement après avoir vérifié que l’argent est arrivé sur le compte bancaire.'
                    )
                    ->visible(fn (Payment $record): bool => $record->status === 'pending')
                    ->action(function (Payment $record): void {
                        DB::transaction(function () use ($record): void {
                            $payment = Payment::query()
                                ->whereKey($record->getKey())
                                ->lockForUpdate()
                                ->firstOrFail();

                            if ($payment->status !== 'pending') {
                                return;
                            }

                            $reservation = Reservation::query()
                                ->whereKey($payment->reservation_id)
                                ->lockForUpdate()
                                ->firstOrFail();

                            if ($reservation->status === 'cancelled') {
                                throw ValidationException::withMessages([
                                    'payment' => 'Impossible de confirmer un paiement pour une réservation annulée.',
                                ]);
                            }

                            if ($payment->payment_type === 'deposit') {
                                $anotherConfirmedDeposit = Payment::query()
                                    ->where('reservation_id', $reservation->id)
                                    ->where('payment_type', 'deposit')
                                    ->where('status', 'completed')
                                    ->where('id', '!=', $payment->id)
                                    ->exists();

                                if ($anotherConfirmedDeposit) {
                                    throw ValidationException::withMessages([
                                        'payment' => 'Un acompte est déjà confirmé pour cette réservation. Vérifiez les doublons avant de continuer.',
                                    ]);
                                }
                            }

                            $totalAmount = round(
                                (float) ($reservation->sold_price ?? $reservation->total_amount),
                                2
                            );

                            $alreadyPaid = (float) Payment::query()
                                ->where('reservation_id', $reservation->id)
                                ->where('status', 'completed')
                                ->where('id', '!=', $payment->id)
                                ->sum('amount');

                            $newPaidTotal = round($alreadyPaid + (float) $payment->amount, 2);

                            if ($newPaidTotal > $totalAmount) {
                                throw ValidationException::withMessages([
                                    'payment' => 'Ce paiement dépasserait le prix final de la réservation. Vérifiez les paiements déjà confirmés.',
                                ]);
                            }

                            $payment->status = 'completed';
                            $payment->paid_at = now();
                            $payment->save();

                            if ($payment->payment_type === 'deposit') {
                                $reservation->status = 'confirmed';
                                $reservation->save();
                            }
                        });

                        Notification::make()
                            ->title('Paiement confirmé')
                            ->body('Le paiement a été confirmé et le solde est recalculé à partir du prix final.')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\EditAction::make()
                    ->label('Modifier')
                    ->visible(fn (Payment $record): bool => $record->status !== 'completed'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer')
                    ->requiresConfirmation()
                    ->visible(fn (Payment $record): bool => $record->status !== 'completed'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $completedExists = $records->contains(
                                fn (Payment $payment): bool => $payment->status === 'completed'
                            );

                            if ($completedExists) {
                                Notification::make()
                                    ->title('Suppression impossible')
                                    ->body('Les paiements confirmés ne peuvent pas être supprimés en masse.')
                                    ->danger()
                                    ->send();

                                return;
                            }

                            foreach ($records as $payment) {
                                $payment->delete();
                            }
                        }),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayments::route('/'),
            'create' => Pages\CreatePayment::route('/create'),
            'edit' => Pages\EditPayment::route('/{record}/edit'),
        ];
    }
}
