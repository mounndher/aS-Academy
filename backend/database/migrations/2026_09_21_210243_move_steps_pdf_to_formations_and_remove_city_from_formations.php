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
        Schema::table('formations', function (Blueprint $table) {
            //
              Schema::table('formations', function (Blueprint $table) {
            $table->dropColumn('city');
        });

        // Add steps and PDF to formations
        Schema::table('formations', function (Blueprint $table) {
            $table->json('steps')->nullable()->after('description');
            $table->string('pdf_program')->nullable()->after('steps');
        });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->string('city')->nullable()->after('slug');
            $table->dropColumn([
                'steps',
                'pdf_program',
            ]);
        });
    }
};
