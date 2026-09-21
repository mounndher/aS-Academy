<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;
      protected $fillable = [
        'site_name',
        'tagline',
        'logo',
        'favicon',

        'email',
        'phone',
        'address',
        'city',
        'postal_code',

        'instagram',
        'facebook',
        'tiktok',
        'youtube',

        'footer_description',
        'copyright',

        'meta_title',
        'meta_description',
        'meta_keywords',

        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
