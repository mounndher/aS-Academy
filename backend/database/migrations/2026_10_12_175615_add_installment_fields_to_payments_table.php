<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            //
             $table->string('payment_type')
                ->default('installment')
                ->after('reservation_id');

            $table->unsignedTinyInteger('installment_number')
                ->nullable()
                ->after('payment_type');

            $table->date('due_date')
                ->nullable()
                ->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            //
        });
    }
};
