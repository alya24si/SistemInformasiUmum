<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ISI TABEL ANGGARAN (Sesuai data dummy di Anggaran.jsx)
        DB::table('anggaran')->insert([
            ['tahun' => 2026, 'bidang' => 'P2', 'tipe' => 'utama', 'kode_akun' => '4787.AEF.101', 'deskripsi' => 'Sosialisasi dan Penyuluhan (Eksternal)', 'unit' => 56, 'satuan' => 'Orang', 'harga_satuan' => 798000, 'pagu' => 44688000, 'realisasi' => 9927400],
            ['tahun' => 2026, 'bidang' => 'Umum', 'tipe' => 'detail', 'kode_akun' => '521211', 'deskripsi' => 'KDM - Snack [52 ORANG x 2 KALI x 2 FR]', 'unit' => 208, 'satuan' => 'OK', 'harga_satuan' => 22116, 'pagu' => 4600000, 'realisasi' => 4563400],
            ['tahun' => 2026, 'bidang' => 'Umum', 'tipe' => 'detail', 'kode_akun' => '524111', 'deskripsi' => 'Uang Harian [4 FR x 4 ORANG x 3 HARI]', 'unit' => 48, 'satuan' => 'OH', 'harga_satuan' => 36084, 'pagu' => 1732000, 'realisasi' => 1732000],
            ['tahun' => 2026, 'bidang' => 'KI', 'tipe' => 'utama', 'kode_akun' => '4787.BIG.001', 'deskripsi' => 'Pemeriksaan Kepabeanan dan Cukai', 'unit' => 5, 'satuan' => 'Laporan', 'harga_satuan' => 6619800, 'pagu' => 33099000, 'realisasi' => 30748274],
            ['tahun' => 2026, 'bidang' => 'Fasilitas', 'tipe' => 'utama', 'kode_akun' => '4787.CDE.002', 'deskripsi' => 'Pemeliharaan Gedung dan Bangunan', 'unit' => 12, 'satuan' => 'Kegiatan', 'harga_satuan' => 1500000, 'pagu' => 18000000, 'realisasi' => 7200000],
        ]);

        // 2. ISI TABEL PROGRAM KERJA (Sesuai data dummy di ProgramKerja.jsx)
        DB::table('program_kerja')->insert([
            ['tahun' => 2026, 'bidang' => 'P2', 'program' => 'Sosialisasi dan Penyuluhan (Eksternal)', 'target' => '4 Kegiatan', 'realisasi_tw1' => 100, 'realisasi_tw2' => 100, 'realisasi_tw3' => 0, 'realisasi_tw4' => 0],
            ['tahun' => 2026, 'bidang' => 'Umum', 'program' => 'Penilaian Kinerja Pegawai', 'target' => '4 Triwulan', 'realisasi_tw1' => 100, 'realisasi_tw2' => 100, 'realisasi_tw3' => 100, 'realisasi_tw4' => 100],
            ['tahun' => 2026, 'bidang' => 'Fasilitas', 'program' => 'Penataan Arsip & Ruang Rapat', 'target' => '8 Kegiatan', 'realisasi_tw1' => 0, 'realisasi_tw2' => 0, 'realisasi_tw3' => 0, 'realisasi_tw4' => 0],
            ['tahun' => 2026, 'bidang' => 'KI', 'program' => 'Pemeriksaan Kepabeanan dan Cukai', 'target' => '5 Laporan', 'realisasi_tw1' => 100, 'realisasi_tw2' => 0, 'realisasi_tw3' => 0, 'realisasi_tw4' => 0],
        ]);
    }
}