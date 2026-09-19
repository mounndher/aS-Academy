<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\ContactSection;

class ContactSectionController extends Controller
{
    public function index()
    {
        $contact = ContactSection::where('is_active', true)->first();

        if (! $contact) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Aucune section Contact disponible.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'data' => [
                'eyebrow' => $contact->eyebrow,

                'title' => $contact->title,
                'subtitle' => $contact->subtitle,
                'heading' => $contact->heading,

                'description' => $contact->description,

                'address' => [
                    'label' => $contact->address_label,
                    'line_1' => $contact->address_line_1,
                    'line_2' => $contact->address_line_2,
                    'cities' => $contact->cities,
                ],

                'instagram' => [
                    'label' => $contact->instagram_label,
                    'handle' => $contact->instagram_handle,
                    'link' => $contact->instagram_link,
                ],

                'is_active' => $contact->is_active,
            ],
        ]);
    }
}