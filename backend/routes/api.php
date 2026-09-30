<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AnggaranController;
use App\Http\Controllers\BookingRuanganController;
use App\Http\Controllers\KerusakanRuanganController;
use App\Http\Controllers\KerusakanMobilController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PerbaikanRuanganController;
use App\Http\Controllers\PerbaikanMobilController;
use App\Http\Controllers\ProgramKerjaController;
use App\Http\Controllers\RuanganController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PelanggaranController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\IuranController;


// ===== Keuangan =====
// ===== API ANGGARAN - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    Route::middleware('permission:anggaran.view')->get('/anggaran', [AnggaranController::class, 'index']);
    Route::middleware('permission:anggaran.create')->post('/anggaran', [AnggaranController::class, 'store']);
    Route::middleware('permission:anggaran.update_pagu')->put('/anggaran/{id}/pagu', [AnggaranController::class, 'updatePagu']);
    Route::middleware('permission:anggaran.input_realisasi')->post('/anggaran/{id}/realisasi', [AnggaranController::class, 'tambahRealisasi']);
    Route::middleware('permission:anggaran.delete')->delete('/anggaran/{id}', [AnggaranController::class, 'destroy']);
    Route::middleware('permission:anggaran.riwayat_view')->get('/anggaran/{id}/realisasi', [AnggaranController::class, 'riwayatRealisasi']);
});

// ===== API PROGRAM KERJA - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    Route::middleware('permission:program_kerja.view')->get('/program_kerja', [ProgramKerjaController::class, 'index']);
    Route::middleware('permission:program_kerja.manage')->post('/program_kerja', [ProgramKerjaController::class, 'store']);
    Route::middleware('permission:program_kerja.manage')->put('/program_kerja/{id}', [ProgramKerjaController::class, 'update']);
    Route::middleware('permission:program_kerja.manage')->delete('/program_kerja/{id}', [ProgramKerjaController::class, 'destroy']);

    // Kegiatan program per bulan
    Route::middleware('permission:program_kerja.kegiatan_manage')->post('/kegiatan_program', [ProgramKerjaController::class, 'storeKegiatan']);
    Route::middleware('permission:program_kerja.kegiatan_manage')->put('/kegiatan_program/{id}', [ProgramKerjaController::class, 'updateKegiatan']);
    Route::middleware('permission:program_kerja.kegiatan_manage')->delete('/kegiatan_program/{id}', [ProgramKerjaController::class, 'destroyKegiatan']);
});

// ===== Rumah Tangga =====
// ===== API RUANGAN =====
Route::get('/ruangan', [RuanganController::class, 'index']);
Route::post('/ruangan', [RuanganController::class, 'store']);
Route::put('/ruangan/{id}', [RuanganController::class, 'update']);
Route::delete('/ruangan/{id}', [RuanganController::class, 'destroy']);

// ===== API BOOKING RUANGAN =====
Route::get('/booking_ruangan', [BookingRuanganController::class, 'index']);
Route::get('/booking_ruangan/kalender', [BookingRuanganController::class, 'kalender']);
Route::post('/booking_ruangan', [BookingRuanganController::class, 'store']);
Route::put('/booking_ruangan/{id}/setujui', [BookingRuanganController::class, 'setujui']);
Route::put('/booking_ruangan/{id}/tolak', [BookingRuanganController::class, 'tolak']);
Route::delete('/booking_ruangan/{id}', [BookingRuanganController::class, 'destroy']);

// ===== API KERUSAKAN RUANGAN =====
Route::get('/kerusakan_ruangan', [KerusakanRuanganController::class, 'index']);
Route::post('/kerusakan_ruangan', [KerusakanRuanganController::class, 'store']);
Route::put('/kerusakan_ruangan/{id}/proses', [KerusakanRuanganController::class, 'proses']);
Route::put('/kerusakan_ruangan/{id}/selesai', [KerusakanRuanganController::class, 'selesai']);
Route::delete('/kerusakan_ruangan/{id}', [KerusakanRuanganController::class, 'destroy']);

// ===== API PERBAIKAN RUANGAN =====
Route::get('/perbaikan_ruangan', [PerbaikanRuanganController::class, 'index']);
Route::get('/perbaikan_ruangan/belum_diperbaiki', [PerbaikanRuanganController::class, 'kerusakanBelumDiperbaiki']);
Route::post('/perbaikan_ruangan', [PerbaikanRuanganController::class, 'store']);
Route::put('/perbaikan_ruangan/{id}/selesai', [PerbaikanRuanganController::class, 'selesai']);
Route::delete('/perbaikan_ruangan/{id}', [PerbaikanRuanganController::class, 'destroy']);

// ===== API KERUSAKAN MOBIL =====
Route::get('/kerusakan_mobil', [KerusakanMobilController::class, 'index']);
Route::post('/kerusakan_mobil', [KerusakanMobilController::class, 'store']);
Route::put('/kerusakan_mobil/{id}/proses', [KerusakanMobilController::class, 'proses']);
Route::put('/kerusakan_mobil/{id}/selesai', [KerusakanMobilController::class, 'selesai']);
Route::delete('/kerusakan_mobil/{id}', [KerusakanMobilController::class, 'destroy']);

