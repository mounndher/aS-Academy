<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormationDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'city',
        'start_date',
        'end_date',
        'price',
        'cpf_eligible',
        'cpf_price',
        'max_places',
        'remaining_places',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
        'cpf_price' => 'decimal:2',
        'max_places' => 'integer',
        'remaining_places' => 'integer',
        'cpf_eligible' => 'boolean',
    ];

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
