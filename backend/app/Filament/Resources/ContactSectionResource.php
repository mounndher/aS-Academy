<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactSectionResource\Pages;
use App\Models\ContactSection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactSectionResource extends Resource
{
    protected static ?string $model = ContactSection::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?string $navigationLabel = 'Contact';

    protected static ?string $modelLabel = 'Contact';

    protected static ?string $pluralModelLabel = 'Contact';

    protected static ?int $navigationSort = 5;

    public static function canCreate(): bool
    {
        return ! ContactSection::exists();
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                /*
                |--------------------------------------------------------------------------
                | Header
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('En-tête')
                    ->schema([

                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Petit titre')
                            ->placeholder('CONTACT')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
                            ->placeholder('PARLONS DE')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('subtitle')
                            ->label('Sous-titre')
                            ->placeholder('votre')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('heading')
                            ->label('Titre principal')
                            ->placeholder('FORMATION')
                            ->maxLength(255),

                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->placeholder(
                                "Une question sur une formation, une ville ou une date ?\nÉcrivez-nous — nous vous répondons sous quelques jours."
                            )
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Address
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Adresse')
                    ->schema([

                        Forms\Components\TextInput::make('address_label')
                            ->label('Label')
                            ->placeholder('ADRESSE'),

                        Forms\Components\TextInput::make('address_line_1')
                            ->label('Adresse')
                            ->placeholder('135 rue Jean Jaurès'),

                        Forms\Components\TextInput::make('address_line_2')
                            ->label('Ville et code postal')
                            ->placeholder('Talence 33400'),

                        Forms\Components\TextInput::make('cities')
                            ->label('Villes de formation')
                            ->placeholder(
                                'Formations · Bordeaux · Paris · Lyon · Toulouse · Marrakech'
                            )
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Instagram
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Instagram')
                    ->schema([

                        Forms\Components\TextInput::make('instagram_label')
                            ->label('Label')
                            ->placeholder('INSTAGRAM'),

                        Forms\Components\TextInput::make('instagram_handle')
                            ->label('Compte Instagram')
                            ->placeholder('@asacademy__'),

                        Forms\Components\TextInput::make('instagram_link')
                            ->label('Lien Instagram')
                            ->placeholder('https://instagram.com/asacademy__')
                            ->url()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('title')
                    ->label('Titre'),

                Tables\Columns\TextColumn::make('address_line_2')
                    ->label('Localisation'),

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
            'index' => Pages\ListContactSections::route('/'),
            'create' => Pages\CreateContactSection::route('/create'),
            'edit' => Pages\EditContactSection::route('/{record}/edit'),
        ];
    }
}