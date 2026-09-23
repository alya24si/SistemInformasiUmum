<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Kenaikan Gaji Berkala GAK dipisah ke tabel sendiri -- numpang di
    // tabel "pegawai" yang sama dengan submenu Masa Kerja. Migration ini
    // cuma nambah kolom "tmt_pangkat" (opsional) ke pegawai.
    public function up(): void
    {
        if (! Schema::hasColumn('pegawai', 'tmt_pangkat')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->date('tmt_pangkat')->nullable()->after('tanggal_masuk');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('pegawai', 'tmt_pangkat')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->dropColumn('tmt_pangkat');
            });
        }
    }
};
