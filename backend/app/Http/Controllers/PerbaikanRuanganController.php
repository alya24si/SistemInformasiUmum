<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PerbaikanRuanganController extends Controller
{
    // 1. BACA semua data perbaikan (ikut nama ruangan & kerusakan)
    public function index()
    {
        $data = DB::table('perbaikan_ruangan as p')
            ->join('kerusakan_ruangan as k', 'k.id', '=', 'p.kerusakan_id')
            ->join('ruangan as r', 'r.id', '=', 'k.ruangan_id')
            ->select('p.*', 'r.nama as ruangan', 'k.kerusakan')
            ->orderBy('p.id')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. LIHAT daftar kerusakan yang belum ada tindak lanjut perbaikannya (buat dropdown form)
    public function kerusakanBelumDiperbaiki()
    {
        $data = DB::table('kerusakan_ruangan as k')
            ->join('ruangan as r', 'r.id', '=', 'k.ruangan_id')
            ->select('k.id', 'r.nama as ruangan', 'k.kerusakan')
            ->where('k.status', '!=', 'Selesai')
            ->whereNotIn('k.id', function ($query) {
                $query->select('kerusakan_id')->from('perbaikan_ruangan');
            })
            ->orderBy('k.id')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 3. TAMBAH data perbaikan (otomatis update status kerusakan jadi Diproses)
    public function store(Request $request)
    {
        $request->validate([
            'kerusakan_id'     => 'required|exists:kerusakan_ruangan,id',
            'jenis_perbaikan'  => 'required|string',
            'penanggung_jawab' => 'required|string',
            'tanggal_mulai'    => 'required|date',
            'status'           => 'nullable|in:Diproses,Selesai',
        ]);

        $id = DB::table('perbaikan_ruangan')->insertGetId([
            'kerusakan_id'     => $request->kerusakan_id,
            'jenis_perbaikan'  => $request->jenis_perbaikan,
            'penanggung_jawab' => $request->penanggung_jawab,
            'tanggal_mulai'    => $request->tanggal_mulai,
            'status'           => $request->status ?? 'Diproses',
        ]);

        DB::table('kerusakan_ruangan')->where('id', $request->kerusakan_id)->update([
            'status' => 'Diproses',
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 4. TANDAI selesai (ikut update status kerusakan jadi Selesai)
    public function selesai($id)
    {
        $perbaikan = DB::table('perbaikan_ruangan')->where('id', $id)->first();

        if (! $perbaikan) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('perbaikan_ruangan')->where('id', $id)->update(['status' => 'Selesai']);
        DB::table('kerusakan_ruangan')->where('id', $perbaikan->kerusakan_id)->update(['status' => 'Selesai']);

        return response()->json(['success' => true]);
    }

    // 5. HAPUS data
    public function destroy($id)
    {
        DB::table('perbaikan_ruangan')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
