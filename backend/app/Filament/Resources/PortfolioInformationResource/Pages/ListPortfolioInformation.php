<?php

namespace App\Filament\Resources\PortfolioInformationResource\Pages;

use App\Filament\Resources\PortfolioInformationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPortfolioInformation extends ListRecords
{
    protected static string $resource = PortfolioInformationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
