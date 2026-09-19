<?php

namespace App\Filament\Resources\IntroductionSectionResource\Pages;

use App\Filament\Resources\IntroductionSectionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditIntroductionSection extends EditRecord
{
    protected static string $resource = IntroductionSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
