<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PelanggaranController extends Controller
{
    public function index()
    {
        $data = DB::table('pelanggaran')->orderBy('id')->get();
        $riwayat = DB::table('pelanggaran_riwayat')->orderBy('id')->get();

        $data = $data->map(function ($d) use ($riwayat) {
            $d->riwayat = $riwayat->where('pelanggaran_id', $d->id)->values();
            return $d;
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

     public function import(Request $request)
    {
        $rows = $request->input('rows');
        $processed = 0;

        foreach ($rows as $row) {
            $nip = trim($row['nip']);
            
            // 1. Cek apakah pegawai ini sudah punya record pelanggaran
            $existing = DB::table('pelanggaran')->where('nip', $nip)->first();

            if ($existing) {
                // ✅ JIKA SUDAH ADA: Tambahkan kolom detail, TAPI JANGAN sentuh 'total'
                DB::table('pelanggaran')
                    ->where('nip', $nip)
                    ->update([
                        'tk'   => $existing->tk + ($row['tk'] ?? 0),
                        'tl1'  => $existing->tl1 + ($row['tl1'] ?? 0),
                        'tl2'  => $existing->tl2 + ($row['tl2'] ?? 0),
                        'tl3'  => $existing->tl3 + ($row['tl3'] ?? 0),
                        'psw1' => $existing->psw1 + ($row['psw1'] ?? 0),
                        'psw2' => $existing->psw2 + ($row['psw2'] ?? 0),
                        'psw3' => $existing->psw3 + ($row['psw3'] ?? 0),
                        'psw4' => $existing->psw4 + ($row['psw4'] ?? 0),
                        // ❌ 'total' sengaja TIDAK di-update di sini!
                    ]);
                
                $pelanggaran_id = $existing->id;

            } else {
                // ✅ JIKA BELUM ADA: Buat record baru, total = 0 (Admin atur manual)
                $pelanggaran_id = DB::table('pelanggaran')->insertGetId([
                    'nip'   => $nip,
                    'nama'  => $row['nama'],
                    'tk'    => $row['tk'] ?? 0,
                    'tl1'   => $row['tl1'] ?? 0,
                    'tl2'   => $row['tl2'] ?? 0,
                    'tl3'   => $row['tl3'] ?? 0,
                    'psw1'  => $row['psw1'] ?? 0,
                    'psw2'  => $row['psw2'] ?? 0,
                    'psw3'  => $row['psw3'] ?? 0,
                    'psw4'  => $row['psw4'] ?? 0,
                    'total' => 0, // Admin yang menentukan nilai awalnya
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 2. Simpan ke riwayat (history) agar tercatat upload kali ini
            DB::table('pelanggaran_riwayat')->insert([
                'pelanggaran_id' => $pelanggaran_id, // ✅ PAKAI ID, BUKAN NIP!
                'tanggal'        => $row['tanggal'],
                'sumber'         => $row['sumber'],
                'tk'             => $row['tk'] ?? 0,
                'tl1'            => $row['tl1'] ?? 0,
                'tl2'            => $row['tl2'] ?? 0,
                'tl3'            => $row['tl3'] ?? 0,
                'psw1'           => $row['psw1'] ?? 0,
                'psw2'           => $row['psw2'] ?? 0,
                'psw3'           => $row['psw3'] ?? 0,
                'psw4'           => $row['psw4'] ?? 0,
                'total'          => $row['total'] ?? 0, // Simpan total dari excel ke riwayat
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            $processed++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil memproses {$processed} data pelanggaran."
        ]);
    }

    // ✨ BARU: Tambah pegawai baru (akun login di tabel users)
    public function tambahPegawai(Request $request)
    {
        $request->validate([
            'nip'      => 'required|string',
            'nama'     => 'required|string',
            'password' => 'required|min:6',
        ]);

        $sudahAda = DB::table('users')->where('username', $request->nip)->first();
        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'NIP ' . $request->nip . ' sudah terdaftar!',
            ], 400);
        }

        $id = DB::table('users')->insertGetId([
            'username'   => $request->nip,
            'password'   => Hash::make($request->password),
            'nama'       => $request->nama,
            'role'       => 'pegawai',
            'bidang'     => '',
            'nip'        => $request->nip,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'id'      => $id,
            'message' => 'Pegawai baru berhasil ditambahkan: ' . $request->nama,
        ], 201);
    }

     // ✨ BARU: Admin update "Jumlah Pelanggaran" manual
    public function updateJumlah(Request $request, $id)
    {
        $request->validate([
            'jumlah' => 'required|integer|min:0',
        ]);

        // Ambil data lama untuk menghitung selisih penambahan
        $pelanggaran = DB::table('pelanggaran')->where('id', $id)->first();
        $selisih = $request->jumlah - $pelanggaran->total;

        // Update total utama di tabel pelanggaran
        DB::table('pelanggaran')
            ->where('id', $id)
            ->update(['total' => $request->jumlah, 'updated_at' => now()]);

        // ✅ PENTING: Jika admin MENAMBAH menit, catat di riwayat agar muncul di tampilan pegawai!
        if ($selisih > 0) {
            DB::table('pelanggaran_riwayat')->insert([
                'pelanggaran_id' => $id,
                'tanggal'        => now()->format('Y-m-d H:i:s'),
                'sumber'         => 'Penyesuaian Manual Admin',
                'tk'             => 0,
                'tl1'            => 0,
                'tl2'            => 0,
                'tl3'            => 0,
                'psw1'           => 0,
                'psw2'           => 0,
                'psw3'           => 0,
                'psw4'           => 0,
                'total'          => $selisih, // Simpan selisih penambahannya (misal: 30 atau 20)
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('pelanggaran')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}