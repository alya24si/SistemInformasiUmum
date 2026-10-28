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

            // 🔥 PAKSA HITUNG TOTAL DI BACKEND (Supaya tidak bisa 0 jika ada nilainya)
            $tk = (int)($row['tk'] ?? 0);
            $tl1 = (int)($row['tl1'] ?? 0);
            $tl2 = (int)($row['tl2'] ?? 0);
            $tl3 = (int)($row['tl3'] ?? 0);
            $psw1 = (int)($row['psw1'] ?? 0);
            $psw2 = (int)($row['psw2'] ?? 0);
            $psw3 = (int)($row['psw3'] ?? 0);
            $psw4 = (int)($row['psw4'] ?? 0);

            $total_paksa = $tk + $tl1 + $tl2 + $tl3 + $psw1 + $psw2 + $psw3 + $psw4;

            $existing = DB::table('pelanggaran')->where('nip', $nip)->first();

            if ($existing) {
                DB::table('pelanggaran')
                    ->where('nip', $nip)
                    ->update([
                        'tk'         => $existing->tk + $tk,
                        'tl1'        => $existing->tl1 + $tl1,
                        'tl2'        => $existing->tl2 + $tl2,
                        'tl3'        => $existing->tl3 + $tl3,
                        'psw1'       => $existing->psw1 + $psw1,
                        'psw2'       => $existing->psw2 + $psw2,
                        'psw3'       => $existing->psw3 + $psw3,
                        'psw4'       => $existing->psw4 + $psw4,
                        // 'total' sengaja tidak diubah → nilai hasil input admin tetap aman
                        'updated_at' => now(),
                    ]);
                $pelanggaran_id = $existing->id;
            } else {
                $pelanggaran_id = DB::table('pelanggaran')->insertGetId([
                    'nip'        => $nip,
                    'nama'       => $row['nama'],
                    'tk'         => $tk,
                    'tl1'        => $tl1,
                    'tl2'        => $tl2,
                    'tl3'        => $tl3,
                    'psw1'       => $psw1,
                    'psw2'       => $psw2,
                    'psw3'       => $psw3,
                    'psw4'       => $psw4,
                    'total'      => $total_paksa, // 🔥 PAKSA SIMPAN TOTAL
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('pelanggaran_riwayat')->insert([
                'pelanggaran_id' => $pelanggaran_id,
                'tanggal'        => $row['tanggal'],
                'sumber'         => $row['sumber'],
                'tk'             => $tk,
                'tl1'            => $tl1,
                'tl2'            => $tl2,
                'tl3'            => $tl3,
                'psw1'           => $psw1,
                'psw2'           => $psw2,
                'psw3'           => $psw3,
                'psw4'           => $psw4,
                'total'          => $total_paksa,
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
