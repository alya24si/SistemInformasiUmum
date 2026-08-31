<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (!Schema::hasColumn('pegawai', 'pangkat')) {
                $table->string('pangkat')->nullable()->after('nama');
            }
            if (!Schema::hasColumn('pegawai', 'jabatan')) {
                $table->string('jabatan')->nullable()->after('pangkat');
            }
            if (!Schema::hasColumn('pegawai', 'eselon_iii')) {
                $table->string('eselon_iii')->nullable()->after('jabatan');
            }
            if (!Schema::hasColumn('pegawai', 'bagian')) {
                $table->string('bagian')->nullable()->after('eselon_iii');
            }
            if (!Schema::hasColumn('pegawai', 'no_hp')) {
                $table->string('no_hp')->nullable()->after('bagian');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn(['pangkat', 'jabatan', 'eselon_iii', 'bagian', 'no_hp']);
        });
    }
};