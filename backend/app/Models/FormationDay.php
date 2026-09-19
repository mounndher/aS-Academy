<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormationDay extends Model
{
    use HasFactory;
    protected $fillable = [
        'formation_id',
        'date',
        'max_places',
        'remaining_places',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
     
}
