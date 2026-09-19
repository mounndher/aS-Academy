<?php

namespace App\Filament\Resources\GallerySectionResource\Pages;

use App\Filament\Resources\GallerySectionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditGallerySection extends EditRecord
{
    protected static string $resource = GallerySectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
