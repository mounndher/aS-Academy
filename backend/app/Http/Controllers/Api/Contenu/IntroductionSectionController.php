<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\IntroductionSection;
use Illuminate\Http\JsonResponse;

class IntroductionSectionController extends Controller
{
    public function show(): JsonResponse
    {
        $introduction = IntroductionSection::where('is_active', true)
            ->first();

        if (!$introduction) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune section Introduction active trouvée.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,

            'data' => [

                'eyebrow' => $introduction->eyebrow,

                'title' => $introduction->title,

                'subtitle' => $introduction->subtitle,

                'description' => $introduction->description,

                'secondary_description' =>
                    $introduction->secondary_description,

                'image_primary' => $introduction->image_primary
                    ? asset('storage/' . $introduction->image_primary)
                    : null,

                'image_secondary' => $introduction->image_secondary
                    ? asset('storage/' . $introduction->image_secondary)
                    : null,

                'bottom_title' => $introduction->bottom_title,

                'bottom_text' => $introduction->bottom_text,

                'expertises' => [
                    [
                        'number' => $introduction->item_1_number,
                        'title' => $introduction->item_1_title,
                    ],
                    [
                        'number' => $introduction->item_2_number,
                        'title' => $introduction->item_2_title,
                    ],
                    [
                        'number' => $introduction->item_3_number,
                        'title' => $introduction->item_3_title,
                    ],
                    [
                        'number' => $introduction->item_4_number,
                        'title' => $introduction->item_4_title,
                    ],
                    [
                        'number' => $introduction->item_5_number,
                        'title' => $introduction->item_5_title,
                    ],
                    [
                        'number' => $introduction->item_6_number,
                        'title' => $introduction->item_6_title,
                    ],
                ],

                'is_active' => $introduction->is_active,
            ],
        ]);
    }
}