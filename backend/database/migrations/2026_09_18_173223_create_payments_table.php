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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
              $table->foreignId('reservation_id')
            ->constrained('reservations')
            ->cascadeOnDelete();

        $table->string('provider')->default('paypal');

        $table->string('transaction_id')->nullable()->unique();

        $table->decimal('amount', 10, 2);

        $table->string('currency')->default('EUR');

        $table->string('status')->default('pending');

        $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
