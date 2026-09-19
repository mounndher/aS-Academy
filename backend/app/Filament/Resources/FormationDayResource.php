<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormationDayResource\Pages;
use App\Models\FormationDay;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FormationDayResource extends Resource
{
    protected static ?string $model = FormationDay::class;
    protected static ?string $navigationGroup = 'Formations';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationLabel = 'Dates de formation';

    protected static ?string $modelLabel = 'Date de formation';

    protected static ?string $pluralModelLabel = 'Dates de formation';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('formation_id')
                    ->label('Formation')
                    ->relationship('formation', 'title')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\DatePicker::make('date')
                    ->label('Date')
                    ->required()
                    ->native(false),

                Forms\Components\TextInput::make('max_places')
                    ->label('Nombre maximum de places')
                    ->numeric()
                    ->required()
                    ->minValue(1)
                    ->default(10),

                Forms\Components\TextInput::make('remaining_places')
                    ->label('Places restantes')
                    ->numeric()
                    ->required()
                    ->minValue(0)
                    ->default(10),

                Forms\Components\Select::make('status')
                    ->label('Statut')
                    ->options([
                        'available' => 'Disponible',
                        'full' => 'Complet',
                        'cancelled' => 'Annulée',
                        'completed' => 'Terminée',
                    ])
                    ->required()
                    ->default('available'),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('formation.title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('date')
                    ->label('Date')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('max_places')
                    ->label('Places max')
                    ->sortable(),

                Tables\Columns\TextColumn::make('remaining_places')
                    ->label('Places restantes')
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'available' => 'Disponible',
                        'full' => 'Complet',
                        'cancelled' => 'Annulée',
                        'completed' => 'Terminée',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'available' => 'Disponible',
                        'full' => 'Complet',
                        'cancelled' => 'Annulée',
                        'completed' => 'Terminée',
                    ]),

                Tables\Filters\SelectFilter::make('formation_id')
                    ->label('Formation')
                    ->relationship('formation', 'title'),
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
            'index' => Pages\ListFormationDays::route('/'),
            'create' => Pages\CreateFormationDay::route('/create'),
            'edit' => Pages\EditFormationDay::route('/{record}/edit'),
        ];
    }
}