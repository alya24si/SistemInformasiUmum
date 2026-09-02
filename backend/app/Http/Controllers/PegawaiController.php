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
            'nip'        => 'required|string|unique:pegawai,nip',
            'nama'       => 'required|string',
            'pangkat'    => 'nullable|string',
            'jabatan'    => 'required|string',
            'eselon_iii' => 'nullable|string',
            'bagian'     => 'required|string',
            'no_hp'      => 'required|string',
        ]);

        $id = DB::table('pegawai')->insertGetId([
            'nip'        => $request->nip,
            'nama'       => $request->nama,
            'pangkat'    => $request->pangkat,
            'jabatan'    => $request->jabatan,
            'eselon_iii' => $request->eselon_iii,
            'bagian'     => $request->bagian,
            'no_hp'      => $request->no_hp,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data (dengan validasi)
    public function update(Request $request, $id)
    {
        $request->validate([
            'nip'        => 'required|string|unique:pegawai,nip,' . $id,
            'nama'       => 'required|string',
            'pangkat'    => 'nullable|string',
            'jabatan'    => 'required|string',
            'eselon_iii' => 'nullable|string',
            'bagian'     => 'required|string',
            'no_hp'      => 'required|string',
        ]);

        $row = DB::table('pegawai')->where('id', $id)->first();

        if (! $row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('pegawai')->where('id', $id)->update([
            'nip'        => $request->nip,
            'nama'       => $request->nama,
            'pangkat'    => $request->pangkat,
            'jabatan'    => $request->jabatan,
            'eselon_iii' => $request->eselon_iii,
            'bagian'     => $request->bagian,
            'no_hp'      => $request->no_hp,
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
    //    Kalau hapus_lama = true, SEMUA data pegawai lama dihapus dulu sebelum data baru dimasukkan
    //    (dikirim admin lewat checkbox di form import, defaultnya false)
    public function import(Request $request)
    {
        $request->validate([
            'data'              => 'required|array|min:1',
            'data.*.nip'        => 'required|string',
            'data.*.nama'       => 'required|string',
            'data.*.pangkat'    => 'nullable|string',
            'data.*.jabatan'    => 'nullable|string',
            'data.*.eselon_iii' => 'nullable|string',
            'data.*.bagian'     => 'nullable|string',
            'data.*.no_hp'      => 'nullable|string',
            'hapus_lama'        => 'nullable|boolean',
        ]);

        $hapusLama = $request->boolean('hapus_lama');
        $dihapus   = 0;

        if ($hapusLama) {
            $dihapus = DB::table('pegawai')->count();
            DB::table('pegawai')->delete();
        }

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
                'nip'        => $nip,
                'nama'       => $baris['nama'],
                'pangkat'    => $baris['pangkat'] ?? null,
                'jabatan'    => $baris['jabatan'] ?? '-',
                'eselon_iii' => $baris['eselon_iii'] ?? null,
                'bagian'     => $baris['bagian'] ?? '-',
                'no_hp'      => $baris['no_hp'] ?? '-',
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
            'success'    => true,
            'hapus_lama' => $hapusLama,
            'dihapus'    => $dihapus,
            'ditambah'   => $ditambah,
            'diupdate'   => $diupdate,
            'dilewati'   => count($dilewati),
        ]);
    }
}
