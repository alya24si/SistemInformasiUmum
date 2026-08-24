<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel rekap per pegawai (akumulasi)
        Schema::create('pelanggaran', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->unique();
            $table->string('nama');
            $table->integer('tk')->default(0);
            $table->integer('tl1')->default(0);
            $table->integer('tl2')->default(0);
            $table->integer('tl3')->default(0);
            $table->integer('psw1')->default(0);
            $table->integer('psw2')->default(0);
            $table->integer('psw3')->default(0);
            $table->integer('psw4')->default(0);
            $table->integer('total')->default(0);
            $table->timestamps();
        });

        // Tabel riwayat per upload
        Schema::create('pelanggaran_riwayat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelanggaran_id')->constrained('pelanggaran')->cascadeOnDelete();
            $table->string('tanggal');
            $table->integer('tl1')->default(0);
            $table->integer('tl2')->default(0);
            $table->integer('tl3')->default(0);
            $table->integer('psw1')->default(0);
            $table->integer('psw2')->default(0);
            $table->integer('psw3')->default(0);
            $table->integer('psw4')->default(0);
            $table->integer('total')->default(0);
            $table->string('sumber');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pelanggaran_riwayat');
        Schema::dropIfExists('pelanggaran');
    }
};