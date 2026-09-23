<?php

namespace App\Filament\Resources\FormationInformationResource\Pages;

use App\Filament\Resources\FormationInformationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFormationInformation extends ListRecords
{
    protected static string $resource = FormationInformationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
