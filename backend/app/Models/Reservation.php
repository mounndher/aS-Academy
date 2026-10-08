<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function formationDay()
    {
        return $this->belongsTo(FormationDay::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
