<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class IuranController extends Controller
{
    public function index()
    {
        $data = DB::table('iuran')->orderBy('nama')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

       public function import(Request $request)
    {
        $rows = $request->input('rows', []);
        $count = 0;

        foreach ($rows as $r) {
            // 1. Bersihkan NIP (hanya ambil angka, hapus spasi/karakter aneh)
            $nip = preg_replace('/[^0-9]/', '', $r['nip'] ?? '');
            
            // 2. Skip baris sampah (JUMLAH, gol 2, dll) jika NIP kurang dari 5 digit
            if (strlen($nip) < 5) {
                continue;
            }

            // 3. Hitung total
            $dpp = (int) ($r['dpp'] ?? 0);
            $bapors = (int) ($r['bapors'] ?? 0);
            $keagamaan = (int) ($r['keagamaan'] ?? 0);
            $total = $dpp + $bapors + $keagamaan;

            // 4. Simpan atau Update dengan aman (updateOrInsert)
            DB::table('iuran')->updateOrInsert(
                ['nip' => $nip], // Cari berdasarkan NIP
                [
                    'nama' => $r['nama'] ?? $nip,
                    'no_hp' => $r['no_hp'] ?? '',
                    'dpp' => $dpp,
                    'bapors' => $bapors,
                    'keagamaan' => $keagamaan,
                    'total' => $total,
                    'status_bayar' => 'belum',
                    'updated_at' => now(),
                ]
            );
            
            $count++;
        }

        // 5. Kembalikan jumlah data yang benar-benar berhasil diproses
        return response()->json([
            'success' => true, 
            'count' => $count,
            'message' => "Berhasil memproses {$count} data pegawai."
        ]);
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

    public function bulanan($id)
    {
        $data = DB::table('iuran_bulanan')
            ->where('iuran_id', $id)
            ->where('tahun', (int) now()->format('Y'))
            ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

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