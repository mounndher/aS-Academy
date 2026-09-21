<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProgrammeResource\Pages;
use App\Models\Programme;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProgrammeResource extends Resource
{
    protected static ?string $model = Programme::class;
    protected static ?string $navigationGroup = 'Formations';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationLabel = 'Programmes';

    protected static ?string $modelLabel = 'Programme';

    protected static ?string $pluralModelLabel = 'Programmes';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nom du programme')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('slug')
                    ->label('Slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                Forms\Components\RichEditor::make('description')
                    ->label('Description')
                    ->columnSpanFull(),

                Forms\Components\TextInput::make('duration')
                    ->label('Durée')
                    ->placeholder('Ex: 2 jours')
                    ->maxLength(255),

             

                

                Forms\Components\Toggle::make('is_active')
                    ->label('Actif')
                    ->default(true),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Programme')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug')
                    ->searchable(),

                Tables\Columns\TextColumn::make('duration')
                    ->label('Durée'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Actif'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProgrammes::route('/'),
            'create' => Pages\CreateProgramme::route('/create'),
            'edit' => Pages\EditProgramme::route('/{record}/edit'),
        ];
    }
}