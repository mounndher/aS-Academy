<?php

namespace App\Filament\Resources\GallerySectionResource\Pages;

use App\Filament\Resources\GallerySectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGallerySections extends ListRecords
{
    protected static string $resource = GallerySectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
