<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactMessageResource\Pages;
use App\Models\ContactMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Formations';

    protected static ?string $navigationLabel = 'Messages';

    protected static ?string $modelLabel = 'Message';

    protected static ?string $pluralModelLabel = 'Messages';

    protected static ?int $navigationSort = 7;

    /*
    |--------------------------------------------------------------------------
    | Admin cannot create messages
    |--------------------------------------------------------------------------
    */

    public static function canCreate(): bool
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
        return $form
            ->schema([

                Forms\Components\Section::make('Informations du contact')
                    ->schema([

                        Forms\Components\TextInput::make('first_name')
                            ->label('Prénom')
                            ->disabled(),

                        Forms\Components\TextInput::make('last_name')
                            ->label('Nom')
                            ->disabled(),

                        Forms\Components\TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->disabled(),

                        Forms\Components\TextInput::make('phone')
                            ->label('Téléphone')
                            ->disabled(),

                    ])
                    ->columns(2),

                Forms\Components\Section::make('Message')
                    ->schema([

                        Forms\Components\Textarea::make('message')
                            ->label('Message')
                            ->disabled()
                            ->rows(8)
                            ->columnSpanFull(),

                    ]),

                Forms\Components\Section::make('Gestion')
                    ->schema([

                        Forms\Components\Select::make('status')
                            ->label('Statut')
                            ->options([
                                'new' => 'Nouveau',
                                'read' => 'Lu',
                                'processed' => 'Traité',
                            ])
                            ->required()
                            ->native(false),

                    ]),
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

                Tables\Columns\TextColumn::make('first_name')
                    ->label('Prénom')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('last_name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('phone')
                    ->label('Téléphone')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('message')
                    ->label('Message')
                    ->limit(50)
                    ->tooltip(
                        fn (ContactMessage $record): string => $record->message
                    ),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(
                        fn (string $state): string => match ($state) {
                            'new' => 'Nouveau',
                            'read' => 'Lu',
                            'processed' => 'Traité',
                            default => $state,
                        }
                    )
                    ->color(
                        fn (string $state): string => match ($state) {
                            'new' => 'danger',
                            'read' => 'warning',
                            'processed' => 'success',
                            default => 'gray',
                        }
                    ),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Reçu le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

            ])

            /*
            |--------------------------------------------------------------------------
            | Newest messages first
            |--------------------------------------------------------------------------
            */

            ->defaultSort('created_at', 'desc')

            /*
            |--------------------------------------------------------------------------
            | Filters
            |--------------------------------------------------------------------------
            */

            ->filters([

                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options([
                        'new' => 'Nouveau',
                        'read' => 'Lu',
                        'processed' => 'Traité',
                    ]),

            ])

            /*
            |--------------------------------------------------------------------------
            | Actions
            |--------------------------------------------------------------------------
            */

            ->actions([

                Tables\Actions\EditAction::make()
                    ->label('Voir'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer'),

            ])

            /*
            |--------------------------------------------------------------------------
            | Bulk actions
            |--------------------------------------------------------------------------
            */

            ->bulkActions([

                Tables\Actions\BulkActionGroup::make([

                    Tables\Actions\DeleteBulkAction::make()
                        ->label('Supprimer'),

                ]),

            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    public static function getPages(): array
    {
        return [

            'index' => Pages\ListContactMessages::route('/'),

            'edit' => Pages\EditContactMessage::route('/{record}/edit'),

        ];
    }
}