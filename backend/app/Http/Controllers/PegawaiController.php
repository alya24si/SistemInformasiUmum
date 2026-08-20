<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PegawaiController extends Controller
{
    // 1. BACA semua data
    public function index()
    {
        $data = DB::table('pegawai')->orderBy('nama')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. TAMBAH data (dengan validasi)
    public function store(Request $request)
    {
        $request->validate([
            'nip'     => 'required|string|unique:pegawai,nip',
            'nama'    => 'required|string',
            'jabatan' => 'required|string',
            'bagian'  => 'required|string',
            'no_hp'   => 'required|string',
            'email'   => 'nullable|email',
            'status'  => 'nullable|in:Aktif,Cuti,Tidak Aktif',
        ]);

        $id = DB::table('pegawai')->insertGetId([
            'nip'     => $request->nip,
            'nama'    => $request->nama,
            'jabatan' => $request->jabatan,
            'bagian'  => $request->bagian,
            'no_hp'   => $request->no_hp,
            'email'   => $request->email,
            'status'  => $request->status ?? 'Aktif',
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data (dengan validasi)
    public function update(Request $request, $id)
    {
        $request->validate([
            'nip'     => 'required|string|unique:pegawai,nip,' . $id,
            'nama'    => 'required|string',
            'jabatan' => 'required|string',
            'bagian'  => 'required|string',
            'no_hp'   => 'required|string',
            'email'   => 'nullable|email',
            'status'  => 'required|in:Aktif,Cuti,Tidak Aktif',
        ]);

        $row = DB::table('pegawai')->where('id', $id)->first();

        if (! $row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('pegawai')->where('id', $id)->update([
            'nip'     => $request->nip,
            'nama'    => $request->nama,
            'jabatan' => $request->jabatan,
            'bagian'  => $request->bagian,
            'no_hp'   => $request->no_hp,
            'email'   => $request->email,
            'status'  => $request->status,
        ]);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('pegawai')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
