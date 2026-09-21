<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SiteSettingResource\Pages;
use App\Models\SiteSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SiteSettingResource extends Resource
{
    protected static ?string $model = SiteSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?string $navigationLabel = 'Paramètres du site';

    protected static ?string $modelLabel = 'Paramètres du site';

    protected static ?string $pluralModelLabel = 'Paramètres du site';

    protected static ?int $navigationSort = 99;

    /**
     * Only one settings record is allowed.
     */
    public static function canCreate(): bool
    {
        return ! SiteSetting::exists();
    }

    /**
     * Settings cannot be deleted.
     */
    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations générales')
                    ->description('Informations principales du site.')
                    ->schema([
                        Forms\Components\TextInput::make('site_name')
                            ->label('Nom du site')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('tagline')
                            ->label('Slogan')
                            ->maxLength(255),

                        Forms\Components\FileUpload::make('logo')
                            ->label('Logo')
                            ->image()
                            ->disk('public')
                            ->directory('site-settings/logo')
                            ->visibility('public')
                            ->imageEditor()
                            ->columnSpanFull(),

                        Forms\Components\FileUpload::make('favicon')
                            ->label('Favicon')
                            ->image()
                            ->disk('public')
                            ->directory('site-settings/favicon')
                            ->visibility('public')
                            ->imageEditor(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Coordonnées')
                    ->description('Informations de contact affichées sur le site.')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('phone')
                            ->label('Téléphone')
                            ->tel()
                            ->maxLength(50),

                        Forms\Components\TextInput::make('address')
                            ->label('Adresse')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('city')
                            ->label('Ville')
                            ->maxLength(100),

                        Forms\Components\TextInput::make('postal_code')
                            ->label('Code postal')
                            ->maxLength(20),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Réseaux sociaux')
                    ->description('Liens vers vos réseaux sociaux.')
                    ->schema([
                        Forms\Components\TextInput::make('instagram')
                            ->label('Instagram')
                            ->url()
                            ->placeholder('https://instagram.com/...'),

                        Forms\Components\TextInput::make('facebook')
                            ->label('Facebook')
                            ->url()
                            ->placeholder('https://facebook.com/...'),

                        Forms\Components\TextInput::make('tiktok')
                            ->label('TikTok')
                            ->url()
                            ->placeholder('https://tiktok.com/@...'),

                        Forms\Components\TextInput::make('youtube')
                            ->label('YouTube')
                            ->url()
                            ->placeholder('https://youtube.com/...'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Footer')
                    ->description('Contenu affiché dans le pied de page.')
                    ->schema([
                        Forms\Components\Textarea::make('footer_description')
                            ->label('Description du footer')
                            ->rows(4)
                            ->maxLength(1000)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('copyright')
                            ->label('Copyright')
                            ->placeholder('© 2026 AS Academy. Tous droits réservés.')
                            ->maxLength(255)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('SEO')
                    ->description('Informations utilisées pour le référencement.')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title')
                            ->label('Meta Title')
                            ->maxLength(255)
                            ->helperText('Idéalement entre 50 et 60 caractères.'),

                        Forms\Components\Textarea::make('meta_description')
                            ->label('Meta Description')
                            ->rows(3)
                            ->maxLength(500)
                            ->helperText('Description affichée par les moteurs de recherche.'),

                        Forms\Components\Textarea::make('meta_keywords')
                            ->label('Meta Keywords')
                            ->rows(2)
                            ->maxLength(1000)
                            ->helperText('Séparez les mots-clés par des virgules.')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Statut')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Site actif')
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('site_name')
                    ->label('Nom du site')
                    ->searchable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email'),

                Tables\Columns\TextColumn::make('phone')
                    ->label('Téléphone'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Dernière modification')
                    ->dateTime('d/m/Y H:i'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSiteSettings::route('/'),

            'create' => Pages\CreateSiteSetting::route('/create'),

            'edit' => Pages\EditSiteSetting::route('/{record}/edit'),
        ];
    }
}