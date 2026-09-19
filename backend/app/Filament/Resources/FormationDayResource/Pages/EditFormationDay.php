<?php

namespace App\Filament\Resources\FormationDayResource\Pages;

use App\Filament\Resources\FormationDayResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFormationDay extends EditRecord
{
    protected static string $resource = FormationDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
