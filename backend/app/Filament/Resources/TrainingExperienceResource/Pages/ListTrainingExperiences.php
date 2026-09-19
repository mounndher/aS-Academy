<?php

namespace App\Filament\Resources\TrainingExperienceResource\Pages;

use App\Filament\Resources\TrainingExperienceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTrainingExperiences extends ListRecords
{
    protected static string $resource = TrainingExperienceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
