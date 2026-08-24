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
        $rows = $request->input('rows', []);

        foreach ($rows as $r) {
            $nip = trim($r['nip'] ?? '');
            if (!$nip) continue;

            $ada = DB::table('pelanggaran')->where('nip', $nip)->first();

            if ($ada) {
                DB::table('pelanggaran')->where('id', $ada->id)->update([
                    'nama'  => $r['nama'] ?: $ada->nama,
                    'tk'    => ($r['tk'] ?? 0) ?: $ada->tk,
                    'tl1'   => $ada->tl1 + $r['tl1'],
                    'tl2'   => $ada->tl2 + $r['tl2'],
                    'tl3'   => $ada->tl3 + $r['tl3'],
                    'psw1'  => $ada->psw1 + $r['psw1'],
                    'psw2'  => $ada->psw2 + $r['psw2'],
                    'psw3'  => $ada->psw3 + $r['psw3'],
                    'psw4'  => $ada->psw4 + $r['psw4'],
                    'total' => $ada->total + $r['total'],
                ]);
                $pelanggaranId = $ada->id;
            } else {
                $pelanggaranId = DB::table('pelanggaran')->insertGetId([
                    'nip'   => $nip,
                    'nama'  => $r['nama'] ?: $nip,
                    'tk'    => $r['tk'] ?? 0,
                    'tl1'   => $r['tl1'], 'tl2' => $r['tl2'], 'tl3' => $r['tl3'],
                    'psw1'  => $r['psw1'], 'psw2' => $r['psw2'],
                    'psw3'  => $r['psw3'], 'psw4' => $r['psw4'],
                    'total' => $r['total'],
                ]);
            }

            DB::table('pelanggaran_riwayat')->insert([
                'pelanggaran_id' => $pelanggaranId,
                'tanggal' => $r['tanggal'],
                'tk'    => $r['tk'] ?? 0, 
                'tl1' => $r['tl1'], 'tl2' => $r['tl2'], 'tl3' => $r['tl3'],
                'psw1' => $r['psw1'], 'psw2' => $r['psw2'],
                'psw3' => $r['psw3'], 'psw4' => $r['psw4'],
                'total' => $r['total'],
                'sumber' => $r['sumber'],
            ]);
        }

        return response()->json(['success' => true]);
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

    public function destroy($id)
    {
        DB::table('pelanggaran')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}