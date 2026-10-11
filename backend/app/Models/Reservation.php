<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
     * Une réservation peut avoir plusieurs paiements.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Total des paiements confirmés.
     */
    public function getPaidAmountAttribute(): float
    {
        return (float) $this->payments()
            ->where('status', 'completed')
            ->sum('amount');
    }

    /**
     * Solde restant à payer.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(
            0,
            round(
                (float) $this->total_amount - $this->paid_amount,
                2
            )
        );
    }
}
