<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormationDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'city',
        'start_date',
        'end_date',
        'max_places',
        'remaining_places',
        'cpf_eligible',
'cpf_price',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'max_places' => 'integer',
        'remaining_places' => 'integer',
        'cpf_eligible' => 'boolean',
'cpf_price' => 'decimal:2',
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