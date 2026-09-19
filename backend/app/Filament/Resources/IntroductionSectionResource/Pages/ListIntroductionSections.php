<?php

namespace App\Filament\Resources\IntroductionSectionResource\Pages;

use App\Filament\Resources\IntroductionSectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListIntroductionSections extends ListRecords
{
    protected static string $resource = IntroductionSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
