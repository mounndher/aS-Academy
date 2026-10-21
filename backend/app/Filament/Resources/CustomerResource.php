<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CustomerResource\Pages;
use App\Models\Customer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
class CustomerResource extends Resource
{
    protected static ?string $model = Customer::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
     protected static ?string $navigationGroup = 'Formations';

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'Clients';

    protected static ?string $modelLabel = 'Client';

    protected static ?string $pluralModelLabel = 'Clients';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('first_name')
                    ->label('Prénom')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('last_name')
                    ->label('Nom')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('phone')
                    ->label('Téléphone')
                    ->tel()
                    ->required()
                    ->maxLength(50),

                Forms\Components\TextInput::make('postal_code')
                    ->label('Code postal')
                    ->maxLength(20),

                Forms\Components\TextInput::make('city')
                    ->label('Ville')
                    ->maxLength(255),

                Forms\Components\TextInput::make('address')
                    ->label('Adresse')
                    ->maxLength(255)
                    ->columnSpanFull(),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('first_name')
                    ->label('Prénom')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('last_name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),

                Tables\Columns\TextColumn::make('phone')
                    ->label('Téléphone'),
                TextColumn::make('reservations_sum_total_amount')
    ->label('Montant total')
    ->sum('reservations', 'total_amount')
    ->money('EUR'),

TextColumn::make('reservations_sum_deposit_amount')
    ->label('Acompte prévu')
    ->sum('reservations', 'deposit_amount')
    ->money('EUR'),

TextColumn::make('paid_amount')
    ->label('Payé confirmé')
    ->state(function ($record): float {
        return (float) \App\Models\Payment::query()
            ->whereHas('reservation', function ($query) use ($record) {
                $query->where('customer_id', $record->id);
            })
            ->whereIn('status', ['paid', 'completed'])
            ->sum('amount');
    })
    ->money('EUR')
    ->color('success'),

TextColumn::make('remaining_amount')
    ->label('Reste à payer')
    ->state(function ($record): float {
        $total = (float) \App\Models\Reservation::query()
            ->where('customer_id', $record->id)
            ->sum('total_amount');

        $paid = (float) \App\Models\Payment::query()
            ->whereHas('reservation', function ($query) use ($record) {
                $query->where('customer_id', $record->id);
            })
            ->whereIn('status', ['paid', 'completed'])
            ->sum('amount');

        return max(0, $total - $paid);
    })
    ->money('EUR'),

                Tables\Columns\TextColumn::make('city')
                    ->label('Ville')
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
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
            'index' => Pages\ListCustomers::route('/'),
            'create' => Pages\CreateCustomer::route('/create'),
            'edit' => Pages\EditCustomer::route('/{record}/edit'),
        ];
    }
}