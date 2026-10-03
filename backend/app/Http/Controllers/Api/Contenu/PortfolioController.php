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
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'portfolio_category_id' => $item->portfolio_category_id,
                    'title' => $item->title,

                    // Image from public/
                    'image' => $item->image
                        ? asset($item->image)
                        : null,

                    'layout' => $item->layout,
                    'sort_order' => $item->sort_order,
                    'is_active' => $item->is_active,

                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,

                    'category' => $item->category,
                ];
            });

        return response()->json([
            'information' => $information,
            'categories' => $categories,
            'items' => $items,
        ]);
    }
}