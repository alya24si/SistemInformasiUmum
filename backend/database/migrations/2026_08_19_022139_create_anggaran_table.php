<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anggaran', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun');
            $table->string('bidang');
            $table->enum('tipe', ['utama', 'detail']);
            $table->string('kode_akun');
            $table->string('deskripsi');
            $table->integer('unit');
            $table->string('satuan');
            $table->bigInteger('harga_satuan');
            $table->bigInteger('pagu');
            $table->bigInteger('realisasi')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('anggaran');
    }
};