<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntroductionSection extends Model
{
     use HasFactory;
   protected $fillable = [
        'eyebrow',
        'title',
        'subtitle',
        'description',
        'secondary_description',

        'image_primary',
        'image_secondary',

        'bottom_title',
        'bottom_text',

        'item_1_number',
        'item_1_title',

        'item_2_number',
        'item_2_title',

        'item_3_number',
        'item_3_title',

        'item_4_number',
        'item_4_title',

        'item_5_number',
        'item_5_title',

        'item_6_number',
        'item_6_title',

        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
