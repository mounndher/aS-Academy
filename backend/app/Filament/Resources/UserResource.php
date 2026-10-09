<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Utilisateurs';

    protected static ?string $modelLabel = 'utilisateur';

    protected static ?string $pluralModelLabel = 'Utilisateurs';

    protected static ?string $navigationGroup = 'Administration';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->label('Nom complet')
                ->required()
                ->maxLength(255),

            Forms\Components\TextInput::make('email')
                ->label('Adresse e-mail')
                ->email()
                ->required()
                ->maxLength(255)
                ->unique(table: 'users', ignoreRecord: true),

            Forms\Components\Select::make('role')
                ->label('Rôle')
                ->options([
                    'admin' => 'Administrateur',
                    'manager' => 'Manager',
                    'staff' => 'Employé',
                ])
                ->default('staff')
                ->required(),

            Forms\Components\TextInput::make('password')
                ->label('Mot de passe')
                ->password()
                ->revealable()
                ->minLength(8)
                ->required(fn (string $operation): bool => $operation === 'create')
                ->dehydrated(fn (?string $state): bool => filled($state))
                ->dehydrateStateUsing(
                    fn (string $state): string => Hash::make($state)
                ),

            Forms\Components\TextInput::make('password_confirmation')
                ->label('Confirmer le mot de passe')
                ->password()
                ->revealable()
                ->same('password')
                ->required(fn (string $operation): bool => $operation === 'create')
                ->dehydrated(false),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('E-mail')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('role')
                    ->label('Rôle')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'admin' => 'Administrateur',
                        'manager' => 'Manager',
                        'staff' => 'Employé',
                        default => ucfirst($state ?? ''),
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'admin' => 'danger',
                        'manager' => 'warning',
                        'staff' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date de création')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Modifier'),

                Tables\Actions\DeleteAction::make()
                    ->label('Supprimer')
                    ->before(function (User $record): void {
                        if ($record->is(auth()->user())) {
                            throw new \RuntimeException(
                                'Vous ne pouvez pas supprimer votre propre compte.'
                            );
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->label('Supprimer la sélection')
                        ->before(function ($records): void {
                            if ($records->contains(
                                fn (User $record): bool => $record->is(auth()->user())
                            )) {
                                throw new \RuntimeException(
                                    'Vous ne pouvez pas supprimer votre propre compte.'
                                );
                            }
                        }),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
