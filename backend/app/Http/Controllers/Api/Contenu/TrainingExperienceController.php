<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\TrainingExperience;

class TrainingExperienceController extends Controller
{
    public function index()
    {
        $experience = TrainingExperience::where('is_active', true)
            ->first();

        if (! $experience) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Aucune expérience de formation disponible.',
            ]);
        }

        $imageUrl = function (?string $image): ?string {
            return $image
                ? asset('storage/' . $image)
                : null;
        };

        return response()->json([
            'success' => true,

            'data' => [

                'eyebrow' => $experience->eyebrow,

                'experiences' => [

                    [
                        'number' => $experience->item_1_number,
                        'title' => $experience->item_1_title,
                        'subtitle' => $experience->item_1_subtitle,
                        'description' => $experience->item_1_description,

                        'image_primary' => $imageUrl(
                            $experience->item_1_image_primary
                        ),

                        'image_secondary' => $imageUrl(
                            $experience->item_1_image_secondary
                        ),
                    ],

                    [
                        'number' => $experience->item_2_number,
                        'title' => $experience->item_2_title,
                        'subtitle' => $experience->item_2_subtitle,
                        'description' => $experience->item_2_description,

                        'image_primary' => $imageUrl(
                            $experience->item_2_image_primary
                        ),

                        'image_secondary' => $imageUrl(
                            $experience->item_2_image_secondary
                        ),
                    ],

                    [
                        'number' => $experience->item_3_number,
                        'title' => $experience->item_3_title,
                        'subtitle' => $experience->item_3_subtitle,
                        'description' => $experience->item_3_description,

                        'image_primary' => $imageUrl(
                            $experience->item_3_image_primary
                        ),

                        'image_secondary' => $imageUrl(
                            $experience->item_3_image_secondary
                        ),
                    ],

                ],

                'is_active' => $experience->is_active,
            ],
        ]);
    }
}