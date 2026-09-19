<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\GallerySection;

class GallerySectionController extends Controller
{
    public function index()
    {
        $gallery = GallerySection::where('is_active', true)->first();

        if (! $gallery) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Aucune section Instagram disponible.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'eyebrow' => $gallery->eyebrow,
                'title' => $gallery->title,
                'instagram_handle' => $gallery->instagram_handle,

                'button_text' => $gallery->button_text,
                'button_link' => $gallery->button_link,

                'images' => [
                    $gallery->image_1
                        ? asset('storage/' . $gallery->image_1)
                        : null,

                    $gallery->image_2
                        ? asset('storage/' . $gallery->image_2)
                        : null,

                    $gallery->image_3
                        ? asset('storage/' . $gallery->image_3)
                        : null,

                    $gallery->image_4
                        ? asset('storage/' . $gallery->image_4)
                        : null,

                    $gallery->image_5
                        ? asset('storage/' . $gallery->image_5)
                        : null,

                    $gallery->image_6
                        ? asset('storage/' . $gallery->image_6)
                        : null,
                ],

                'is_active' => $gallery->is_active,
            ],
        ]);
    }
}