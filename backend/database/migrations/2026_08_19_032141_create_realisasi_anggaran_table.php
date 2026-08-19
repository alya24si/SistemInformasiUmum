<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('realisasi_anggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anggaran_id')->constrained('anggaran')->onDelete('cascade');
            $table->string('bulan');
            $table->bigInteger('jumlah');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('realisasi_anggaran');
    }
};