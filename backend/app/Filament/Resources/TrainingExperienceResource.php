<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TrainingExperienceResource\Pages;
use App\Models\TrainingExperience;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TrainingExperienceResource extends Resource
{
    protected static ?string $model = TrainingExperience::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?string $navigationLabel = 'Expérience de formation';

    protected static ?string $modelLabel = 'Expérience de formation';

    protected static ?string $pluralModelLabel = 'Expérience de formation';

    protected static ?int $navigationSort = 4;

    /*
    |--------------------------------------------------------------------------
    | Singleton
    |--------------------------------------------------------------------------
    */

    public static function canCreate(): bool
    {
        return ! TrainingExperience::exists();
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                /*
                |--------------------------------------------------------------------------
                | Section
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Section')
                    ->schema([

                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Eyebrow')
                            ->placeholder("L'EXPÉRIENCE DE FORMATION")
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Actif')
                            ->default(true),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | 01 — APPRENDRE
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('01 — APPRENDRE')
                    ->schema([

                        Forms\Components\TextInput::make('item_1_number')
                            ->label('Numéro')
                            ->default('01')
                            ->maxLength(20),

                        Forms\Components\TextInput::make('item_1_title')
                            ->label('Titre')
                            ->default('APPRENDRE')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('item_1_subtitle')
                            ->label('Sous-titre')
                            ->placeholder('BASES & TECHNIQUE')
                            ->maxLength(255),

                        Forms\Components\Textarea::make('item_1_description')
                            ->label('Description')
                            ->rows(4)
                            ->columnSpanFull(),

                        Forms\Components\FileUpload::make('item_1_image_primary')
                            ->label('Image principale')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                        Forms\Components\FileUpload::make('item_1_image_secondary')
                            ->label('Image secondaire')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | 02 — PRATIQUER
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('02 — PRATIQUER')
                    ->schema([

                        Forms\Components\TextInput::make('item_2_number')
                            ->label('Numéro')
                            ->default('02')
                            ->maxLength(20),

                        Forms\Components\TextInput::make('item_2_title')
                            ->label('Titre')
                            ->default('PRATIQUER')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('item_2_subtitle')
                            ->label('Sous-titre')
                            ->placeholder('MAPPING & POSE SUR MODÈLE')
                            ->maxLength(255),

                        Forms\Components\Textarea::make('item_2_description')
                            ->label('Description')
                            ->rows(4)
                            ->columnSpanFull(),

                        Forms\Components\FileUpload::make('item_2_image_primary')
                            ->label('Image principale')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                        Forms\Components\FileUpload::make('item_2_image_secondary')
                            ->label('Image secondaire')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | 03 — MAÎTRISER
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('03 — MAÎTRISER')
                    ->schema([

                        Forms\Components\TextInput::make('item_3_number')
                            ->label('Numéro')
                            ->default('03')
                            ->maxLength(20),

                        Forms\Components\TextInput::make('item_3_title')
                            ->label('Titre')
                            ->default('MAÎTRISER')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('item_3_subtitle')
                            ->label('Sous-titre')
                            ->placeholder('FINITION & RÉSULTAT')
                            ->maxLength(255),

                        Forms\Components\Textarea::make('item_3_description')
                            ->label('Description')
                            ->rows(4)
                            ->columnSpanFull(),

                        Forms\Components\FileUpload::make('item_3_image_primary')
                            ->label('Image principale')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                        Forms\Components\FileUpload::make('item_3_image_secondary')
                            ->label('Image secondaire')
                            ->image()
                            ->disk('public')
                            ->directory('training-experience')
                            ->visibility('public'),

                    ])
                    ->columns(2),

            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('eyebrow')
                    ->label('Section'),

                Tables\Columns\TextColumn::make('item_1_title')
                    ->label('Expérience 1'),

                Tables\Columns\TextColumn::make('item_2_title')
                    ->label('Expérience 2'),

                Tables\Columns\TextColumn::make('item_3_title')
                    ->label('Expérience 3'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

            ])

            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    public static function getPages(): array
    {
        return [

            // Liste
            'index' => Pages\ListTrainingExperiences::route('/'),

            // Création : page complète, pas popup
            'create' => Pages\CreateTrainingExperience::route('/create'),

            // Modification : page complète
            'edit' => Pages\EditTrainingExperience::route('/{record}/edit'),

        ];
    }
}