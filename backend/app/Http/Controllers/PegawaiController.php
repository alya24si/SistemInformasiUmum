<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PegawaiController extends Controller
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
            'tanggal_masuk' => 'nullable|date',
            'tmt_pangkat'   => 'nullable',
        ]);

        $id = DB::table('pegawai')->insertGetId([
            'nip'        => $request->nip,
            'nama'       => $request->nama,
            'pangkat'    => $request->pangkat,
            'jabatan'    => $request->jabatan,
            'eselon_iii' => $request->eselon_iii,
            'bagian'     => $request->bagian,
            'no_hp'      => $request->no_hp,
            'tanggal_masuk' => $this->normalisasiTanggal($request->tanggal_masuk),
            'tmt_pangkat'   => $this->normalisasiTanggal($request->tmt_pangkat),
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
            'tanggal_masuk' => 'nullable|date',
            'tmt_pangkat'   => 'nullable',
        ]);

        $row = DB::table('pegawai')->where('id', $id)->first();

        if (! $row) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $payload = [
            'nip'        => $request->nip,
            'nama'       => $request->nama,
            'pangkat'    => $request->pangkat,
            'jabatan'    => $request->jabatan,
            'eselon_iii' => $request->eselon_iii,
            'bagian'     => $request->bagian,
            'no_hp'      => $request->no_hp,
        ];

        if ($request->has('tanggal_masuk')) {
            $payload['tanggal_masuk'] = $this->normalisasiTanggal($request->tanggal_masuk);
        }

        if ($request->has('tmt_pangkat')) {
            $payload['tmt_pangkat'] = $this->normalisasiTanggal($request->tmt_pangkat);
        }

        DB::table('pegawai')->where('id', $id)->update($payload);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('pegawai')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
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
            'data.*.tanggal_masuk' => 'nullable',
            'data.*.tmt_pangkat'   => 'nullable',
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

            $sudahAda = DB::table('pegawai')->where('nip', $nip)->first();

            $payload = [
                'nip'        => $nip,
                'nama'       => $baris['nama'],
                'pangkat'    => $baris['pangkat'] ?? null,
                'jabatan'    => $baris['jabatan'] ?? '-',
                'eselon_iii' => $baris['eselon_iii'] ?? null,
                'bagian'     => $baris['bagian'] ?? '-',
                'no_hp'      => $baris['no_hp'] ?? '-',
            ];

            if (array_key_exists('tanggal_masuk', $baris)) {
                $payload['tanggal_masuk'] = $this->normalisasiTanggal($baris['tanggal_masuk']);
            } elseif (!$sudahAda) {
                $payload['tanggal_masuk'] = null;
            }

            if (array_key_exists('tmt_pangkat', $baris) && $baris['tmt_pangkat'] !== null) {
                $payload['tmt_pangkat'] = $this->normalisasiTanggal($baris['tmt_pangkat']);
            } elseif (!$sudahAda) {
                $payload['tmt_pangkat'] = null;
            }

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
