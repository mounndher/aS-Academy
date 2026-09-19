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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();

        $table->foreignId('formation_id')
            ->constrained('formations')
            ->cascadeOnDelete();

        $table->foreignId('formation_day_id')
            ->constrained('formation_days')
            ->cascadeOnDelete();

        $table->foreignId('customer_id')
            ->constrained('customers')
            ->cascadeOnDelete();

        $table->decimal('total_amount', 10, 2);
        $table->decimal('deposit_amount', 10, 2);

        $table->string('status')->default('pending');

        $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
