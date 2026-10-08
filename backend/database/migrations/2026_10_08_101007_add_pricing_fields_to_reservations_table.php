<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('pricing_type')
                ->default('normal')
                ->after('customer_id');

            $table->decimal('sold_price', 10, 2)
                ->default(0)
                ->after('pricing_type');

            $table->unsignedTinyInteger('payment_installments')
                ->default(1)
                ->after('sold_price');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'pricing_type',
                'sold_price',
                'payment_installments',
            ]);
        });
    }
};
