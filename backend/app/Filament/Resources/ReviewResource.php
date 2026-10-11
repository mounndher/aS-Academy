<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';

    protected static ?string $navigationGroup = 'Contenu';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Avis clients';

    protected static ?string $modelLabel = 'Avis client';

    protected static ?string $pluralModelLabel = 'Avis clients';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nom du client')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('formation')
                    ->label('Formation suivie')
                    ->maxLength(255),

                Forms\Components\Select::make('rating')
                    ->label('Note')
                    ->options([
                        1 => '★☆☆☆☆ — 1/5',
                        2 => '★★☆☆☆ — 2/5',
                        3 => '★★★☆☆ — 3/5',
                        4 => '★★★★☆ — 4/5',
                        5 => '★★★★★ — 5/5',
                    ])
                    ->default(5)
                    ->required()
                    ->native(false),

                Forms\Components\Textarea::make('text')
                    ->label('Témoignage')
                    ->required()
                    ->rows(5)
                    ->maxLength(3000)
                    ->columnSpanFull(),

                Forms\Components\Toggle::make('is_approved')
                    ->label('Afficher sur le site')
                    ->helperText(
                        'Activez cette option pour afficher cet avis sur la page d’accueil.'
                    )
                    ->default(false)
                    ->required(),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Client')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('formation')
                    ->label('Formation')
                    ->searchable()
                    ->placeholder('Non renseignée'),

                Tables\Columns\TextColumn::make('rating')
                    ->label('Note')
                    ->formatStateUsing(
                        fn ($state): string =>
                            str_repeat('★', (int) $state)
                            . str_repeat('☆', 5 - (int) $state)
                    )
                    ->color('warning')
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_approved')
                    ->label('Publié')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date de création')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_approved')
                    ->label('Publication')
                    ->placeholder('Tous les avis')
                    ->trueLabel('Avis publiés')
                    ->falseLabel('Avis en attente'),

                Tables\Filters\SelectFilter::make('rating')
                    ->label('Note')
                    ->options([
                        1 => '1 étoile',
                        2 => '2 étoiles',
                        3 => '3 étoiles',
                        4 => '4 étoiles',
                        5 => '5 étoiles',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->label('Supprimer la sélection'),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReviews::route('/'),
            'create' => Pages\CreateReview::route('/create'),
            'edit' => Pages\EditReview::route('/{record}/edit'),
        ];
    }
}
