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
        Schema::create('introduction_sections', function (Blueprint $table) {
           $table->id();

            // Header
            $table->string('eyebrow')->nullable();
            $table->string('title');
            $table->string('subtitle')->nullable();

            // Text
            $table->text('description')->nullable();
            $table->text('secondary_description')->nullable();

            // Images
            $table->string('image_primary')->nullable();
            $table->string('image_secondary')->nullable();

            // Bottom information
            $table->string('bottom_title')->nullable();
            $table->string('bottom_text')->nullable();

            // Expertise 01
            $table->string('item_1_number')->nullable();
            $table->string('item_1_title')->nullable();

            // Expertise 02
            $table->string('item_2_number')->nullable();
            $table->string('item_2_title')->nullable();

            // Expertise 03
            $table->string('item_3_number')->nullable();
            $table->string('item_3_title')->nullable();

            // Expertise 04
            $table->string('item_4_number')->nullable();
            $table->string('item_4_title')->nullable();

            // Expertise 05
            $table->string('item_5_number')->nullable();
            $table->string('item_5_title')->nullable();

            // Expertise 06
            $table->string('item_6_number')->nullable();
            $table->string('item_6_title')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('introduction_sections');
    }
};
