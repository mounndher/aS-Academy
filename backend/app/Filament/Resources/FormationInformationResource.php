<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormationInformationResource\Pages;
use App\Models\FormationInformation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FormationInformationResource extends Resource
{
    protected static ?string $model = FormationInformation::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationLabel = 'Formation Information';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 26;

    public static function canCreate(): bool
    {
        return FormationInformation::count() === 0;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Information des formations')
                    ->description(
                        'Informations générales affichées en haut de la section Formations.'
                    )
                    ->schema([
                        Forms\Components\TextInput::make('eyebrow')
                            ->label('Eyebrow')
                            ->placeholder('FORMATIONS')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
                            ->placeholder('NOS')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('subtitle')
                            ->label('Sous-titre')
                            ->placeholder('FORMATIONS')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->placeholder(
                                'Extension de Cils — 3 jours. Choisissez votre ville et vos dates, puis réservez en ligne.'
                            )
                            ->rows(5)
                            ->columnSpanFull(),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Afficher la section')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }

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

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFormationInformation::route('/'),
            'create' => Pages\CreateFormationInformation::route('/create'),
            'edit' => Pages\EditFormationInformation::route('/{record}/edit'),
        ];
    }
}
