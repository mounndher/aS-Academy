<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormationInformation extends Model
{
    use HasFactory;

    protected $table = 'formation_informations';

    protected $fillable = [
        'eyebrow',
        'title',
        'subtitle',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
