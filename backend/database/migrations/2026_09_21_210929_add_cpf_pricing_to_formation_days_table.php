<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formation_days', function (Blueprint $table) {
            $table->boolean('cpf_eligible')
                ->default(false)
                ->after('status');

            $table->decimal('cpf_price', 10, 2)
                ->nullable()
                ->after('cpf_eligible');
        });
    }

    public function down(): void
    {
        Schema::table('formation_days', function (Blueprint $table) {
            $table->dropColumn([
                'cpf_eligible',
                'cpf_price',
            ]);
        });
    }
};