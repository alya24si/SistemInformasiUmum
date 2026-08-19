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

    // 2. TAMBAH data (dengan validasi)
    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bidang' => 'required|string',
            'tipe' => 'required|in:utama,detail',
            'kode_akun' => 'required|string',
            'deskripsi' => 'required|string',
            'unit' => 'required|integer|min:1',
            'satuan' => 'required|string',
            'harga_satuan' => 'required|integer|min:0',
        ]);

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

    // 3. UBAH pagu (dengan validasi)
    public function updatePagu(Request $request, $id)
    {
        $request->validate([
            'pagu' => 'required|integer|min:0',
        ]);

        DB::table('anggaran')->where('id', $id)->update([
            'pagu' => (int) $request->pagu,
        ]);
        return response()->json(['success' => true]);
    }

    // 4. TAMBAH realisasi → catat riwayat per bulan + update total
    public function tambahRealisasi(Request $request, $id)
    {
        $request->validate([
            'bulan' => 'required|string',
            'jumlah' => 'required|integer|min:1',
        ]);

        $row = DB::table('anggaran')->where('id', $id)->first();

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        // catat riwayat per bulan
        DB::table('realisasi_anggaran')->insert([
            'anggaran_id' => $id,
            'bulan' => $request->bulan,
            'jumlah' => (int) $request->jumlah,
        ]);

        // update total realisasi
        DB::table('anggaran')->where('id', $id)->update([
            'realisasi' => $row->realisasi + (int) $request->jumlah,
        ]);

        return response()->json(['success' => true]);
    }

    // 5. LIHAT riwayat realisasi per bulan
    public function riwayatRealisasi($id)
    {
        $data = DB::table('realisasi_anggaran')
            ->where('anggaran_id', $id)
            ->orderBy('id')
            ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // 6. HAPUS data
    public function destroy($id)
    {
        DB::table('anggaran')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}