<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perbaikan_ruangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kerusakan_id')->constrained('kerusakan_ruangan')->onDelete('cascade');
            $table->string('jenis_perbaikan');
            $table->string('penanggung_jawab');
            $table->date('tanggal_mulai');
            $table->enum('status', ['Diproses', 'Selesai'])->default('Diproses');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('perbaikan_ruangan');
    }
};
