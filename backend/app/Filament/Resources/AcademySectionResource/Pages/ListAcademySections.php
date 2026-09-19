<?php

namespace App\Filament\Resources\AcademySectionResource\Pages;

use App\Filament\Resources\AcademySectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAcademySections extends ListRecords
{
    protected static string $resource = AcademySectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
