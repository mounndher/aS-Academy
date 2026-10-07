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
        Schema::table('site_settings', function (Blueprint $table) {
            //
             $table->string('iban')->nullable()->after('id');
            $table->string('bic')->nullable()->after('iban');
            $table->text('account_holder_address')->nullable()->after('bic');
            $table->text('cancellation_policy')->nullable()->after('account_holder_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            //
            $table->dropColumn([
                'iban',
                'bic',
                'account_holder_address',
                'cancellation_policy',
            ]);
            
        });
    }
};
