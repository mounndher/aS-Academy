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
        'total_amount',
        'deposit_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
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
