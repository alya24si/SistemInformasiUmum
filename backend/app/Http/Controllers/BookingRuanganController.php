<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingRuanganController extends Controller
{
    // 1. BACA semua data (ikut nama ruangan)
    public function index()
    {
        $data = DB::table('booking_ruangan as b')
            ->join('ruangan as r', 'r.id', '=', 'b.ruangan_id')
            ->select('b.*', 'r.nama as ruangan')
            ->orderBy('b.id')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. AJUKAN booking baru (dengan validasi + cek bentrok jadwal)
    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'pemesan'    => 'required|string',
            'bagian'     => 'required|string',
            'kegiatan'   => 'required|string',
            'deskripsi'  => 'nullable|string',
            'tanggal'    => 'required|date',
            'mulai'      => 'required',
            'selesai'    => 'required|after:mulai',
        ]);

        if ($this->cekBentrok($request->ruangan_id, $request->tanggal, $request->mulai, $request->selesai)) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan anda ditolak karena ruangan sudah digunakan, silahkan hubungi admin.',
            ], 422);
        }

        $id = DB::table('booking_ruangan')->insertGetId([
            'ruangan_id' => $request->ruangan_id,
            'pemesan'    => $request->pemesan,
            'bagian'     => $request->bagian,
            'kegiatan'   => $request->kegiatan,
            'deskripsi'  => $request->deskripsi,
            'tanggal'    => $request->tanggal,
            'mulai'      => $request->mulai,
            'selesai'    => $request->selesai,
            'status'     => 'Menunggu',
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // 3. SETUJUI booking (cek bentrok sama booking lain yang sudah disetujui)
    public function setujui($id)
    {
        $booking = DB::table('booking_ruangan')->where('id', $id)->first();

        if (! $booking) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $bentrok = $this->cekBentrok(
            $booking->ruangan_id,
            $booking->tanggal,
            $booking->mulai,
            $booking->selesai,
            $id,
            'Disetujui'
        );

        if ($bentrok) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat disetujui karena jadwal bentrok.',
            ], 422);
        }

        DB::table('booking_ruangan')->where('id', $id)->update([
            'status'       => 'Disetujui',
            'alasan_tolak' => null,
        ]);

        return response()->json(['success' => true]);
    }

    // 4. TOLAK booking (wajib isi alasan)
    public function tolak(Request $request, $id)
    {
        $request->validate([
            'alasan_tolak' => 'required|string',
        ]);

        DB::table('booking_ruangan')->where('id', $id)->update([
            'status'       => 'Ditolak',
            'alasan_tolak' => $request->alasan_tolak,
        ]);

        return response()->json(['success' => true]);
    }

    // 5. HAPUS / BATALKAN booking
    public function destroy($id)
    {
        DB::table('booking_ruangan')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // 6. KALENDER: daftar booking yang sudah Disetujui (bisa difilter per tanggal)
    public function kalender(Request $request)
    {
        $query = DB::table('booking_ruangan as b')
            ->join('ruangan as r', 'r.id', '=', 'b.ruangan_id')
            ->select('b.*', 'r.nama as ruangan')
            ->where('b.status', 'Disetujui');

        if ($request->filled('tanggal')) {
            $query->where('b.tanggal', $request->tanggal);
        }

        $data = $query->orderBy('b.tanggal')->orderBy('b.mulai')->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    // helper: cek jadwal bentrok di ruangan & tanggal yang sama
    private function cekBentrok($ruanganId, $tanggal, $mulai, $selesai, $kecualiId = null, $statusFilter = null)
    {
        $query = DB::table('booking_ruangan')
            ->where('ruangan_id', $ruanganId)
            ->where('tanggal', $tanggal)
            ->where('mulai', '<', $selesai)
            ->where('selesai', '>', $mulai);

        if ($statusFilter) {
            $query->where('status', $statusFilter);
        } else {
            $query->where('status', '!=', 'Ditolak');
        }

        if ($kecualiId) {
            $query->where('id', '!=', $kecualiId);
        }

        return $query->exists();
    }
}
