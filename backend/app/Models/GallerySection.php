<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GallerySection extends Model
{
    use HasFactory;
     protected $fillable = [
        'eyebrow',
        'title',
        'instagram_handle',

        'button_text',
        'button_link',

        'image_1',
        'image_2',
        'image_3',
        'image_4',
        'image_5',
        'image_6',

        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
