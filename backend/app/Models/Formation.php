<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;
    protected $fillable = [
        'programme_id',
        'title',
        'slug',
        'city',
        'description',
        'price',
        'deposit_amount',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function days()
    {
        return $this->hasMany(FormationDay::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
