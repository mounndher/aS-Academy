<?php

namespace App\Filament\Resources\FormationInformationResource\Pages;

use App\Filament\Resources\FormationInformationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFormationInformation extends EditRecord
{
    protected static string $resource = FormationInformationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
