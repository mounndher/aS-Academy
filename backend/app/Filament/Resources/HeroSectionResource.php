<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HeroSectionResource\Pages;
use App\Models\HeroSection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HeroSectionResource extends Resource
{
    protected static ?string $model = HeroSection::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Hero';

    protected static ?string $modelLabel = 'Hero';

    protected static ?string $pluralModelLabel = 'Hero';

    /**
     * Allow creation only if no Hero exists.
     */
    public static function canCreate(): bool
    {
        return !HeroSection::exists();
    }

    /**
     * Never allow deletion of the Hero.
     */
    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                Forms\Components\TextInput::make('eyebrow')
                    ->label('Texte supérieur')
                    ->placeholder('AS ACADEMY — FORMATION PROFESSIONNELLE')
                    ->maxLength(255)
                    ->columnSpanFull(),

                Forms\Components\TextInput::make('title')
                    ->label('Titre')
                    ->placeholder('MAÎTRISEZ')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('subtitle')
                    ->label('Sous-titre')
                    ->placeholder('l’art de')
                    ->maxLength(255),

                Forms\Components\TextInput::make('heading')
                    ->label('Titre principal')
                    ->placeholder('L’EXTENSION DE CILS')
                    ->maxLength(255)
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('description')
                    ->label('Description')
                    ->placeholder(
                        'Des formations professionnelles en extension de cils pour développer votre technique, votre précision et votre expertise.'
                    )
                    ->rows(4)
                    ->columnSpanFull(),

                Forms\Components\Section::make('Bouton principal')
                    ->schema([
                        Forms\Components\TextInput::make('primary_button_text')
                            ->label('Texte du bouton')
                            ->placeholder('DÉCOUVRIR LES FORMATIONS')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('primary_button_link')
                            ->label('Lien du bouton')
                            ->placeholder('/formations')
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Bouton secondaire')
                    ->schema([
                        Forms\Components\TextInput::make('secondary_button_text')
                            ->label('Texte du bouton')
                            ->placeholder('VOIR LES FORMATIONS')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('secondary_button_link')
                            ->label('Lien du bouton')
                            ->placeholder('/formations')
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Forms\Components\FileUpload::make('image')
                    ->label('Image Hero')
                    ->image()
                    ->acceptedFileTypes([
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                    ])
                    ->imageEditor()
                    ->disk('public')
                    ->directory('hero')
                    ->visibility('public')
                    ->maxSize(5120)
                    ->columnSpanFull(),

                Forms\Components\Toggle::make('is_active')
                    ->label('Actif')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Image')
                    ->disk('public'),

                Tables\Columns\TextColumn::make('title')
                    ->label('Titre')
                    ->searchable(),

                Tables\Columns\TextColumn::make('subtitle')
                    ->label('Sous-titre'),

                Tables\Columns\TextColumn::make('heading')
                    ->label('Titre principal'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i'),
            ])

            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Actif'),
            ])

            // Only EDIT
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),
            ])

            // No bulk delete
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHeroSections::route('/'),
            'create' => Pages\CreateHeroSection::route('/create'),
            'edit' => Pages\EditHeroSection::route('/{record}/edit'),
        ];
    }
}