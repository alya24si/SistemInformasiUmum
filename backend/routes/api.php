<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AnggaranController;
use App\Http\Controllers\BookingRuanganController;
use App\Http\Controllers\KerusakanRuanganController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PerbaikanRuanganController;
use App\Http\Controllers\ProgramKerjaController;
use App\Http\Controllers\RuanganController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PelanggaranController;
use App\Http\Controllers\AuthController;



// ===== Keuangan =====
// ===== API ANGGARAN =====
Route::get('/anggaran', [AnggaranController::class, 'index']);
Route::post('/anggaran', [AnggaranController::class, 'store']);
Route::put('/anggaran/{id}/pagu', [AnggaranController::class, 'updatePagu']);
Route::post('/anggaran/{id}/realisasi', [AnggaranController::class, 'tambahRealisasi']);
Route::delete('/anggaran/{id}', [AnggaranController::class, 'destroy']);
Route::get('/anggaran/{id}/realisasi', [AnggaranController::class, 'riwayatRealisasi']);

// ===== API PROGRAM KERJA =====
Route::get('/program_kerja', [ProgramKerjaController::class, 'index']);
Route::post('/program_kerja', [ProgramKerjaController::class, 'store']);
Route::put('/program_kerja/{id}/realisasi', [ProgramKerjaController::class, 'updateRealisasi']);
Route::delete('/program_kerja/{id}', [ProgramKerjaController::class, 'destroy']);

// NANTI, kalau login sudah dibangun, tambahkan baris ini:
// Route::post('/login', [AuthController::class, 'login']);

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

// ===== Kepegawaian =====
// ===== API PEGAWAI =====
Route::get('/pegawai', [PegawaiController::class, 'index']);
Route::post('/pegawai', [PegawaiController::class, 'store']);
Route::post('/pegawai/import', [PegawaiController::class, 'import']);
Route::put('/pegawai/{id}', [PegawaiController::class, 'update']);
Route::delete('/pegawai/{id}', [PegawaiController::class, 'destroy']);

// ===== API ABSENSI =====
Route::get('/absensi', [AbsensiController::class, 'index']);
Route::get('/absensi/alpa-berturut', [AbsensiController::class, 'alpaBerturut']);
Route::post('/absensi', [AbsensiController::class, 'store']);
Route::post('/absensi/import', [AbsensiController::class, 'import']);
Route::put('/absensi/{id}', [AbsensiController::class, 'update']);
Route::delete('/absensi/{id}', [AbsensiController::class, 'destroy']);

// ===== API pelanggaran =====
Route::get('/pelanggaran', [PelanggaranController::class, 'index']);
Route::post('/pelanggaran/import', [PelanggaranController::class, 'import']);
Route::delete('/pelanggaran/{id}', [PelanggaranController::class, 'destroy']);
Route::post('/pelanggaran/tambah-pegawai', [PelanggaranController::class, 'tambahPegawai']);



// ===== Login =====
Route::post('/login', [AuthController::class, 'login']);