<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GallerySectionResource\Pages;
use App\Models\GallerySection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GallerySectionResource extends Resource
{
    protected static ?string $model = GallerySection::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?string $navigationLabel = 'Instagram';

    protected static ?string $modelLabel = 'Instagram';

    protected static ?string $pluralModelLabel = 'Instagram';

    protected static ?int $navigationSort = 4;

    public static function canCreate(): bool
    {
        return !GallerySection::exists();
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Contenu')
                    ->schema([
                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Eyebrow')
                            ->placeholder('INSTAGRAM')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
                            ->placeholder('SUIVEZ')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('instagram_handle')
                            ->label('Compte Instagram')
                            ->placeholder('@ASACADEMY__')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('button_text')
                            ->label('Texte du bouton')
                            ->placeholder('SUIVRE @ASACADEMY__')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('button_link')
                            ->label('Lien Instagram')
                            ->placeholder('https://instagram.com/asacademy__')
                            ->url()
                            ->maxLength(255),

                    ])
                    ->columns(2),

                Forms\Components\Section::make('Images')
                    ->description('Ajoutez les 6 images de la galerie Instagram.')
                    ->schema([
                        Forms\Components\FileUpload::make('image_1')
                            ->label('Image 1')
                            ->image()
                            ->acceptedFileTypes([
                                'image/jpeg',
                                'image/png',
                                'image/webp',
                            ])
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),

                        Forms\Components\FileUpload::make('image_2')
                            ->label('Image 2')
                            ->image()
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),

                        Forms\Components\FileUpload::make('image_3')
                            ->label('Image 3')
                            ->image()
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),

                        Forms\Components\FileUpload::make('image_4')
                            ->label('Image 4')
                            ->image()
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),

                        Forms\Components\FileUpload::make('image_5')
                            ->label('Image 5')
                            ->image()
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),

                        Forms\Components\FileUpload::make('image_6')
                            ->label('Image 6')
                            ->image()
                            ->disk('public')
                            ->directory('gallery')
                            ->imageEditor()
                            ->required(),
                    ])
                    ->columns(3),

                Forms\Components\Toggle::make('is_active')
                    ->label('Actif')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Titre'),

                Tables\Columns\TextColumn::make('instagram_handle')
                    ->label('Instagram'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Dernière modification')
                    ->dateTime('d/m/Y H:i'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGallerySections::route('/'),
            'create' => Pages\CreateGallerySection::route('/create'),
            'edit' => Pages\EditGallerySection::route('/{record}/edit'),
        ];
    }
}