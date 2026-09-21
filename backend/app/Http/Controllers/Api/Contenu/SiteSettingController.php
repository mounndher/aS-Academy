<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;

class SiteSettingController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::where('is_active', true)->first();

        if (! $settings) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Les paramètres du site ne sont pas configurés.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'data' => [
                'site_name' => $settings->site_name,
                'tagline' => $settings->tagline,

                'logo' => $settings->logo
                    ? asset('storage/' . $settings->logo)
                    : null,

                'favicon' => $settings->favicon
                    ? asset('storage/' . $settings->favicon)
                    : null,

                'contact' => [
                    'email' => $settings->email,
                    'phone' => $settings->phone,
                    'address' => $settings->address,
                    'city' => $settings->city,
                    'postal_code' => $settings->postal_code,
                ],

                'social' => [
                    'instagram' => $settings->instagram,
                    'facebook' => $settings->facebook,
                    'tiktok' => $settings->tiktok,
                    'youtube' => $settings->youtube,
                ],

                'footer' => [
                    'description' => $settings->footer_description,
                    'copyright' => $settings->copyright,
                ],

                'seo' => [
                    'meta_title' => $settings->meta_title,
                    'meta_description' => $settings->meta_description,
                    'meta_keywords' => $settings->meta_keywords,
                ],

                'is_active' => $settings->is_active,
            ],
        ]);
    }
}