<?php

namespace App\Http\Controllers\Api\Contenu;

use App\Http\Controllers\Controller;
use App\Models\FormationInformation;

class FormationInformationController extends Controller
{
    public function index()
    {
        $information = FormationInformation::where('is_active', true)
            ->first();

        return response()->json([
            'information' => $information,
        ]);
    }
}
