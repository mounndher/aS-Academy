<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormationResource\Pages;
use App\Models\Formation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FormationResource extends Resource
{
    protected static ?string $model = Formation::class;

    protected static ?string $navigationGroup = 'Formations';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationLabel = 'Formations';

    protected static ?string $modelLabel = 'Formation';

    protected static ?string $pluralModelLabel = 'Formations';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                /*
                |--------------------------------------------------------------------------
                | Formation
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Informations générales')
                    ->schema([

                        Forms\Components\Select::make('programme_id')
                            ->label('Programme')
                            ->relationship('programme', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->native(false),

                        Forms\Components\TextInput::make('title')
                            ->label('Titre')
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

                    ])
                    ->columns(2),

                /*
                |--------------------------------------------------------------------------
                | Prix
                |--------------------------------------------------------------------------
                */

               Forms\Components\Section::make('Tarification')
    ->schema([

        Forms\Components\TextInput::make('personal_price')
            ->label('Prix financement personnel (€)')
            ->numeric()
            ->prefix('€')
            ->required()
            ->minValue(0),

        Forms\Components\Toggle::make('has_sale')
            ->label('Prix soldé')
            ->live()
            ->default(false),

        Forms\Components\TextInput::make('sale_price')
            ->label('Prix soldé (€)')
            ->numeric()
            ->prefix('€')
            ->minValue(0)
            ->visible(fn (Forms\Get $get) => $get('has_sale')),

        Forms\Components\Toggle::make('installment_enabled')
            ->label('Paiement en plusieurs fois')
            ->live()
            ->default(false),

        Forms\Components\TextInput::make('installment_count')
            ->label('Nombre de paiements')
            ->numeric()
            ->minValue(2)
            ->maxValue(4)
            ->default(2)
            ->visible(fn (Forms\Get $get) => $get('installment_enabled')),

    ])
    ->columns(2),
                /*
                |--------------------------------------------------------------------------
                | Étapes de la formation
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Étapes de la formation')
                    ->schema([

                        Forms\Components\Repeater::make('steps')
                            ->label('Étapes')
                            ->schema([

                                Forms\Components\TextInput::make('title')
                                    ->label('Titre')
                                    ->required()
                                    ->maxLength(255),

                                Forms\Components\Textarea::make('description')
                                    ->label('Description')
                                    ->rows(3),

                            ])
                            ->columns(2)
                            ->addActionLabel('Ajouter une étape')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(
                                fn (array $state): ?string =>
                                    $state['title'] ?? null
                            )
                            ->columnSpanFull(),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | Programme PDF
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Programme PDF')
                    ->schema([

                        Forms\Components\FileUpload::make('pdf_program')
                            ->label('Programme PDF')
                            ->disk('public')
                            ->directory('formations/programmes')
                            ->acceptedFileTypes([
                                'application/pdf',
                            ])
                            ->maxSize(10240)
                            ->downloadable()
                            ->openable()
                            ->preserveFilenames(),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | Image
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Image')
                    ->schema([

                        Forms\Components\FileUpload::make('image')
                            ->label('Image de la formation')
                            ->image()
                            ->directory('formations')
                            ->disk('public')
                            ->imageEditor()
                            ->downloadable()
                            ->openable(),

                    ]),

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                Forms\Components\Section::make('Statut')
                    ->schema([

                        Forms\Components\Toggle::make('is_active')
                            ->label('Actif')
                            ->default(true),

                    ]),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('title')
                    ->label('Formation')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('programme.name')
                    ->label('Programme')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('price')
                    ->label('Prix')
                    ->money('EUR')
                    ->sortable(),

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

                Tables\Filters\SelectFilter::make('programme_id')
                    ->label('Programme')
                    ->relationship('programme', 'name'),

            ])

            ->actions([

                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),

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
            'index' => Pages\ListFormations::route('/'),
            'create' => Pages\CreateFormation::route('/create'),
            'edit' => Pages\EditFormation::route('/{record}/edit'),
        ];
    }
}