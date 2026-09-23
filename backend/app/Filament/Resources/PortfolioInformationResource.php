<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PortfolioInformationResource\Pages;
use App\Models\PortfolioInformation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PortfolioInformationResource extends Resource
{
    protected static ?string $model = PortfolioInformation::class;

    protected static ?string $navigationIcon = 'heroicon-o-information-circle';

    protected static ?string $navigationLabel = 'Portfolio Information';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 23;


    /*
    |--------------------------------------------------------------------------
    | CREATE ONLY ONCE
    |--------------------------------------------------------------------------
    */

    public static function canCreate(): bool
    {
        return PortfolioInformation::count() === 0;
    }


    /*
    |--------------------------------------------------------------------------
    | NEVER DELETE
    |--------------------------------------------------------------------------
    */

    public static function canDelete($record): bool
    {
        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                Forms\Components\Section::make('Information du Portfolio')
                    ->description(
                        'Informations générales affichées dans la section Portfolio.'
                    )
                    ->schema([

                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Eyebrow')
                            ->placeholder('PORTFOLIO')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
                            ->placeholder('NOS')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('subtitle')
                            ->label('Sous-titre')
                            ->placeholder('RÉALISATIONS')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(5)
                            ->columnSpanFull(),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Afficher la section')
                            ->default(true),

                    ])
                    ->columns(2),

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

                Tables\Columns\TextColumn::make('eyebrow')
                    ->label('Eyebrow')
                    ->searchable(),

                Tables\Columns\TextColumn::make('title')
                    ->label('Titre')
                    ->searchable(),

                Tables\Columns\TextColumn::make('subtitle')
                    ->label('Sous-titre')
                    ->searchable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Modifié le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

            ])
            ->actions([

                Tables\Actions\EditAction::make(),

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

            'index' => Pages\ListPortfolioInformation::route('/'),

            'create' => Pages\CreatePortfolioInformation::route('/create'),

            'edit' => Pages\EditPortfolioInformation::route('/{record}/edit'),

        ];
    }
}
