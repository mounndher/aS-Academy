<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'payment_type',
        'installment_number',
        'due_date',
        'provider',
        'transaction_id',
        'amount',
        'currency',
        'status',
        'payment_proof',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'installment_number' => 'integer',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
