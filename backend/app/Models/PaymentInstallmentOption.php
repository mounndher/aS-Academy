
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentInstallmentOption extends Model
{
    protected $fillable = [
        'installments',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'installments' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
