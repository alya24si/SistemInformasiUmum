<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramKerjaController extends Controller
{
    public function index()
    {
        $programs = DB::table('program_kerja')->orderBy('id')->get();
        $kegiatan = DB::table('kegiatan_program_kerja')->orderBy('id')->get();

        $programs = $programs->map(function ($p) use ($kegiatan) {
            $p->kegiatan = $kegiatan->where('program_kerja_id', $p->id)->values();
            return $p;
        });

        return response()->json(['success' => true, 'data' => $programs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bidang' => 'required|string',
            'program' => 'required|string',
            'deskripsi' => 'nullable|string',
            'target' => 'required|string',
        ]);

        $id = DB::table('program_kerja')->insertGetId([
            'tahun' => (int) $request->tahun,
            'bidang' => $request->bidang,
            'program' => $request->program,
            'deskripsi' => $request->deskripsi,
            'target' => $request->target,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bidang' => 'required|string',
            'program' => 'required|string',
            'deskripsi' => 'nullable|string',
            'target' => 'required|string',
        ]);

        DB::table('program_kerja')->where('id', $id)->update([
            'tahun' => (int) $request->tahun,
            'bidang' => $request->bidang,
            'program' => $request->program,
            'deskripsi' => $request->deskripsi,
            'target' => $request->target,
        ]);

        return response()->json(['success' => true]);
    }

    public function storeKegiatan(Request $request)
    {
        $request->validate([
            'program_kerja_id' => 'required|integer',
            'bulan' => 'required|string',
            'target_anggaran' => 'required|integer|min:0',
            'realisasi' => 'required|integer|min:0',
        ]);

        $id = DB::table('kegiatan_program_kerja')->insertGetId([
            'program_kerja_id' => (int) $request->program_kerja_id,
            'bulan' => $request->bulan,
            'target_anggaran' => (int) $request->target_anggaran,
            'realisasi' => (int) $request->realisasi,
        ]);

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    public function updateKegiatan(Request $request, $id)
    {
        $request->validate([
            'bulan' => 'required|string',
            'target_anggaran' => 'required|integer|min:0',
            'realisasi' => 'required|integer|min:0',
        ]);

        DB::table('kegiatan_program_kerja')->where('id', $id)->update([
            'bulan' => $request->bulan,
            'target_anggaran' => (int) $request->target_anggaran,
            'realisasi' => (int) $request->realisasi,
        ]);

        return response()->json(['success' => true]);
    }

    public function destroyKegiatan($id)
    {
        DB::table('kegiatan_program_kerja')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('program_kerja')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}