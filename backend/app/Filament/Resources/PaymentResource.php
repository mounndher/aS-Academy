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
                        ->relationship(
                            name: 'reservation',
                            titleAttribute: 'reference'
                        )
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
                        ->label('Prix total de la formation')
                        ->content(function (Forms\Get $get): string {
                            $reservation = Reservation::find($get('reservation_id'));

                            return $reservation
                                ? number_format((float) $reservation->total_amount, 2, ',', ' ') . ' €'
                                : 'Sélectionnez une réservation';
                        }),

                    Forms\Components\Placeholder::make('paid_amount_display')
                        ->label('Total des paiements confirmés')
                        ->content(function (Forms\Get $get): string {
                            $reservation = Reservation::find($get('reservation_id'));

                            if (! $reservation) {
                                return '—';
                            }

                            $paid = Payment::query()
                                ->where('reservation_id', $reservation->id)
                                ->where('status', 'completed')
                                ->when(
                                    $get('record_id'),
                                    fn ($query, $recordId) => $query->where('id', '!=', $recordId)
                                )
                                ->sum('amount');

                            return number_format((float) $paid, 2, ',', ' ') . ' €';
                        }),

                    Forms\Components\Select::make('payment_type')
                        ->label('Type de paiement')
                        ->options([
                            'deposit' => 'Acompte',
                            'installment' => 'Échéance / acompte complémentaire',
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

                    Forms\Components\Select::make('status')
                        ->label('Statut du paiement')
                        ->options([
                            'pending' => 'En attente de vérification',
                            'completed' => 'Payé / confirmé',
                            'failed' => 'Échoué',
                            'refunded' => 'Remboursé',
                        ])
                        ->required()
                        ->default('pending')
                        ->live()
                        ->afterStateUpdated(function ($state, Forms\Set $set): void {
                            $set('paid_at', $state === 'completed' ? now()->format('Y-m-d H:i:s') : null);
                        })
                        ->helperText('Pour un virement bancaire, vérifiez d’abord la réception des fonds.'),

                    Forms\Components\TextInput::make('payment_proof')
                        ->label('Chemin du justificatif de paiement')
                        ->maxLength(255)
                        ->nullable(),

                    Forms\Components\DateTimePicker::make('paid_at')
                        ->label('Date du paiement')
                        ->native(false)
                        ->seconds(false)
                        ->visible(fn (Forms\Get $get): bool => $get('status') === 'completed'),
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

                Tables\Columns\TextColumn::make('reservation.total_amount')
                    ->label('Total réservation')
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
                    ->modalDescription('Confirmez uniquement après avoir vérifié que l’argent est arrivé sur le compte.')
                    ->visible(fn (Payment $record): bool => $record->status === 'pending')
                    ->action(function (Payment $record): void {
                        DB::transaction(function () use ($record): void {
                            /** @var Payment $payment */
                            $payment = Payment::query()
                                ->whereKey($record->getKey())
                                ->lockForUpdate()
                                ->firstOrFail();

                            if ($payment->status !== 'pending') {
                                return;
                            }

                            /** @var Reservation $reservation */
                            $reservation = Reservation::query()
                                ->whereKey($payment->reservation_id)
                                ->lockForUpdate()
                                ->firstOrFail();

                            $alreadyPaid = Payment::query()
                                ->where('reservation_id', $reservation->id)
                                ->where('status', 'completed')
                                ->where('id', '!=', $payment->id)
                                ->sum('amount');

                            $newPaidTotal = round((float) $alreadyPaid + (float) $payment->amount, 2);
                            $totalAmount = round((float) $reservation->total_amount, 2);

                            if ($newPaidTotal > $totalAmount) {
                                throw ValidationException::withMessages([
                                    'payment' => 'Ce paiement dépasserait le montant total de la réservation. Vérifiez le montant avant confirmation.',
                                ]);
                            }

                            $payment->status = 'completed';
                            $payment->paid_at = now();
                            $payment->save();

                            if ($payment->payment_type === 'deposit' && $reservation->status !== 'cancelled') {
                                $reservation->status = 'confirmed';
                                $reservation->save();
                            }
                        });

                        Notification::make()
                            ->title('Paiement confirmé')
                            ->body('Le paiement a été marqué comme reçu et le solde a été recalculé.')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
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
