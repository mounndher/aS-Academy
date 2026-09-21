<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormationDayResource\Pages;
use App\Models\Formation;
use App\Models\FormationDay;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FormationDayResource extends Resource
{
    protected static ?string $model = FormationDay::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Formations';

    protected static ?string $navigationLabel = 'Dates de formation';

    protected static ?string $modelLabel = 'Date de formation';

    protected static ?string $pluralModelLabel = 'Dates de formation';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Formation')
                    ->schema([
                        Forms\Components\Select::make('formation_id')
                            ->label('Formation')
                            ->relationship(
                                'formation',
                                'title'
                            )
                            ->searchable()
                            ->preload()
                            ->required()
                            ->native(false),
                    ]),

                Forms\Components\Section::make('CPF')
    ->schema([

        Forms\Components\Toggle::make('cpf_eligible')
            ->label('Session éligible au CPF')
            ->live()
            ->default(false),

        Forms\Components\TextInput::make('cpf_price')
            ->label('Prix CPF (€)')
            ->numeric()
            ->prefix('€')
            ->minValue(0)
            ->visible(fn (Forms\Get $get) => $get('cpf_eligible')),

    ])
    ->columns(2),

                Forms\Components\Section::make('Lieu et dates')
                    ->schema([
                        Forms\Components\TextInput::make('city')
                            ->label('Ville')
                            ->placeholder('Paris')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\DatePicker::make('start_date')
                            ->label('Date de début')
                            ->required()
                            ->native(false)
                            ->displayFormat('d/m/Y')
                            ->firstDayOfWeek(1),

                        Forms\Components\DatePicker::make('end_date')
                            ->label('Date de fin')
                            ->required()
                            ->native(false)
                            ->displayFormat('d/m/Y')
                            ->firstDayOfWeek(1)
                            ->afterOrEqual('start_date'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Places disponibles')
                    ->schema([
                        Forms\Components\TextInput::make('max_places')
                            ->label('Nombre maximum de places')
                            ->numeric()
                            ->minValue(1)
                            ->required()
                            ->default(6),

                        Forms\Components\TextInput::make('remaining_places')
                            ->label('Places restantes')
                            ->numeric()
                            ->minValue(0)
                            ->required()
                            ->default(6),

                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options([
                                'available' => 'Disponible',
                                'full' => 'Complet',
                                'cancelled' => 'Annulée',
                                'finished' => 'Terminée',
                            ])
                            ->required()
                            ->default('available')
                            ->native(false),
                    ])
                    ->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('formation.title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('city')
                    ->label('Ville')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('start_date')
                    ->label('Début')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('end_date')
                    ->label('Fin')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('max_places')
                    ->label('Places')
                    ->sortable(),

                Tables\Columns\TextColumn::make('remaining_places')
                    ->label('Restantes')
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->label('Statut')
                    ->colors([
                        'success' => 'available',
                        'danger' => 'full',
                        'warning' => 'cancelled',
                        'gray' => 'finished',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'available' => 'Disponible',
                        'full' => 'Complet',
                        'cancelled' => 'Annulée',
                        'finished' => 'Terminée',
                        default => $state,
                    }),
            ])
            ->defaultSort('start_date', 'asc')
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
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