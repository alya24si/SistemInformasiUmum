<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->unique();
            $table->string('nama');
            $table->string('pangkat')->nullable();
            $table->string('jabatan');
            $table->string('eselon_iii')->nullable();
            $table->string('bagian');
            $table->string('no_hp'); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('pegawai');
    }
};
