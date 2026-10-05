<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormationDayResource\Pages;
use App\Models\FormationDay;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Illuminate\Support\Str;

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

                /*
                |--------------------------------------------------------------------------
                | Formation
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
                | Lieu et image
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Lieu et image')
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
                            ->imageEditor()
                            ->maxSize(5120)
                            ->columnSpanFull()

                            /*
                            |--------------------------------------------------------------------------
                            | SAVE DIRECTLY INTO public/formation-days
                            |--------------------------------------------------------------------------
                            */

                            ->saveUploadedFileUsing(
                                function (
                                    TemporaryUploadedFile $file
                                ): string {

                                    $directory = public_path(
                                        'formation-days'
                                    );

                                    if (! is_dir($directory)) {
                                        mkdir(
                                            $directory,
                                            0755,
                                            true
                                        );
                                    }

                                    $extension =
                                        $file->getClientOriginalExtension();

                                    $filename =
                                        Str::uuid()
                                        . '.'
                                        . $extension;

                                    $file->move(
                                        $directory,
                                        $filename
                                    );

                                    return 'formation-days/' . $filename;
                                }
                            )

                            /*
                            |--------------------------------------------------------------------------
                            | PREVIEW EXISTING IMAGE
                            |--------------------------------------------------------------------------
                            */

                            ->getUploadedFileUsing(
                                function ($file) {

                                    if (! $file) {
                                        return null;
                                    }

                                    if (
                                        is_string($file) &&
                                        str_starts_with(
                                            $file,
                                            'http'
                                        )
                                    ) {
                                        return $file;
                                    }

                                    return asset($file);
                                }
                            ),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Dates
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
                | Tarification
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
                                fn (Forms\Get $get) =>
                                    $get('cpf_eligible')
                            )
                            ->required(
                                fn (Forms\Get $get) =>
                                    $get('cpf_eligible')
                            ),

                    ])
                    ->columns(3),

                /*
                |--------------------------------------------------------------------------
                | Places
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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('formation.title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                /*
                |--------------------------------------------------------------------------
                | IMAGE
                |--------------------------------------------------------------------------
                */

                Tables\Columns\ImageColumn::make('image')
                    ->label('Photo')
                    ->state(
                        fn ($record) => $record->image
                            ? asset($record->image)
                            : null
                    )
                    ->size(60)
                    ->square(),

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

                Tables\Columns\TextColumn::make('price')
                    ->label('Prix normal')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('cpf_price')
                    ->label('Prix CPF')
                    ->money('EUR')
                    ->placeholder('—')
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

            ->actions([

                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),

            ])

            ->bulkActions([

                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),

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