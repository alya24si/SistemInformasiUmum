<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PegawaiController extends Controller
{
    // Ubah berbagai format tanggal (dari input form, atau dari file Excel yang
    // diimport) menjadi format 'Y-m-d' yang dipahami MySQL. Kalau gagal dikenali,
    // return null (biar gak bikin insert/update error, tanggal cuma jadi kosong).
    private function normalisasiTanggal($nilai)
    {
        if ($nilai === null || $nilai === '') {
            return null;
        }

        // Kalau Excel nyimpen sebagai serial number (kadang kejadian tergantung
        // format cell di file aslinya), 1 = 31 Desember 1899.
        if (is_numeric($nilai)) {
            try {
                return Carbon::create(1899, 12, 30)->addDays((int) $nilai)->format('Y-m-d');
            } catch (\Throwable $e) {
                return null;
            }
        }

        $nilai = trim((string) $nilai);

        // Coba beberapa format yang paling sering dipakai di file Excel kepegawaian.
        // Format "tahun dulu" (Y-m-d / Y/m/d) dicoba PALING AWAL karena itu format
        // yang dipakai admin -> menghindari risiko salah baca kalau dicoba pakai
        // format tanggal-dulu duluan (misal "2018-12-01" bisa salah kebaca kalau
        // format d-m-Y dicoba lebih dulu).
        $formatDicoba = ['Y-m-d', 'Y/m/d', 'd-m-Y', 'd/m/Y', 'd-m-y', 'd/m/y'];

        foreach ($formatDicoba as $format) {
            $tanggal = \DateTime::createFromFormat($format, $nilai);
            $error = \DateTime::getLastErrors();

            // getLastErrors() bakal ngasih warning kalau ada nilai yang gak masuk
            // akal tapi "dipaksa" jadi valid sama PHP (misal tanggal 2018 dibaca
            // sebagai day karena salah format, terus di-overflow-in jadi tanggal lain
            // yang sekilas kelihatan valid). Kalau ada warning/error, format ini
            // dianggap gak cocok, lanjut coba format berikutnya.
            $adaMasalah = $error && ($error['warning_count'] > 0 || $error['error_count'] > 0);

            if ($tanggal !== false && !$adaMasalah) {
                return $tanggal->format('Y-m-d');
            }
        }

        // Terakhir, coba parse bebas (buat jaga-jaga format lain yang masih wajar)
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
            'tanggal_masuk' => $this->normalisasiTanggal($request->tanggal_masuk),
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
            'data.*.tanggal_masuk' => 'nullable',
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
                'tanggal_masuk' => $this->normalisasiTanggal($baris['tanggal_masuk'] ?? null),
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
