<?php

namespace App\Filament\Resources;

use App\Filament\Resources\IntroductionSectionResource\Pages;
use App\Models\IntroductionSection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class IntroductionSectionResource extends Resource
{
    protected static ?string $model = IntroductionSection::class;

    protected static ?string $navigationIcon = 'heroicon-o-information-circle';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Introduction';

    protected static ?string $modelLabel = 'Introduction';

    protected static ?string $pluralModelLabel = 'Introduction';

    /*
    |--------------------------------------------------------------------------
    | Une seule Introduction
    |--------------------------------------------------------------------------
    */

    public static function canCreate(): bool
    {
        return ! IntroductionSection::exists();
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
        return $form->schema([

            Forms\Components\Section::make('Contenu principal')
                ->schema([

                    Forms\Components\TextInput::make('eyebrow')
                        ->label('Texte supérieur')
                        ->placeholder('INTRODUCTION')
                        ->maxLength(255)
                        ->columnSpanFull(),

                    Forms\Components\TextInput::make('title')
                        ->label('Titre')
                        ->placeholder("L’EXPERTISE")
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('subtitle')
                        ->label('Sous-titre')
                        ->placeholder('AS ACADEMY')
                        ->maxLength(255),

                    Forms\Components\Textarea::make('description')
                        ->label('Description principale')
                        ->rows(5)
                        ->columnSpanFull(),

                    Forms\Components\Textarea::make('secondary_description')
                        ->label('Description secondaire')
                        ->rows(5)
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
                        ->directory('introduction')
                        ->visibility('public')
                        ->maxSize(5120),

                    Forms\Components\FileUpload::make('image_secondary')
                        ->label('Image secondaire')
                        ->image()
                        ->imageEditor()
                        ->disk('public')
                        ->directory('introduction')
                        ->visibility('public')
                        ->maxSize(5120),

                ])
                ->columns(2),

            /*
            |--------------------------------------------------------------------------
            | Informations inférieures
            |--------------------------------------------------------------------------
            */

            Forms\Components\Section::make('Informations inférieures')
                ->schema([

                    Forms\Components\TextInput::make('bottom_title')
                        ->label('Titre inférieur')
                        ->placeholder(
                            'FONDATRICE & FORMATRICE — AS ACADEMY'
                        )
                        ->maxLength(255),

                    Forms\Components\TextInput::make('bottom_text')
                        ->label('Texte inférieur')
                        ->placeholder(
                            '135 rue Jean Jaurès, Talence · Précision du geste sur modèle'
                        )
                        ->maxLength(255),

                ])
                ->columns(2),

            /*
            |--------------------------------------------------------------------------
            | Expertises
            |--------------------------------------------------------------------------
            */

            Forms\Components\Section::make('Expertises')
                ->description('Les six éléments affichés dans la section.')
                ->schema([

                    Forms\Components\TextInput::make('item_1_number')
                        ->label('Numéro 01')
                        ->default('01')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_1_title')
                        ->label('Expertise 01')
                        ->placeholder('TECHNIQUE')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('item_2_number')
                        ->label('Numéro 02')
                        ->default('02')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_2_title')
                        ->label('Expertise 02')
                        ->placeholder('PRÉCISION')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('item_3_number')
                        ->label('Numéro 03')
                        ->default('03')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_3_title')
                        ->label('Expertise 03')
                        ->placeholder('HYGIÈNE')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('item_4_number')
                        ->label('Numéro 04')
                        ->default('04')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_4_title')
                        ->label('Expertise 04')
                        ->placeholder('MAPPING')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('item_5_number')
                        ->label('Numéro 05')
                        ->default('05')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_5_title')
                        ->label('Expertise 05')
                        ->placeholder('APPLICATION')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('item_6_number')
                        ->label('Numéro 06')
                        ->default('06')
                        ->maxLength(10),

                    Forms\Components\TextInput::make('item_6_title')
                        ->label('Expertise 06')
                        ->placeholder('FINITION')
                        ->maxLength(255),

                ])
                ->columns(2),

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
                    ->label('Sous-titre'),

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
            'index' => Pages\ListIntroductionSections::route('/'),

            'create' => Pages\CreateIntroductionSection::route('/create'),

            'edit' => Pages\EditIntroductionSection::route('/{record}/edit'),
        ];
    }
}