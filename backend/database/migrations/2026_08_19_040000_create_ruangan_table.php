<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ruangan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->integer('kapasitas');
            $table->string('lokasi');
            $table->string('fasilitas');
            $table->enum('status', ['Tersedia', 'Digunakan', 'Maintenance'])->default('Tersedia');
            $table->boolean('bisa_dibooking')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('ruangan');
    }
};
