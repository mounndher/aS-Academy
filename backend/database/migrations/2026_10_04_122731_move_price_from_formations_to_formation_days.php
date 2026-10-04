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
        // Add price to formation_days
        Schema::table('formation_days', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->after('end_date');
        });

        // Remove price from formations
        Schema::table('formations', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore price to formations
        Schema::table('formations', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable();
        });

        // Remove price from formation_days
        Schema::table('formation_days', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
