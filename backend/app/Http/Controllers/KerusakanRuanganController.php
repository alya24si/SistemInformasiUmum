<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KerusakanRuanganController extends Controller
{
    // 1. BACA semua data (ikut nama ruangan)
    public function index()
    {
        $data = DB::table('kerusakan_ruangan as k')
            ->join('ruangan as r', 'r.id', '=', 'k.ruangan_id')
            ->select('k.*', 'r.nama as ruangan')
            ->orderBy('k.id')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. LAPOR kerusakan baru (wajib lampir bukti gambar)
    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'pelapor'    => 'required|string',
            'bagian'     => 'nullable|string',
            'kerusakan'  => 'required|string',
            'deskripsi'  => 'nullable|string',
            'bukti'      => 'required|image|max:2048',
            'sumber'     => 'required|in:Laporan Pegawai,Pemeriksaan Admin',
            'status'     => 'nullable|in:Menunggu,Diproses,Selesai',
        ]);

        $path = $request->file('bukti')->store('bukti_kerusakan', 'public');

        $id = DB::table('kerusakan_ruangan')->insertGetId([
            'ruangan_id' => $request->ruangan_id,
            'pelapor'    => $request->pelapor,
            // fallback "-" kalau bagian kosong/null (misal superadmin yang
            // gak punya bidang), biar gak kena error NOT NULL di database
            'bagian'     => $request->bagian ?: '-',
            'tanggal'    => now()->toDateString(),
            'kerusakan'  => $request->kerusakan,
            'deskripsi'  => $request->deskripsi,
            'bukti'      => $path,
            'status'     => $request->status ?? 'Menunggu',
            'sumber'     => $request->sumber,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH status jadi Diproses
    public function proses($id)
    {
        DB::table('kerusakan_ruangan')->where('id', $id)->update(['status' => 'Diproses']);
        return response()->json(['success' => true]);
    }

    // 4. UBAH status jadi Selesai
    public function selesai($id)
    {
        DB::table('kerusakan_ruangan')->where('id', $id)->update(['status' => 'Selesai']);
        return response()->json(['success' => true]);
    }

    // 5. HAPUS data
    public function destroy($id)
    {
        DB::table('kerusakan_ruangan')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
