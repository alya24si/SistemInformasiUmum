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

        // 2. ISI TABEL PROGRAM KERJA (✨ KOLOM TRIWULAN SUDAH DIHAPUS, SESUAI STRUKTUR TERBARU)
        DB::table('program_kerja')->insert([
            [
                'tahun' => 2026, 
                'bidang' => 'P2', 
                'program' => 'Sosialisasi dan Penyuluhan (Eksternal)', 
                'deskripsi' => 'Program penyuluhan dan sosialisasi kepada masyarakat eksternal.', 
                'target' => '4 Kegiatan'
            ],
            [
                'tahun' => 2026, 
                'bidang' => 'Umum', 
                'program' => 'Penilaian Kinerja Pegawai', 
                'deskripsi' => 'Evaluasi dan penilaian kinerja pegawai secara berkala.', 
                'target' => '4 Triwulan'
            ],
            [
                'tahun' => 2026, 
                'bidang' => 'Fasilitas', 
                'program' => 'Penataan Arsip & Ruang Rapat', 
                'deskripsi' => 'Optimalisasi penggunaan ruang rapat dan penataan arsip kantor.', 
                'target' => '8 Kegiatan'
            ],
            [
                'tahun' => 2026, 
                'bidang' => 'KI', 
                'program' => 'Pemeriksaan Kepabeanan dan Cukai', 
                'deskripsi' => 'Pelaksanaan pemeriksaan dokumen dan fisik barang.', 
                'target' => '5 Laporan'
            ],
        ]);
    }
}