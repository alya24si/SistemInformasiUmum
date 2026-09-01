<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('realisasi_anggaran', function (Blueprint $table) {
            if (!Schema::hasColumn('realisasi_anggaran', 'created_at')) {
                $table->timestamp('created_at')->useCurrent()->after('jumlah');
            }
        });
    }

    public function down(): void
    {
        Schema::table('realisasi_anggaran', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });
    }
};