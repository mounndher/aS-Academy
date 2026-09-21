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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            

            // General
            $table->string('site_name')->nullable();
            $table->string('tagline')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();

            // Contact
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();

            // Social networks
            $table->string('instagram')->nullable();
            $table->string('facebook')->nullable();
            $table->string('tiktok')->nullable();
            $table->string('youtube')->nullable();

            // Footer
            $table->text('footer_description')->nullable();
            $table->string('copyright')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
