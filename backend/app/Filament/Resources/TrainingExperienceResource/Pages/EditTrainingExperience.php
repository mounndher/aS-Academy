<?php

namespace App\Filament\Resources\TrainingExperienceResource\Pages;

use App\Filament\Resources\TrainingExperienceResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTrainingExperience extends EditRecord
{
    protected static string $resource = TrainingExperienceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
