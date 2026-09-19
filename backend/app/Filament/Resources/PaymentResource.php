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
        return $form
            ->schema([
                Forms\Components\Select::make('reservation_id')
                    ->label('Réservation')
                    ->relationship('reservation', 'reference')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\Select::make('provider')
                    ->label('Fournisseur')
                    ->options([
                        'paypal' => 'PayPal',
                    ])
                    ->required()
                    ->default('paypal'),

                Forms\Components\TextInput::make('transaction_id')
                    ->label('ID de transaction')
                    ->maxLength(255),

                Forms\Components\TextInput::make('amount')
                    ->label('Montant (€)')
                    ->numeric()
                    ->prefix('€')
                    ->required()
                    ->minValue(0),

                Forms\Components\Select::make('currency')
                    ->label('Devise')
                    ->options([
                        'EUR' => 'EUR (€)',
                    ])
                    ->required()
                    ->default('EUR'),

                Forms\Components\Select::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                        'refunded' => 'Remboursé',
                    ])
                    ->required()
                    ->default('pending'),

                Forms\Components\DateTimePicker::make('paid_at')
                    ->label('Date de paiement')
                    ->native(false),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reservation.reference')
                    ->label('Réservation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('provider')
                    ->label('Fournisseur')
                    ->badge(),

                Tables\Columns\TextColumn::make('transaction_id')
                    ->label('Transaction')
                    ->searchable(),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Montant')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('currency')
                    ->label('Devise'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                        'refunded' => 'Remboursé',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Payé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'completed' => 'Terminé',
                        'failed' => 'Échoué',
                        'refunded' => 'Remboursé',
                    ]),

                Tables\Filters\SelectFilter::make('provider')
                    ->label('Fournisseur')
                    ->options([
                        'paypal' => 'PayPal',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
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