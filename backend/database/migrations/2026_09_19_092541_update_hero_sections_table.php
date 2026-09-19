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
        Schema::table('hero_sections', function (Blueprint $table) {
            //
             $table->string('eyebrow')->nullable()->after('id');

            $table->string('heading')->nullable()->after('subtitle');

            $table->string('primary_button_text')->nullable()->after('description');
            $table->string('primary_button_link')->nullable()->after('primary_button_text');

            $table->string('secondary_button_text')->nullable()->after('primary_button_link');
            $table->string('secondary_button_link')->nullable()->after('secondary_button_text');

            $table->dropColumn([
                'button_text',
                'button_link',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hero_sections', function (Blueprint $table) {
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();

            $table->dropColumn([
                'eyebrow',
                'heading',
                'primary_button_text',
                'primary_button_link',
                'secondary_button_text',
                'secondary_button_link',
            ]);
        });
    }
};
