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

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Formations';

    protected static ?string $navigationLabel = 'Dates de formation';

    protected static ?string $modelLabel = 'Date de formation';

    protected static ?string $pluralModelLabel = 'Dates de formation';

    protected static ?int $navigationSort = 4;

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                /*
                |--------------------------------------------------------------------------
                | FORMATION
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Formation')
                    ->schema([

                        Forms\Components\Select::make('formation_id')
                            ->label('Formation')
                            ->relationship('formation', 'title')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->native(false),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | LIEU ET PHOTO
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Lieu et photo')
                    ->schema([

                        Forms\Components\TextInput::make('city')
                            ->label('Ville')
                            ->placeholder('Paris')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\FileUpload::make('image')
                            ->label('Photo de la ville')
                            ->image()
                            ->acceptedFileTypes([
                                'image/jpeg',
                                'image/png',
                                'image/webp',
                                'image/avif',
                            ])
                            ->disk('public')
                            ->directory('formation-days')
                            ->visibility('public')
                            ->imageEditor()
                            ->maxSize(5120)
                            ->openable()
                            ->downloadable()
                            ->previewable()
                            ->columnSpanFull(),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | DATES
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Dates')
                    ->schema([

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
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | TARIFICATION
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Tarification')
                    ->schema([

                        Forms\Components\TextInput::make('price')
                            ->label('Prix normal (€)')
                            ->numeric()
                            ->prefix('€')
                            ->required()
                            ->minValue(0),

                        Forms\Components\Toggle::make('cpf_eligible')
                            ->label('Session éligible au CPF')
                            ->live()
                            ->default(false),

                        Forms\Components\TextInput::make('cpf_price')
                            ->label('Prix CPF (€)')
                            ->numeric()
                            ->prefix('€')
                            ->minValue(0)
                            ->visible(
                                fn (Forms\Get $get): bool =>
                                    (bool) $get('cpf_eligible')
                            )
                            ->required(
                                fn (Forms\Get $get): bool =>
                                    (bool) $get('cpf_eligible')
                            ),

                    ])
                    ->columns(3),

                /*
                |--------------------------------------------------------------------------
                | PLACES DISPONIBLES
                |--------------------------------------------------------------------------
                */

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
                            ->default(6)
                            ->lte('max_places'),

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

    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                /*
                |--------------------------------------------------------------------------
                | PHOTO
                |--------------------------------------------------------------------------
                */

                Tables\Columns\ImageColumn::make('image')
                    ->label('Photo')
                    ->state(
                        fn (FormationDay $record): ?string =>
                            $record->image
                                ? asset($record->image)
                                : null
                    )
                    ->size(60)
                    ->square(),

                /*
                |--------------------------------------------------------------------------
                | FORMATION
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('formation.title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | VILLE
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('city')
                    ->label('Ville')
                    ->searchable()
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | DATE DEBUT
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('start_date')
                    ->label('Début')
                    ->date('d/m/Y')
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | DATE FIN
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('end_date')
                    ->label('Fin')
                    ->date('d/m/Y')
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | PRIX
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('price')
                    ->label('Prix normal')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('cpf_price')
                    ->label('Prix CPF')
                    ->money('EUR')
                    ->placeholder('—')
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | PLACES
                |--------------------------------------------------------------------------
                */

                Tables\Columns\TextColumn::make('max_places')
                    ->label('Places')
                    ->sortable(),

                Tables\Columns\TextColumn::make('remaining_places')
                    ->label('Restantes')
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | STATUT
                |--------------------------------------------------------------------------
                */

                Tables\Columns\BadgeColumn::make('status')
                    ->label('Statut')
                    ->colors([
                        'success' => 'available',
                        'danger' => 'full',
                        'warning' => 'cancelled',
                        'gray' => 'finished',
                    ])
                    ->formatStateUsing(
                        fn (string $state): string => match ($state) {
                            'available' => 'Disponible',
                            'full' => 'Complet',
                            'cancelled' => 'Annulée',
                            'finished' => 'Terminée',
                            default => $state,
                        }
                    ),

            ])

            ->defaultSort('start_date', 'asc')

            /*
            |--------------------------------------------------------------------------
            | ACTIONS
            |--------------------------------------------------------------------------
            */

            ->actions([

                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),

            ])

            /*
            |--------------------------------------------------------------------------
            | BULK ACTIONS
            |--------------------------------------------------------------------------
            */

            ->bulkActions([

                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),

            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public static function getRelations(): array
    {
        return [];
    }

    /*
    |--------------------------------------------------------------------------
    | PAGES
    |--------------------------------------------------------------------------
    */

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFormationDays::route('/'),
            'create' => Pages\CreateFormationDay::route('/create'),
            'edit' => Pages\EditFormationDay::route('/{record}/edit'),
        ];
    }
}