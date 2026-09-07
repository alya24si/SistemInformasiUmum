<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KerusakanMobilController extends Controller
{
    // 1. BACA semua data
    public function index()
    {
        $data = DB::table('kerusakan_mobil')
            ->orderBy('id')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. LAPOR kerusakan baru (wajib lampir bukti gambar)
    public function store(Request $request)
    {
        $request->validate([
            'mobil'      => 'required|string',
            'pelapor'    => 'required|string',
            'bagian'     => 'nullable|string',
            'kerusakan'  => 'required|string',
            'deskripsi'  => 'nullable|string',
            'bukti'      => 'required|image|max:2048',
            'sumber'     => 'required|in:Laporan Pegawai,Pemeriksaan Admin',
            'status'     => 'nullable|in:Menunggu,Diproses,Selesai',
        ]);

        $path = $request->file('bukti')->store('bukti_kerusakan_mobil', 'public');

        $id = DB::table('kerusakan_mobil')->insertGetId([
            'mobil'      => $request->mobil,
            'pelapor'    => $request->pelapor,
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
        DB::table('kerusakan_mobil')->where('id', $id)->update(['status' => 'Diproses']);
        return response()->json(['success' => true]);
    }

    // 4. UBAH status jadi Selesai
    public function selesai($id)
    {
        $kerusakan = DB::table('kerusakan_mobil')->where('id', $id)->first();

        if (! $kerusakan) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('kerusakan_mobil')->where('id', $id)->update(['status' => 'Selesai']);

        $sudahAdaPerbaikan = DB::table('perbaikan_mobil')
            ->where('kerusakan_id', $id)
            ->exists();

        if (! $sudahAdaPerbaikan) {
            DB::table('perbaikan_mobil')->insert([
                'kerusakan_id'     => $id,
                'jenis_perbaikan'  => 'Diselesaikan langsung',
                'penanggung_jawab' => $kerusakan->pelapor ?? '-',
                'tanggal_mulai'    => now()->toDateString(),
                'status'           => 'Selesai',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }

        return response()->json(['success' => true]);
    }

    // 5. HAPUS data
    public function destroy($id)
    {
        DB::table('kerusakan_mobil')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
