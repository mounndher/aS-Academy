
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReservationResource\Pages;
use App\Models\FormationDay;
use App\Models\Reservation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReservationResource extends Resource
{
    protected static ?string $model = Reservation::class;

    protected static ?string $navigationGroup = 'Formations';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationLabel = 'Réservations';

    protected static ?string $modelLabel = 'Réservation';

    protected static ?string $pluralModelLabel = 'Réservations';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('reference')
                ->label('Référence')
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(255),

            Forms\Components\Select::make('customer_id')
                ->label('Client')
                ->relationship('customer', 'email')
                ->searchable()
                ->preload()
                ->required(),

            Forms\Components\Select::make('formation_id')
                ->label('Formation')
                ->relationship('formation', 'title')
                ->searchable()
                ->preload()
                ->required(),

            Forms\Components\Select::make('formation_day_id')
                ->label('Session de formation')
                ->options(fn (): array => FormationDay::query()
                    ->orderBy('start_date')
                    ->get()
                    ->mapWithKeys(function (FormationDay $day): array {
                        $label = $day->city . ' — ' . $day->start_date;

                        if ($day->end_date) {
                            $label .= ' → ' . $day->end_date;
                        }

                        return [$day->id => $label];
                    })
                    ->toArray())
                ->searchable()
                ->preload()
                ->required(),

            Forms\Components\TextInput::make('sold_price')
                ->label('Prix vendu (€)')
                ->numeric()
                ->prefix('€')
                ->minValue(0),

            Forms\Components\TextInput::make('total_amount')
                ->label('Montant total (€)')
                ->numeric()
                ->prefix('€')
                ->required()
                ->minValue(0),

            Forms\Components\TextInput::make('deposit_amount')
                ->label('Acompte prévu (€)')
                ->numeric()
                ->prefix('€')
                ->required()
                ->minValue(0),

            Forms\Components\Select::make('payment_installments')
                ->label('Nombre de paiements après acompte')
                ->options([
                    1 => '1 paiement',
                    2 => '2 paiements',
                ])
                ->required()
                ->default(1),

            Forms\Components\Placeholder::make('remaining_preview')
                ->label('Solde indicatif après acompte')
                ->content(function (Forms\Get $get): string {
                    $total = (float) (
                        $get('sold_price') !== null
                            && $get('sold_price') !== ''
                            ? $get('sold_price')
                            : ($get('total_amount') ?? 0)
                    );

                    $deposit = (float) ($get('deposit_amount') ?? 0);
                    $remaining = max(0, round($total - $deposit, 2));

                    return number_format($remaining, 2, ',', ' ') . ' €';
                }),

            Forms\Components\Select::make('status')
                ->label('Statut de réservation')
                ->options([
                    'pending' => 'En attente',
                    'pending_payment' => 'Paiement en attente',
                    'confirmed' => 'Confirmée',
                    'cancelled' => 'Annulée',
                    'completed' => 'Terminée',
                ])
                ->required()
                ->default('pending'),

            Forms\Components\Textarea::make('notes')
                ->label('Notes')
                ->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query
                ->with(['customer', 'formation', 'formationDay'])
            )
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->label('Référence')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('customer.first_name')
                    ->label('Prénom')
                    ->searchable(),

                Tables\Columns\TextColumn::make('customer.last_name')
                    ->label('Nom')
                    ->searchable(),

                Tables\Columns\TextColumn::make('customer.email')
                    ->label('E-mail')
                    ->searchable(),

                Tables\Columns\TextColumn::make('formation.title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('formationDay.start_date')
                    ->label('Début')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('formationDay.end_date')
                    ->label('Fin')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('formationDay.city')
                    ->label('Ville')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Montant total')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('deposit_amount')
                    ->label('Acompte prévu')
                    ->money('EUR'),

                Tables\Columns\TextColumn::make('payment_installments')
                    ->label('Paiements restants prévus')
                    ->formatStateUsing(fn ($state): string =>
                        (int) $state === 2
                            ? '2 paiements'
                            : '1 paiement'
                    ),

                Tables\Columns\TextColumn::make('paid_amount')
                    ->label('Payé confirmé')
                    ->money('EUR')
                    ->color('success'),

                Tables\Columns\TextColumn::make('remaining_amount')
                    ->label('Reste à payer')
                    ->money('EUR')
                    ->color(fn ($state): string =>
                        (float) $state > 0 ? 'danger' : 'success'
                    ),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'En attente',
                        'pending_payment' => 'Paiement en attente',
                        'confirmed' => 'Confirmée',
                        'cancelled' => 'Annulée',
                        'completed' => 'Terminée',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'confirmed', 'completed' => 'success',
                        'pending', 'pending_payment' => 'warning',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créée le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'pending' => 'En attente',
                        'pending_payment' => 'Paiement en attente',
                        'confirmed' => 'Confirmée',
                        'cancelled' => 'Annulée',
                        'completed' => 'Terminée',
                    ]),

                Tables\Filters\SelectFilter::make('payment_installments')
                    ->label('Nombre de paiements')
                    ->options([
                        1 => '1 paiement',
                        2 => '2 paiements',
                    ]),

                Tables\Filters\SelectFilter::make('formation_day_id')
                    ->label('Session de formation')
                    ->options(fn (): array => FormationDay::query()
                        ->orderBy('start_date')
                        ->get()
                        ->mapWithKeys(function (FormationDay $day): array {
                            $label = $day->city . ' — ' . $day->start_date;

                            if ($day->end_date) {
                                $label .= ' → ' . $day->end_date;
                            }

                            return [$day->id => $label];
                        })
                        ->toArray())
                    ->searchable(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('Voir'),

                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->label('Supprimer la sélection'),
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
            'index' => Pages\ListReservations::route('/'),
            'create' => Pages\CreateReservation::route('/create'),
            'view' => Pages\ViewReservation::route('/{record}'),
            'edit' => Pages\EditReservation::route('/{record}/edit'),
        ];
    }
}
