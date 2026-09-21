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
        Schema::table('programmes', function (Blueprint $table) {
            $table->dropColumn([
                'steps',
                'pdf_program',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('programmes', function (Blueprint $table) {
            $table->json('steps')->nullable();
            $table->string('pdf_program')->nullable();
        });
    }
};
