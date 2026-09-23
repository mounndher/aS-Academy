<?php

namespace App\Filament\Resources\PortfolioInformationResource\Pages;

use App\Filament\Resources\PortfolioInformationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPortfolioInformation extends EditRecord
{
    protected static string $resource = PortfolioInformationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
