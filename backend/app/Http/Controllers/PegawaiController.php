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

    // 5. IMPORT dari Excel (frontend sudah parse file ke JSON, di sini tinggal disimpan)
    //    NIP yang sama -> data pegawai di-update, NIP baru -> ditambahkan
    public function import(Request $request)
    {
        $request->validate([
            'data'               => 'required|array|min:1',
            'data.*.nip'         => 'required|string',
            'data.*.nama'        => 'required|string',
            'data.*.jabatan'     => 'nullable|string',
            'data.*.bagian'      => 'nullable|string',
            'data.*.no_hp'       => 'nullable|string',
            'data.*.email'       => 'nullable|email',
            'data.*.status'      => 'nullable|in:Aktif,Cuti,Tidak Aktif',
        ]);

        $ditambah = 0;
        $diupdate = 0;
        $dilewati = [];

        foreach ($request->data as $baris) {
            $nip = trim((string) $baris['nip']);

            if ($nip === '' || empty($baris['nama'])) {
                $dilewati[] = $baris;
                continue;
            }

            $payload = [
                'nip'     => $nip,
                'nama'    => $baris['nama'],
                'jabatan' => $baris['jabatan'] ?? '-',
                'bagian'  => $baris['bagian'] ?? '-',
                'no_hp'   => $baris['no_hp'] ?? '-',
                'email'   => $baris['email'] ?? null,
                'status'  => $baris['status'] ?? 'Aktif',
            ];

            $sudahAda = DB::table('pegawai')->where('nip', $nip)->first();

            if ($sudahAda) {
                DB::table('pegawai')->where('nip', $nip)->update($payload);
                $diupdate++;
            } else {
                DB::table('pegawai')->insert($payload);
                $ditambah++;
            }
        }

        return response()->json([
            'success'  => true,
            'ditambah' => $ditambah,
            'diupdate' => $diupdate,
            'dilewati' => count($dilewati),
        ]);
    }
}
