<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'eyebrow',
        'title',
        'subtitle',
        'heading',
        'description',

        'primary_button_text',
        'primary_button_link',

        'secondary_button_text',
        'secondary_button_link',

        'image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}