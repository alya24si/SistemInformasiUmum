<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kerusakan_ruangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ruangan_id')->constrained('ruangan')->onDelete('cascade');
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
        Schema::drop('kerusakan_ruangan');
    }
};
