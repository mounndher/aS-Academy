<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'formation_id',
        'formation_day_id',
        'customer_id',
        'pricing_type',
        'sold_price',
        'payment_installments',
        'total_amount',
        'deposit_amount',
        'status',
        'payment_proof',
        'notes',
    ];

    protected $casts = [
        'sold_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'payment_installments' => 'integer',
    ];

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function formationDay(): BelongsTo
    {
        return $this->belongsTo(FormationDay::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * All payments associated with this reservation.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Compatibility with existing code expecting "payment".
     * Returns the most recently created payment.
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    /**
     * Total of confirmed payments.
     */
    /**
 * السعر النهائي المعتمد للحجز.
 */
public function getFinalAmountAttribute(): float
{
    return round(
        (float) ($this->sold_price ?? $this->total_amount ?? 0),
        2
    );
}

/**
 * مجموع الدفعات المؤكدة فقط.
 */
public function getPaidAmountAttribute(): float
{
    return round(
        (float) $this->payments()
            ->where('status', 'completed')
            ->sum('amount'),
        2
    );
}

/**
 * المبلغ المتبقي على العميل.
 */
public function getRemainingAmountAttribute(): float
{
    return max(
        0,
        round($this->final_amount - $this->paid_amount, 2)
    );
}
}
