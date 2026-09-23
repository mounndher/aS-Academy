<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\PortfolioInformation;
use App\Models\PortfolioCategory;
use App\Models\PortfolioItem;

class PortfolioController extends Controller
{
    public function index()
    {
        $information = PortfolioInformation::where('is_active', true)
            ->first();

        $categories = PortfolioCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $items = PortfolioItem::with('category')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'information' => $information,
            'categories' => $categories,
            'items' => $items,
        ]);
    }
}
