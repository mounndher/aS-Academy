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
        'description',
        'steps',
        'pdf_program',
        'price',
        'deposit_amount',
        'image',
        'personal_price',
'has_sale',
'sale_price',
'installment_enabled',
'installment_count',
        'is_active',
    ];

    protected $casts = [
    'steps' => 'array',
    'price' => 'decimal:2',
    'personal_price' => 'decimal:2',
    'sale_price' => 'decimal:2',
    'deposit_amount' => 'decimal:2',
    'has_sale' => 'boolean',
    'installment_enabled' => 'boolean',
    'installment_count' => 'integer',
    'is_active' => 'boolean',
];

    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function formationDays()
    {
        return $this->hasMany(FormationDay::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}