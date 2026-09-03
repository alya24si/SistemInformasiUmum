<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IuranController extends Controller
{
    public function index()
    {
        $data = DB::table('iuran')->orderBy('nama')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function import(Request $request)
    {
        foreach ($request->input('rows', []) as $r) {
            $nip = trim($r['nip'] ?? '');
            if (!$nip) continue;

            $dpp    = (int) ($r['dpp'] ?? 0);
            $bapors = (int) ($r['bapors'] ?? 0);

            $keagamaan = (int) ($r['keagamaan'] ?? 0);
            if ($keagamaan === 0) {
                $dkm = (int) ($r['dkm'] ?? 0);
                $pwk = (int) ($r['pwk'] ?? 0);
                $keagamaan = $dkm > 0 ? $dkm : $pwk;
            }

            $total = $dpp + $bapors + $keagamaan;

            $ada = DB::table('iuran')->where('nip', $nip)->first();

            if ($ada) {
                DB::table('iuran')->where('id', $ada->id)->update([
                    'nama' => $r['nama'] ?: $ada->nama,
                    'no_hp' => $r['no_hp'] ?: $ada->no_hp,
                    'dpp' => $dpp,
                    'bapors' => $bapors,
                    'keagamaan' => $keagamaan,
                    'total' => $total,
                ]);
            } else {
                DB::table('iuran')->insert([
                    'nip' => $nip,
                    'nama' => $r['nama'] ?: $nip,
                    'no_hp' => $r['no_hp'] ?? '',
                    'dpp' => $dpp,
                    'bapors' => $bapors,
                    'keagamaan' => $keagamaan,
                    'total' => $total,
                    'status_bayar' => 'belum',
                ]);
            }
        }
        return response()->json(['success' => true]);
    }

    public function store(Request $request)
    {
        $request->validate(['nip' => 'required', 'nama' => 'required']);

        if (DB::table('iuran')->where('nip', $request->nip)->first()) {
            return response()->json(['success' => false, 'message' => 'NIP sudah terdaftar!'], 400);
        }

        DB::table('iuran')->insert([
            'nip' => $request->nip,
            'nama' => $request->nama,
            'no_hp' => $request->no_hp ?? '',
            'dpp' => 0,
            'bapors' => 0,
            'keagamaan' => 0,
            'total' => 0,
            'status_bayar' => $request->status_bayar ?? 'belum',
        ]);
        return response()->json(['success' => true], 201);
    }

    public function update(Request $request, $id)
    {
        $dpp       = (int) ($request->dpp ?? 0);
        $bapors    = (int) ($request->bapors ?? 0);
        $keagamaan = (int) ($request->keagamaan ?? 0);

        DB::table('iuran')->where('id', $id)->update([
            'nama' => $request->nama,
            'no_hp' => $request->no_hp ?? '',
            'dpp' => $dpp,
            'bapors' => $bapors,
            'keagamaan' => $keagamaan,
            'total' => $dpp + $bapors + $keagamaan,
            'status_bayar' => $request->status_bayar ?? 'belum',
        ]);
        return response()->json(['success' => true]);
    }

    // ✨ Ambil status 12 bulan untuk popup Kelola
    public function bulanan($id)
    {
        $data = DB::table('iuran_bulanan')
            ->where('iuran_id', $id)
            ->where('tahun', (int) now()->format('Y'))
            ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    
    // ✨ Toggle status bulan (sudah/belum) + AUTO update status utama
    public function updateBulan(Request $request, $id)
    {
        $request->validate([
            'bulan' => 'required|string',
            'status' => 'required|in:sudah,belum',
        ]);

        $tahun = (int) ($request->tahun ?? now()->format('Y'));

        $ada = DB::table('iuran_bulanan')
            ->where('iuran_id', $id)
            ->where('tahun', $tahun)
            ->where('bulan', $request->bulan)
            ->first();

        if ($ada) {
            DB::table('iuran_bulanan')->where('id', $ada->id)->update(['status' => $request->status]);
        } else {
            DB::table('iuran_bulanan')->insert([
                'iuran_id' => $id,
                'tahun' => $tahun,
                'bulan' => $request->bulan,
                'status' => $request->status,
            ]);
        }

        // ✨ AUTO SYNC: 12 bulan sudah bayar => "sudah", selain itu => "belum"
        $jumlahSudah = DB::table('iuran_bulanan')
            ->where('iuran_id', $id)
            ->where('tahun', $tahun)
            ->where('status', 'sudah')
            ->count();

        DB::table('iuran')->where('id', $id)->update([
            'status_bayar' => $jumlahSudah >= 12 ? 'sudah' : 'belum',
        ]);

        return response()->json(['success' => true]);
    }

    // ✨ Cek tagihan untuk halaman Pelanggaran pegawai (aktif tiap tanggal 4+)
    public function tagihan($nip)
    {
        if ((int) now()->format('j') < 4) {
            return response()->json(['success' => true, 'ada_tagihan' => false]);
        }

        $iuran = DB::table('iuran')->where('nip', $nip)->first();
        if (!$iuran) {
            return response()->json(['success' => true, 'ada_tagihan' => false]);
        }

        $daftarBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        $tahun = (int) now()->format('Y');
        $bulanBerlalu = array_slice($daftarBulan, 0, (int) now()->format('n'));

        $sudah = DB::table('iuran_bulanan')
            ->where('iuran_id', $iuran->id)
            ->where('tahun', $tahun)
            ->where('status', 'sudah')
            ->pluck('bulan')->toArray();

        $belum = array_values(array_diff($bulanBerlalu, $sudah));

        if (count($belum) === 0) {
            return response()->json(['success' => true, 'ada_tagihan' => false]);
        }

        return response()->json([
            'success' => true,
            'ada_tagihan' => true,
            'nama' => $iuran->nama,
            'belum_bayar' => $belum,
            'total_tagihan' => $iuran->total * count($belum),
        ]);
    }

    // ✨ Data iuran + status 12 bulan milik pegawai (untuk halaman KANG CEPOT pegawai)
public function profil($nip)
{
    $iuran = DB::table('iuran')->where('nip', $nip)->first();
    if (!$iuran) {
        return response()->json(['success' => false, 'message' => 'Data iuran tidak ditemukan'], 404);
    }

    $tahun = (int) now()->format('Y');
    $bulanan = DB::table('iuran_bulanan')
        ->where('iuran_id', $iuran->id)
        ->where('tahun', $tahun)
        ->get();

    return response()->json([
        'success' => true,
        'data' => $iuran,
        'bulanan' => $bulanan,
        'tahun' => $tahun,
    ]);
}

    public function destroy($id)
    {
        DB::table('iuran')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
