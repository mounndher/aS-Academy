<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademySection extends Model
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

        'stat_1_label',
        'stat_1_title',
        'stat_1_text',

        'stat_2_label',
        'stat_2_title',
        'stat_2_text',

        'stat_3_label',
        'stat_3_title',
        'stat_3_text',

        'quote',
        'quote_author',
        'heading',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