// ===== API PERBAIKAN MOBIL =====
Route::get('/perbaikan_mobil', [PerbaikanMobilController::class, 'index']);
Route::get('/perbaikan_mobil/belum_diperbaiki', [PerbaikanMobilController::class, 'kerusakanBelumDiperbaiki']);
Route::post('/perbaikan_mobil', [PerbaikanMobilController::class, 'store']);
Route::put('/perbaikan_mobil/{id}/selesai', [PerbaikanMobilController::class, 'selesai']);
Route::delete('/perbaikan_mobil/{id}', [PerbaikanMobilController::class, 'destroy']);


// ===== Kepegawaian =====

// ===== API PEGAWAI - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    Route::middleware('permission:pegawai.view')->get('/pegawai', [PegawaiController::class, 'index']);
    Route::middleware('permission:pegawai.create')->post('/pegawai', [PegawaiController::class, 'store']);
    Route::middleware('permission:pegawai.import')->post('/pegawai/import', [PegawaiController::class, 'import']);
    Route::middleware('permission:pegawai.update')->put('/pegawai/{id}', [PegawaiController::class, 'update']);
    Route::middleware('permission:pegawai.delete')->delete('/pegawai/{id}', [PegawaiController::class, 'destroy']);
    Route::middleware('permission:pegawai.update')->put('/pegawai/{id}/hapus-masa-kerja', [PegawaiController::class, 'hapusMasaKerja']);
    Route::middleware('permission:pegawai.update')->put('/pegawai/{id}/hapus-tmt-pangkat', [PegawaiController::class, 'hapusTmtPangkat']);
});

// ===== API ABSENSI - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    Route::middleware('permission:absensi.view')->get('/absensi', [AbsensiController::class, 'index']);
    Route::middleware('permission:absensi.view')->get('/absensi/alpa-berturut', [AbsensiController::class, 'alpaBerturut']);
    Route::middleware('permission:absensi.create')->post('/absensi', [AbsensiController::class, 'store']);
    Route::middleware('permission:absensi.import')->post('/absensi/import', [AbsensiController::class, 'import']);
    Route::middleware('permission:absensi.update')->put('/absensi/{id}', [AbsensiController::class, 'update']);
    Route::middleware('permission:absensi.delete')->delete('/absensi/{id}', [AbsensiController::class, 'destroy']);
});

// ===== API PELANGGARAN - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    Route::middleware('permission:pelanggaran.view')->get('/pelanggaran', [PelanggaranController::class, 'index']);
    Route::middleware('permission:pelanggaran.import')->post('/pelanggaran/import', [PelanggaranController::class, 'import']);
    Route::middleware('permission:pelanggaran.delete')->delete('/pelanggaran/{id}', [PelanggaranController::class, 'destroy']);
    Route::middleware('permission:pelanggaran.update_jumlah')->put('/pelanggaran/{id}/jumlah', [PelanggaranController::class, 'updateJumlah']);
    Route::middleware('permission:pelanggaran.tambah_pegawai')->post('/pelanggaran/tambah-pegawai', [PelanggaranController::class, 'tambahPegawai']);
});


// ===== API IURAN (KANG CEPOT) - SECURED =====
Route::middleware(['auth.api'])->group(function () {
    
    // 1. Lihat Daftar Iuran (Khusus Admin Keuangan & Superadmin)
    Route::middleware('permission:iuran.view')->get('/iuran', [IuranController::class, 'index']);

    // 2. Aksi Ubah/Hapus/Import (Khusus Admin Keuangan & Superadmin)
    Route::middleware('permission:iuran.import')->post('/iuran/import', [IuranController::class, 'import']);
    Route::middleware('permission:iuran.create')->post('/iuran', [IuranController::class, 'store']);
    Route::middleware('permission:iuran.update')->put('/iuran/{id}', [IuranController::class, 'update']);
    Route::middleware('permission:iuran.delete')->delete('/iuran/{id}', [IuranController::class, 'destroy']);
    Route::middleware('permission:iuran.kelola_bulanan')->get('/iuran/{id}/bulanan', [IuranController::class, 'bulanan']);
    Route::middleware('permission:iuran.kelola_bulanan')->post('/iuran/{id}/bulanan', [IuranController::class, 'updateBulan']);

    // 3. Lihat Profil Sendiri (Pegawai) - Tidak perlu permission khusus, nanti difilter di controller
    Route::get('/iuran/tagihan/{nip}', [IuranController::class, 'tagihan']);
    Route::get('/iuran/profil/{nip}', [IuranController::class, 'profil']);  // ✨ YANG INI HARUS ADA
});

// ===== Login & Logout =====
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth.api')->post('/logout', [AuthController::class, 'logout']);
