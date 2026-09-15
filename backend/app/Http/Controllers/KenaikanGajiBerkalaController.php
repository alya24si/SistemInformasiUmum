<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KenaikanGajiBerkalaController extends Controller
{
    
    private function normalisasiTanggal($nilai)
    {
        if ($nilai === null || $nilai === '') {
            return null;
        }

        if (is_numeric($nilai)) {
            try {
                return Carbon::create(1899, 12, 30)->addDays((int) $nilai)->format('Y-m-d');
            } catch (\Throwable $e) {
                return null;
            }
        }

        $nilai = trim((string) $nilai);
        $formatDicoba = ['Y-m-d', 'Y/m/d', 'd-m-Y', 'd/m/Y', 'd-m-y', 'd/m/y'];

        foreach ($formatDicoba as $format) {
            $tanggal = \DateTime::createFromFormat($format, $nilai);
            $error = \DateTime::getLastErrors();
            $adaMasalah = $error && ($error['warning_count'] > 0 || $error['error_count'] > 0);

            if ($tanggal !== false && !$adaMasalah) {
                return $tanggal->format('Y-m-d');
            }
        }

        try {
            return Carbon::parse($nilai)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }

    // 1. BACA semua data
    public function index()
    {
        $data = DB::table('kenaikan_gaji_berkala')->orderBy('nama')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. TAMBAH data
    public function store(Request $request)
    {
        $request->validate([
            'nip'         => 'required|string|unique:kenaikan_gaji_berkala,nip',
            'nama'        => 'required|string',
            'pangkat'     => 'nullable|string',
            'jabatan'     => 'required|string',
            'eselon_iii'  => 'nullable|string',
            'bagian'      => 'required|string',
            'no_hp'       => 'nullable|string',
            'tmt_pangkat' => 'nullable|date',
        ]);

        $id = DB::table('kenaikan_gaji_berkala')->insertGetId([
            'nip'         => $request->nip,
            'nama'        => $request->nama,
            'pangkat'     => $request->pangkat,
            'jabatan'     => $request->jabatan,
            'eselon_iii'  => $request->eselon_iii,
            'bagian'      => $request->bagian,
            'no_hp'       => $request->no_hp,
            'tmt_pangkat' => $this->normalisasiTanggal($request->tmt_pangkat),
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data
    public function update(Request $request, $id)
    {
        $request->validate([
            'nip'         => 'required|string|unique:kenaikan_gaji_berkala,nip,' . $id,
            'nama'        => 'required|string',
            'pangkat'     => 'nullable|string',
            'jabatan'     => 'required|string',
            'eselon_iii'  => 'nullable|string',
            'bagian'      => 'required|string',
            'no_hp'       => 'nullable|string',
            'tmt_pangkat' => 'nullable|date',
        ]);

        $row = DB::table('kenaikan_gaji_berkala')->where('id', $id)->first();

        if (! $row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        DB::table('kenaikan_gaji_berkala')->where('id', $id)->update([
            'nip'         => $request->nip,
            'nama'        => $request->nama,
            'pangkat'     => $request->pangkat,
            'jabatan'     => $request->jabatan,
            'eselon_iii'  => $request->eselon_iii,
            'bagian'      => $request->bagian,
            'no_hp'       => $request->no_hp,
            'tmt_pangkat' => $this->normalisasiTanggal($request->tmt_pangkat),
        ]);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('kenaikan_gaji_berkala')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // 5. IMPORT dari Excel -- NIP sama = update, NIP baru = ditambahkan.
    public function import(Request $request)
    {
        $request->validate([
            'data'                  => 'required|array|min:1',
            'data.*.nip'            => 'required|string',
            'data.*.nama'           => 'required|string',
            'data.*.pangkat'        => 'nullable|string',
            'data.*.jabatan'        => 'nullable|string',
            'data.*.eselon_iii'     => 'nullable|string',
            'data.*.bagian'         => 'nullable|string',
            'data.*.no_hp'          => 'nullable|string',
            'data.*.tmt_pangkat'    => 'nullable',
            'hapus_lama'            => 'nullable|boolean',
        ]);

        $hapusLama = $request->boolean('hapus_lama');
        $dihapus   = 0;

        if ($hapusLama) {
            $dihapus = DB::table('kenaikan_gaji_berkala')->count();
            DB::table('kenaikan_gaji_berkala')->delete();
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
                'nip'         => $nip,
                'nama'        => $baris['nama'],
                'pangkat'     => $baris['pangkat'] ?? null,
                'jabatan'     => $baris['jabatan'] ?? '-',
                'eselon_iii'  => $baris['eselon_iii'] ?? null,
                'bagian'      => $baris['bagian'] ?? '-',
                'no_hp'       => $baris['no_hp'] ?? null,
                'tmt_pangkat' => $this->normalisasiTanggal($baris['tmt_pangkat'] ?? null),
            ];

            $sudahAda = DB::table('kenaikan_gaji_berkala')->where('nip', $nip)->first();

            if ($sudahAda) {
                DB::table('kenaikan_gaji_berkala')->where('nip', $nip)->update($payload);
                $diupdate++;
            } else {
                DB::table('kenaikan_gaji_berkala')->insert($payload);
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
