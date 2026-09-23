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
        Schema::create('formation_days', function (Blueprint $table) {
            $table->id();

            $table->foreignId('formation_id')
                ->constrained('formations')
                ->cascadeOnDelete();

            $table->string('city');

            $table->date('start_date');

            $table->time('start_time')->nullable();

            $table->time('end_time')->nullable();

            $table->unsignedInteger('max_places');

            $table->unsignedInteger('remaining_places');

            $table->string('status')->default('available');

            $table->timestamps();

            $table->unique(
                ['formation_id', 'city', 'start_date'],
                'formation_days_formation_id_city_start_date_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formation_days');
    }
};
