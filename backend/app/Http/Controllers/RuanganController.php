<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RuanganController extends Controller
{
    // 1. BACA semua data
    public function index()
    {
        $data = DB::table('ruangan')->orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. TAMBAH data (dengan validasi)
    public function store(Request $request)
    {
        $request->validate([
            'nama'      => 'required|string',
            'kapasitas' => 'required|integer|min:1',
            'lokasi'    => 'required|string',
            'fasilitas' => 'required|string',
            'status'    => 'nullable|in:Tersedia,Digunakan,Maintenance',
        ]);

        $id = DB::table('ruangan')->insertGetId([
            'nama'      => $request->nama,
            'kapasitas' => (int) $request->kapasitas,
            'lokasi'    => $request->lokasi,
            'fasilitas' => $request->fasilitas,
            'status'    => $request->status ?? 'Tersedia',
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data (dengan validasi)
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama'      => 'required|string',
            'kapasitas' => 'required|integer|min:1',
            'lokasi'    => 'required|string',
            'fasilitas' => 'required|string',
            'status'    => 'required|in:Tersedia,Digunakan,Maintenance',
        ]);

        $row = DB::table('ruangan')->where('id', $id)->first();

        if (! $row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('ruangan')->where('id', $id)->update([
            'nama'      => $request->nama,
            'kapasitas' => (int) $request->kapasitas,
            'lokasi'    => $request->lokasi,
            'fasilitas' => $request->fasilitas,
            'status'    => $request->status,
        ]);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('ruangan')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
