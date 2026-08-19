<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnggaranController;
use App\Http\Controllers\ProgramKerjaController;
// use App\Http\Controllers\AuthController; // ⏳ nanti saat login dibangun

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