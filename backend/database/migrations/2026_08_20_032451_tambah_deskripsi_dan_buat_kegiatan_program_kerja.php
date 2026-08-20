<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bagian 1: tambah kolom deskripsi + buang kolom triwulan lama
        Schema::table('program_kerja', function (Blueprint $table) {
            $table->text('deskripsi')->after('program')->nullable();
            $table->dropColumn(['realisasi_tw1', 'realisasi_tw2', 'realisasi_tw3', 'realisasi_tw4']);
        });

        // Bagian 2: buat tabel kegiatan per bulan
        Schema::create('kegiatan_program_kerja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_kerja_id')->constrained('program_kerja')->onDelete('cascade');
            $table->string('bulan');
            $table->bigInteger('target_anggaran')->default(0);
            $table->integer('persen_realisasi')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kegiatan_program_kerja');
    }
};