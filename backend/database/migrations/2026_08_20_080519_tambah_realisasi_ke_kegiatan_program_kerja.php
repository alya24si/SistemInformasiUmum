<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kegiatan_program_kerja', function (Blueprint $table) {
            $table->bigInteger('realisasi')->default(0)->after('target_anggaran');
            $table->dropColumn('persen_realisasi');
        });
    }

    public function down(): void
    {
        Schema::table('kegiatan_program_kerja', function (Blueprint $table) {
            $table->dropColumn('realisasi');
            $table->integer('persen_realisasi')->default(0);
        });
    }
};