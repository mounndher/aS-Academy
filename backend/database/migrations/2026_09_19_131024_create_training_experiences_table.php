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
        Schema::create('training_experiences', function (Blueprint $table) {
            $table->id();
            /*
            |--------------------------------------------------------------------------
            | Section
            |--------------------------------------------------------------------------
            */

            $table->string('eyebrow')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Experience 1 — Apprendre
            |--------------------------------------------------------------------------
            */

            $table->string('item_1_number')->nullable();
            $table->string('item_1_title')->nullable();
            $table->string('item_1_subtitle')->nullable();
            $table->text('item_1_description')->nullable();
            $table->string('item_1_image_primary')->nullable();
            $table->string('item_1_image_secondary')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Experience 2 — Pratiquer
            |--------------------------------------------------------------------------
            */

            $table->string('item_2_number')->nullable();
            $table->string('item_2_title')->nullable();
            $table->string('item_2_subtitle')->nullable();
            $table->text('item_2_description')->nullable();
            $table->string('item_2_image_primary')->nullable();
            $table->string('item_2_image_secondary')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Experience 3 — Maîtriser
            |--------------------------------------------------------------------------
            */

            $table->string('item_3_number')->nullable();
            $table->string('item_3_title')->nullable();
            $table->string('item_3_subtitle')->nullable();
            $table->text('item_3_description')->nullable();
            $table->string('item_3_image_primary')->nullable();
            $table->string('item_3_image_secondary')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_experiences');
    }
};
