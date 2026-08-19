<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_kerja', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun');
            $table->string('bidang');
            $table->string('program');
            $table->string('target');
            $table->integer('realisasi_tw1')->default(0);
            $table->integer('realisasi_tw2')->default(0);
            $table->integer('realisasi_tw3')->default(0);
            $table->integer('realisasi_tw4')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('program_kerja');
    }
};