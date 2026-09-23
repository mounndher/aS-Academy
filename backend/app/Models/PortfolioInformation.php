<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioInformation extends Model
{
    use HasFactory;
    //protected $table = 'portfolio_information';

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
    protected $table = 'portfolio_informations';
}
