<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Awalnya migration ini nambah kolom "tmt_pangkat" ke tabel "pegawai"
    // (submenu Kenaikan Gaji Berkala numpang di tabel pegawai yang sama
    // dengan submenu Masa Kerja). Sekarang direvisi total: Kenaikan Gaji
    // Berkala dipisah jadi tabel SENDIRI (`kenaikan_gaji_berkala`) yang
    // berdiri independen -- sama seperti pola Kerusakan Ruangan & Kerusakan
    // Mobil yang juga 2 tabel terpisah, bukan numpang di 1 tabel yang sama.
    public function up(): void
    {
        // Buang kolom tmt_pangkat dari pegawai (kalau ada) -- sudah gak
        // dipakai lagi karena data-nya pindah ke tabel sendiri.
        if (Schema::hasColumn('pegawai', 'tmt_pangkat')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->dropColumn('tmt_pangkat');
            });
        }

        if (! Schema::hasTable('kenaikan_gaji_berkala')) {
            Schema::create('kenaikan_gaji_berkala', function (Blueprint $table) {
                $table->id();
                $table->string('nip')->unique();
                $table->string('nama');
                $table->string('pangkat')->nullable();
                $table->string('jabatan');
                $table->string('eselon_iii')->nullable();
                $table->string('bagian');
                $table->string('no_hp')->nullable();
                $table->date('tmt_pangkat')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('kenaikan_gaji_berkala')) {
            Schema::drop('kenaikan_gaji_berkala');
        }

        if (! Schema::hasColumn('pegawai', 'tmt_pangkat')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->date('tmt_pangkat')->nullable()->after('tanggal_masuk');
            });
        }
    }
};
