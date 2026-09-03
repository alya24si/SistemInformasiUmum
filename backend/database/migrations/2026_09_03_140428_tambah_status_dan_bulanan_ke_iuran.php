<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kolom status bayar (untuk filter)
        Schema::table('iuran', function (Blueprint $table) {
            if (!Schema::hasColumn('iuran', 'status_bayar')) {
                $table->string('status_bayar')->default('belum')->after('total');
            }
        });

        // Tabel riwayat bayar per bulan
        Schema::create('iuran_bulanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iuran_id')->constrained('iuran')->cascadeOnDelete();
            $table->integer('tahun');
            $table->string('bulan');
            $table->string('status')->default('belum');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iuran_bulanan');
        Schema::table('iuran', function (Blueprint $table) {
            if (Schema::hasColumn('iuran', 'status_bayar')) {
                $table->dropColumn('status_bayar');
            }
        });
    }
};