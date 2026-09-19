<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\JsonResponse;

class HeroSectionController extends Controller
{
    public function show(): JsonResponse
    {
        $hero = HeroSection::where('is_active', true)->first();

        if (!$hero) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun Hero actif trouvé.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'eyebrow' => $hero->eyebrow,
                'title' => $hero->title,
                'subtitle' => $hero->subtitle,
                'heading' => $hero->heading,
                'description' => $hero->description,

                'primary_button' => [
                    'text' => $hero->primary_button_text,
                    'link' => $hero->primary_button_link,
                ],

                'secondary_button' => [
                    'text' => $hero->secondary_button_text,
                    'link' => $hero->secondary_button_link,
                ],

                'image' => $hero->image
                    ? asset('storage/' . $hero->image)
                    : null,

                'is_active' => $hero->is_active,
            ],
        ]);
    }
}