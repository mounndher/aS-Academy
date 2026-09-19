<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AcademySectionResource\Pages;
use App\Models\AcademySection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AcademySectionResource extends Resource
{
    protected static ?string $model = AcademySection::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Academy';

    protected static ?string $modelLabel = 'Academy';

    protected static ?string $pluralModelLabel = 'Academy';

    /*
    |--------------------------------------------------------------------------
    | Une seule section Academy
    |--------------------------------------------------------------------------
    */

    public static function canCreate(): bool
    {
        return !AcademySection::exists();
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
                | Contenu principal
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Contenu principal')
                    ->schema([

                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Texte supérieur')
                            ->placeholder("L’ACADEMY")
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
                            ->placeholder('UNE ACADÉMIE')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('subtitle')
                            ->label('Sous-titre')
                            ->placeholder('DÉDIÉE À')
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('heading')
                            ->label('Titre principal')
                            ->placeholder("l’excellence DU CIL")
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description')
                            ->label('Description principale')
                            ->rows(4)
                            ->columnSpanFull(),

                        Forms\Components\Textarea::make('secondary_description')
                            ->label('Description secondaire')
                            ->rows(6)
                            ->columnSpanFull(),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Images
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Images')
                    ->schema([

                        Forms\Components\FileUpload::make('image_primary')
                            ->label('Image principale')
                            ->image()
                            ->imageEditor()
                            ->disk('public')
                            ->directory('academy')
                            ->visibility('public')
                            ->maxSize(5120),

                        Forms\Components\FileUpload::make('image_secondary')
                            ->label('Image secondaire')
                            ->image()
                            ->imageEditor()
                            ->disk('public')
                            ->directory('academy')
                            ->visibility('public')
                            ->maxSize(5120),

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Statistiques
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Informations clés')
                    ->schema([

                        Forms\Components\Fieldset::make('Information 01')
                            ->schema([

                                Forms\Components\TextInput::make('stat_1_label')
                                    ->label('Label')
                                    ->placeholder('SIÈGE'),

                                Forms\Components\TextInput::make('stat_1_title')
                                    ->label('Titre')
                                    ->placeholder('Talence'),

                                Forms\Components\TextInput::make('stat_1_text')
                                    ->label('Description')
                                    ->placeholder('135 rue Jean Jaurès'),

                            ]),

                        Forms\Components\Fieldset::make('Information 02')
                            ->schema([

                                Forms\Components\TextInput::make('stat_2_label')
                                    ->label('Label')
                                    ->placeholder('VILLES'),

                                Forms\Components\TextInput::make('stat_2_title')
                                    ->label('Titre')
                                    ->placeholder('5 villes'),

                                Forms\Components\TextInput::make('stat_2_text')
                                    ->label('Description')
                                    ->placeholder('France & Maroc'),

                            ]),

                        Forms\Components\Fieldset::make('Information 03')
                            ->schema([

                                Forms\Components\TextInput::make('stat_3_label')
                                    ->label('Label')
                                    ->placeholder('FORMAT'),

                                Forms\Components\TextInput::make('stat_3_title')
                                    ->label('Titre')
                                    ->placeholder('3 jours'),

                                Forms\Components\TextInput::make('stat_3_text')
                                    ->label('Description')
                                    ->placeholder('Programme complet'),

                            ]),

                    ])
                    ->columns(3),

                /*
                |--------------------------------------------------------------------------
                | Citation
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Citation')
                    ->schema([

                        Forms\Components\Textarea::make('quote')
                            ->label('Citation')
                            ->placeholder(
                                "« La précision s'apprend. L'excellence se cultive. »"
                            )
                            ->rows(3)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('quote_author')
                            ->label('Auteur')
                            ->placeholder('AS ACADEMY')
                            ->maxLength(255),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                Forms\Components\Toggle::make('is_active')
                    ->label('Actif')
                    ->default(true),

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

                Tables\Columns\ImageColumn::make('image_primary')
                    ->label('Image')
                    ->disk('public'),

                Tables\Columns\TextColumn::make('title')
                    ->label('Titre')
                    ->searchable(),

                Tables\Columns\TextColumn::make('subtitle')
                    ->label('Sous-titre')
                    ->limit(40),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i'),

            ])

            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),
            ])

            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAcademySections::route('/'),

            'create' => Pages\CreateAcademySection::route('/create'),

            'edit' => Pages\EditAcademySection::route('/{record}/edit'),
        ];
    }
}