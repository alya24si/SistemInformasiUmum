<?php
namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsensiController extends Controller
{
    // 1. BACA semua data (ikut nama pegawai)
    public function index()
    {
        $data = DB::table('absensi as a')
            ->join('pegawai as p', 'p.id', '=', 'a.pegawai_id')
            ->select('a.*', 'p.nama', 'p.nip')
            ->orderBy('a.tanggal', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. TAMBAH / ISI absensi (1 pegawai cuma boleh 1 baris per tanggal)
    public function store(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal'    => 'required|date',
            'jam_masuk'  => 'nullable',
            'jam_pulang' => 'nullable',
            'status'     => 'required|in:Hadir,Izin,Sakit,Alpa',
        ]);

        $sudahAda = DB::table('absensi')
            ->where('pegawai_id', $request->pegawai_id)
            ->where('tanggal', $request->tanggal)
            ->exists();

        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'Absensi pegawai ini di tanggal tersebut sudah ada.',
            ], 422);
        }

        $id = DB::table('absensi')->insertGetId([
            'pegawai_id' => $request->pegawai_id,
            'tanggal'    => $request->tanggal,
            'jam_masuk'  => $request->jam_masuk,
            'jam_pulang' => $request->jam_pulang,
            'status'     => $request->status,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data absensi
    public function update(Request $request, $id)
    {
        $request->validate([
            'jam_masuk'  => 'nullable',
            'jam_pulang' => 'nullable',
            'status'     => 'required|in:Hadir,Izin,Sakit,Alpa',
        ]);

        DB::table('absensi')->where('id', $id)->update([
            'jam_masuk'  => $request->jam_masuk,
            'jam_pulang' => $request->jam_pulang,
            'status'     => $request->status,
        ]);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('absensi')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // 5. DETEKSI pegawai yang Alpa 3 hari KERJA berturut-turut (Senin-Jumat saja)
    //    Balikin nama, NIP, no HP, tanggal alpa, pesan siap kirim, dan link wa.me
    public function alpaBerturut()
    {
        $pegawaiAktif = DB::table('pegawai')->where('status', 'Aktif')->get();
        $hasil        = [];

        foreach ($pegawaiAktif as $pegawai) {
            // ambil riwayat absensi pegawai ini, urut dari yang PALING BARU,
            // tapi cuma yang tanggalnya jatuh di hari Senin-Jumat
            $riwayat = DB::table('absensi')
                ->where('pegawai_id', $pegawai->id)
                ->orderBy('tanggal', 'desc')
                ->get()
                ->filter(function ($row) {
                    $hari = Carbon::parse($row->tanggal)->dayOfWeekIso; // 1=Senin ... 7=Minggu
                    return $hari >= 1 && $hari <= 5;
                })
                ->take(3)
                ->values();

            // kalau riwayat hari kerjanya belum sampai 3, skip dulu (belum cukup data)
            if ($riwayat->count() < 3) {
                continue;
            }

            // cek: apakah 3-3 nya berstatus Alpa
            $semuaAlpa = $riwayat->every(fn($row) => $row->status === 'Alpa');

            if (! $semuaAlpa) {
                continue;
            }

            $tanggalUrut  = $riwayat->pluck('tanggal')->sort()->values();
            $tanggalMulai = Carbon::parse($tanggalUrut->first())->translatedFormat('d F Y');
            $tanggalAkhir = Carbon::parse($tanggalUrut->last())->translatedFormat('d F Y');

            $pesan = "Kepada {$pegawai->nama} dengan NIP {$pegawai->nip}, "
                . "kamu sudah tidak melakukan absensi dari tanggal {$tanggalMulai} "
                . "sampai {$tanggalAkhir}. Segera lakukan absensi atau akan menerima konsekuensi.";

            $hasil[] = [
                'pegawai_id'   => $pegawai->id,
                'nama'         => $pegawai->nama,
                'nip'          => $pegawai->nip,
                'no_hp'        => $pegawai->no_hp,
                'tanggal_alpa' => $tanggalUrut,
                'pesan'        => $pesan,
                'wa_link'      => 'https://wa.me/' . $this->formatNoHp($pegawai->no_hp) . '?text=' . urlencode($pesan),
            ];
        }

        return response()->json(['success' => true, 'data' => $hasil]);
    }

    // helper: ubah 08xxx jadi 62xxx biar valid buat format link wa.me
    private function formatNoHp($noHp)
    {
        $noHp = preg_replace('/\D/', '', $noHp); // buang semua karakter selain angka

        if (substr($noHp, 0, 1) === '0') {
            $noHp = '62' . substr($noHp, 1);
        }

        return $noHp;
    }
}
