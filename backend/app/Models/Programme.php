<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    use HasFactory;
     protected $fillable = [
        'name',
        'slug',
        'description',
        'duration',
        'is_active',
    ];

    protected $casts = [
       
        'is_active' => 'boolean',
    ];

    public function formations()
    {
        return $this->hasMany(Formation::class);
    }
}
