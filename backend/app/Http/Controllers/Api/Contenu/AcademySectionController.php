<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\AcademySection;
use Illuminate\Http\JsonResponse;

class AcademySectionController extends Controller
{
    public function show(): JsonResponse
    {
        $academy = AcademySection::where('is_active', true)
            ->first();

        if (! $academy) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune section Academy active trouvée.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,

            'data' => [

                'eyebrow' => $academy->eyebrow,

                'title' => $academy->title,

                'subtitle' => $academy->subtitle,
                'heading' => $academy->heading,

                'description' => $academy->description,

                'secondary_description' =>
                    $academy->secondary_description,

                'image_primary' => $academy->image_primary
                    ? asset('storage/' . $academy->image_primary)
                    : null,

                'image_secondary' => $academy->image_secondary
                    ? asset('storage/' . $academy->image_secondary)
                    : null,

                'stats' => [

                    [
                        'label' => $academy->stat_1_label,
                        'title' => $academy->stat_1_title,
                        'text' => $academy->stat_1_text,
                    ],

                    [
                        'label' => $academy->stat_2_label,
                        'title' => $academy->stat_2_title,
                        'text' => $academy->stat_2_text,
                    ],

                    [
                        'label' => $academy->stat_3_label,
                        'title' => $academy->stat_3_title,
                        'text' => $academy->stat_3_text,
                    ],

                ],

                'quote' => $academy->quote,

                'quote_author' => $academy->quote_author,

                'is_active' => $academy->is_active,
            ],
        ]);
    }
}