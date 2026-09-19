<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingExperience extends Model
{
    use HasFactory;
    protected $fillable = [

        'eyebrow',

        'item_1_number',
        'item_1_title',
        'item_1_subtitle',
        'item_1_description',
        'item_1_image_primary',
        'item_1_image_secondary',

        'item_2_number',
        'item_2_title',
        'item_2_subtitle',
        'item_2_description',
        'item_2_image_primary',
        'item_2_image_secondary',

        'item_3_number',
        'item_3_title',
        'item_3_subtitle',
        'item_3_description',
        'item_3_image_primary',
        'item_3_image_secondary',

        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
