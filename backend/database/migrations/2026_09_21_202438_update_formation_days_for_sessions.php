<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formation_days', function (Blueprint $table) {
            // Remove the foreign key first because
            // MySQL is using the current unique index for it.
            $table->dropForeign(['formation_id']);

            // Remove the old unique index.
            $table->dropUnique(
                'formation_days_formation_id_date_unique'
            );

            // Remove the old date column.
            $table->dropColumn('date');

            // Create the new unique constraint.
            $table->unique(
                [
                    'formation_id',
                    'city',
                    'start_date',
                ],
                'formation_days_formation_id_city_start_date_unique'
            );

            // Recreate the foreign key.
            $table->foreign('formation_id')
                ->references('id')
                ->on('formations')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('formation_days', function (Blueprint $table) {
            // Remove foreign key.
            $table->dropForeign(['formation_id']);

            // Remove new unique constraint.
            $table->dropUnique(
                'formation_days_formation_id_city_start_date_unique'
            );

            // Restore old date column.
            $table->date('date')->after('formation_id');

            // Restore old unique constraint.
            $table->unique(
                ['formation_id', 'date'],
                'formation_days_formation_id_date_unique'
            );

            // Restore foreign key.
            $table->foreign('formation_id')
                ->references('id')
                ->on('formations')
                ->cascadeOnDelete();
        });
    }
};