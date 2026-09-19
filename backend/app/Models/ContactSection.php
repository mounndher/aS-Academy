<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactSection extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'eyebrow',
        'title',
        'subtitle',
        'heading',

        'description',

        'address_label',
        'address_line_1',
        'address_line_2',
        'cities',

        'instagram_label',
        'instagram_handle',
        'instagram_link',

        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
