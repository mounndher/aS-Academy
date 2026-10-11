
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

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
                            fn ($record): string =>
                                $record->reference . ' — ' .
                                trim(
                                    ($record->customer?->first_name ?? '') .
                                    ' ' .
                                    ($record->customer?->last_name ?? '')
                                )
                        )
                        ->searchable()
                        ->preload()
                        ->required(),

                    Forms\Components\TextInput::make('amount')
                        ->label('Montant payé')
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
                        ->helperText('Facultatif pour un paiement manuel.'),

                    Forms\Components\Select::make('currency')
                        ->label('Devise')
                        ->options([
                            'EUR' => 'EUR (€)',
                        ])
                        ->required()
                        ->default('EUR'),

                    Forms\Components\Select::make('status')
                        ->label('Statut du paiement')
                        ->options([
                            'pending' => 'En attente',
                            'completed' => 'Payé',
                            'failed' => 'Échoué',
                            'refunded' => 'Remboursé',
                        ])
                        ->required()
                        ->default('pending')
                        ->live()
                        ->helperText(
                            'Seuls les paiements confirmés doivent être comptabilisés comme encaissés.'
                        ),

                    Forms\Components\DateTimePicker::make('paid_at')
                        ->label('Date du paiement')
                        ->native(false)
                        ->seconds(false)
                        ->visible(
                            fn (Forms\Get $get): bool =>
                                $get('status') === 'completed'
                        ),
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
                    ->label('Prénom du client')
                    ->placeholder('—')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('reservation.customer.last_name')
                    ->label('Nom du client')
                    ->placeholder('—')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('provider')
                    ->label('Mode de paiement')
                    ->formatStateUsing(
                        fn (?string $state): string => match ($state) {
                            'paypal' => 'PayPal',
                            'bank_transfer' => 'Virement bancaire',
                            'card' => 'Carte bancaire',
                            'cash' => 'Espèces',
                            'other' => 'Autre',
                            default => $state ?? '—',
                        }
                    )
                    ->badge(),

                Tables\Columns\TextColumn::make('transaction_id')
                    ->label('Référence')
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Montant payé')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('currency')
                    ->label('Devise'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(
                        fn (?string $state): string => match ($state) {
                            'pending' => 'En attente',
                            'completed' => 'Payé',
                            'failed' => 'Échoué',
                            'refunded' => 'Remboursé',
                            default => $state ?? '—',
                        }
                    )
                    ->color(
                        fn (?string $state): string => match ($state) {
                            'completed' => 'success',
                            'pending' => 'warning',
                            'failed' => 'danger',
                            'refunded' => 'gray',
                            default => 'gray',
                        }
                    )
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
                        'completed' => 'Payé',
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
            ])
            ->actions([
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
