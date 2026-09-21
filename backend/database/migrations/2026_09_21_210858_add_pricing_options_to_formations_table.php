<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->decimal('personal_price', 10, 2)->nullable()->after('price');

            $table->boolean('has_sale')->default(false)->after('personal_price');

            $table->decimal('sale_price', 10, 2)->nullable()->after('has_sale');

            $table->boolean('installment_enabled')->default(false)->after('sale_price');

            $table->unsignedTinyInteger('installment_count')
                ->nullable()
                ->after('installment_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->dropColumn([
                'personal_price',
                'has_sale',
                'sale_price',
                'installment_enabled',
                'installment_count',
            ]);
        });
    }
};