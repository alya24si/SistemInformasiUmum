<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnggaranController extends Controller
{
    // 1. BACA semua data
    public function index()
    {
        $data = DB::table('anggaran')->orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. TAMBAH data baru (pagu = unit x harga_satuan)
    public function store(Request $request)
    {
        $unit = (int) $request->unit;
        $harga = (int) $request->harga_satuan;

        $id = DB::table('anggaran')->insertGetId([
            'tahun' => (int) $request->tahun,
            'bidang' => $request->bidang,
            'tipe' => $request->tipe,
            'kode_akun' => $request->kode_akun,
            'deskripsi' => $request->deskripsi,
            'unit' => $unit,
            'satuan' => $request->satuan,
            'harga_satuan' => $harga,
            'pagu' => $unit * $harga,
            'realisasi' => 0,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH pagu
    public function updatePagu(Request $request, $id)
    {
        DB::table('anggaran')->where('id', $id)->update([
            'pagu' => (int) $request->pagu,
        ]);
        return response()->json(['success' => true]);
    }

    // 4. TAMBAH realisasi (menumpuk ke realisasi lama)
    public function tambahRealisasi(Request $request, $id)
    {
        $row = DB::table('anggaran')->where('id', $id)->first();

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('anggaran')->where('id', $id)->update([
            'realisasi' => $row->realisasi + (int) $request->jumlah,
        ]);
        return response()->json(['success' => true]);
    }

    // 5. HAPUS data
    public function destroy($id)
    {
        DB::table('anggaran')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}