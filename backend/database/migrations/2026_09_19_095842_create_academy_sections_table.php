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
        Schema::create('academy_sections', function (Blueprint $table) {
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

            // Stat 1
            $table->string('stat_1_label')->nullable();
            $table->string('stat_1_title')->nullable();
            $table->string('stat_1_text')->nullable();

            // Stat 2
            $table->string('stat_2_label')->nullable();
            $table->string('stat_2_title')->nullable();
            $table->string('stat_2_text')->nullable();

            // Stat 3
            $table->string('stat_3_label')->nullable();
            $table->string('stat_3_title')->nullable();
            $table->string('stat_3_text')->nullable();

            // Quote
            $table->text('quote')->nullable();
            $table->string('quote_author')->nullable();

            $table->boolean('is_active')->default(true);

            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academy_sections');
    }
};
