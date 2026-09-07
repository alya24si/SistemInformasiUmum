<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kerusakan_mobil', function (Blueprint $table) {
            $table->id();
            // Identitas mobil ditulis bebas (contoh: "Toyota Avanza - BM 1234 XY"),
            // gak pakai tabel master terpisah biar setup-nya ringkas.
            $table->string('mobil');
            $table->string('pelapor');
            $table->string('bagian');
            $table->date('tanggal');
            $table->string('kerusakan');
            $table->text('deskripsi')->nullable();
            $table->string('bukti')->nullable();
            $table->enum('status', ['Menunggu', 'Diproses', 'Selesai'])->default('Menunggu');
            $table->string('sumber');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('kerusakan_mobil');
    }
};
