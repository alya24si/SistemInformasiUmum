<?php
namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsensiController extends Controller
{
    // status "tidak absen" (dipakai sebagai default kalau kolom status kosong saat import)
    private const STATUS_TIDAK_HADIR = 'Tanpa Keterangan';

    // status presensi yang dianggap AMAN / tidak perlu ditindaklanjuti WA.
    // Selain daftar ini (apapun status penugasannya: WFO, WFH, ST, Penugasan Lainnya, dll),
    // dianggap bermasalah dan langsung masuk daftar perlu WA walau cuma 1 hari kejadian.
    private const STATUS_PRESENSI_AMAN = ['Hadir Normal', 'Cuti Tahunan', 'ST'];

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
            'pegawai_id'       => 'required|exists:pegawai,id',
            'tanggal'          => 'required|date',
            'jam_masuk'        => 'nullable',
            'jam_pulang'       => 'nullable',
            'status_penugasan' => 'nullable|string',
            'status'           => 'required|string',
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
            'pegawai_id'       => $request->pegawai_id,
            'tanggal'          => $request->tanggal,
            'jam_masuk'        => $request->jam_masuk,
            'jam_pulang'       => $request->jam_pulang,
            'status_penugasan' => $request->status_penugasan,
            'status'           => $request->status,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. UBAH data absensi
    public function update(Request $request, $id)
    {
        $request->validate([
            'jam_masuk'        => 'nullable',
            'jam_pulang'       => 'nullable',
            'status_penugasan' => 'nullable|string',
            'status'           => 'required|string',
        ]);

        DB::table('absensi')->where('id', $id)->update([
            'jam_masuk'        => $request->jam_masuk,
            'jam_pulang'       => $request->jam_pulang,
            'status_penugasan' => $request->status_penugasan,
            'status'           => $request->status,
        ]);

        return response()->json(['success' => true]);
    }

    // 4. HAPUS data
    public function destroy($id)
    {
        DB::table('absensi')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // 5. DETEKSI pegawai yang presensinya bermasalah (bukan cuma "Tanpa Keterangan", tapi
    //    status apapun di luar STATUS_PRESENSI_AMAN, berlaku di semua status penugasan).
    //    Langsung masuk daftar walau cuma 1 hari kejadian (gak perlu berturut-turut).
    //    Balikin nama, NIP, no HP, daftar tanggal bermasalah, pesan siap kirim, dan link wa.me
    public function alpaBerturut()
    {
        $semuaPegawai = DB::table('pegawai')->get();
        $hasil        = [];

        foreach ($semuaPegawai as $pegawai) {
            $bermasalah = DB::table('absensi')
                ->where('pegawai_id', $pegawai->id)
                ->whereNotIn('status', self::STATUS_PRESENSI_AMAN)
                ->orderBy('tanggal')
                ->get();

            // gak ada satupun hari bermasalah -> skip, gak perlu WA
            if ($bermasalah->isEmpty()) {
                continue;
            }

            $tanggalUrut = $bermasalah->pluck('tanggal')->values();

            // detail per tanggal: [{tanggal, status}, ...] biar keliatan
            // status persisnya (Tanpa Keterangan / TL3 / PSW4 / dst), bukan cuma tanggalnya
            $detailAlpa = $bermasalah->map(function ($b) {
                return [
                    'tanggal' => $b->tanggal,
                    'status'  => $b->status,
                ];
            })->values();

            // kumpulan status unik yang bermasalah, misal "Tanpa Keterangan, TL3, PSW4"
            $daftarStatus = $bermasalah->pluck('status')->unique()->implode(', ');

            // cek apakah ada rentetan 3 hari kalender berturut-turut di antara
            // tanggal-tanggal bermasalah (gak harus semua tanggal, cukup 1 rentetan aja)
            $tigaHariBerturut = false;
            $streak           = 1;

            for ($i = 1; $i < $tanggalUrut->count(); $i++) {
                $sebelum = Carbon::parse($tanggalUrut[$i - 1]);
                $sekarang = Carbon::parse($tanggalUrut[$i]);

                if ($sebelum->diffInDays($sekarang) === 1) {
                    $streak++;
                } else {
                    $streak = 1;
                }

                if ($streak >= 3) {
                    $tigaHariBerturut = true;
                    break;
                }
            }

            $tanggalMulai = Carbon::parse($tanggalUrut->first())->translatedFormat('d F Y');
            $tanggalAkhir = Carbon::parse($tanggalUrut->last())->translatedFormat('d F Y');

            $pesan = $tanggalUrut->count() > 1
                ? "Kepada {$pegawai->nama} dengan NIP {$pegawai->nip}, "
                    . "tercatat ada masalah presensi ({$daftarStatus}) pada beberapa tanggal "
                    . "dari {$tanggalMulai} sampai {$tanggalAkhir}. Segera lakukan konfirmasi "
                    . "atau akan menerima konsekuensi."
                : "Kepada {$pegawai->nama} dengan NIP {$pegawai->nip}, "
                    . "tercatat ada masalah presensi ({$daftarStatus}) pada tanggal {$tanggalMulai}. "
                    . "Segera lakukan konfirmasi atau akan menerima konsekuensi.";

            $hasil[] = [
                'pegawai_id'         => $pegawai->id,
                'nama'               => $pegawai->nama,
                'nip'                => $pegawai->nip,
                'no_hp'              => $pegawai->no_hp,
                'tanggal_alpa'       => $tanggalUrut,
                'detail_alpa'        => $detailAlpa,
                'daftar_status'      => $daftarStatus,
                'tiga_hari_berturut' => $tigaHariBerturut,
                'pesan'              => $pesan,
                'wa_link'            => 'https://wa.me/' . $this->formatNoHp($pegawai->no_hp) . '?text=' . urlencode($pesan),
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

    // 6. IMPORT dari Excel (frontend sudah parse file ke JSON, di sini tinggal disimpan)
    //    Pegawai diidentifikasi lewat NIP. Kalau NIP tidak ada di tabel pegawai, baris dilewati.
    //    1 pegawai + 1 tanggal yang sama -> di-update, kombinasi baru -> ditambahkan.
    public function import(Request $request)
    {
        $request->validate([
            'data'                    => 'required|array|min:1',
            'data.*.nip'              => 'required|string',
            'data.*.tanggal'          => 'required|date',
            'data.*.status_penugasan' => 'nullable|string',
            'data.*.status'           => 'nullable|string',
        ]);

        $ditambah = 0;
        $diupdate = 0;
        $dilewati = 0;

        foreach ($request->data as $baris) {
            $nip     = trim((string) $baris['nip']);
            $tanggal = $baris['tanggal'] ?? null;

            if ($nip === '' || ! $tanggal) {
                $dilewati++;
                continue;
            }

            // kalau NIP tidak cocok dengan data pegawai manapun, baris ini dilewati
            $pegawai = DB::table('pegawai')->where('nip', $nip)->first();

            if (! $pegawai) {
                $dilewati++;
                continue;
            }

            $payload = [
                'pegawai_id'       => $pegawai->id,
                'tanggal'          => $tanggal,
                'jam_masuk'        => $baris['jam_masuk'] ?? null,
                'jam_pulang'       => $baris['jam_pulang'] ?? null,
                'status_penugasan' => $baris['status_penugasan'] ?? null,
                'status'           => $baris['status'] ?? self::STATUS_TIDAK_HADIR,
            ];

            $sudahAda = DB::table('absensi')
                ->where('pegawai_id', $pegawai->id)
                ->where('tanggal', $tanggal)
                ->first();

            if ($sudahAda) {
                DB::table('absensi')->where('id', $sudahAda->id)->update($payload);
                $diupdate++;
            } else {
                DB::table('absensi')->insert($payload);
                $ditambah++;
            }
        }

        return response()->json([
            'success'  => true,
            'ditambah' => $ditambah,
            'diupdate' => $diupdate,
            'dilewati' => $dilewati,
        ]);
    }
}
