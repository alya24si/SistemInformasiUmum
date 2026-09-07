<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perbaikan_mobil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kerusakan_id')->constrained('kerusakan_mobil')->onDelete('cascade');
            $table->string('jenis_perbaikan');
            // Nama kolom database tetap "penanggung_jawab" (samakan dengan
            // yang sudah dipakai PerbaikanMobilController) — yang berubah
            // cuma label tampilan di frontend jadi "Penanggung Jawab Mobil".
            $table->string('penanggung_jawab');
            $table->date('tanggal_mulai');
            $table->enum('status', ['Diproses', 'Selesai'])->default('Diproses');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('perbaikan_mobil');
    }
};
