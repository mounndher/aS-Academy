<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programme_id')
                ->constrained('programmes')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('slug')->unique();

            $table->string('city')->nullable();
            $table->text('description')->nullable();

            $table->decimal('price', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->nullable();

            $table->string('image')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
