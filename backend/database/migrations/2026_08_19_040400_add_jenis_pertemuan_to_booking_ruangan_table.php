<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_ruangan', function (Blueprint $table) {
            $table->enum('jenis_pertemuan', ['Online', 'Offline'])->default('Offline')->after('kegiatan');
        });
    }

    public function down(): void
    {
        Schema::table('booking_ruangan', function (Blueprint $table) {
            $table->dropColumn('jenis_pertemuan');
        });
    }
};
