<?php

namespace App\Filament\Resources\FormationDayResource\Pages;

use App\Filament\Resources\FormationDayResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFormationDays extends ListRecords
{
    protected static string $resource = FormationDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
