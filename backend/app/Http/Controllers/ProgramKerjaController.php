<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramKerjaController extends Controller
{
    public function index()
    {
        $data = DB::table('program_kerja')->orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $id = DB::table('program_kerja')->insertGetId([
            'tahun' => (int) $request->tahun,
            'bidang' => $request->bidang,
            'program' => $request->program,
            'target' => $request->target,
            'realisasi_tw1' => 0,
            'realisasi_tw2' => 0,
            'realisasi_tw3' => 0,
            'realisasi_tw4' => 0,
        ]);
        return response()->json(['success' => true, 'id' => $id], 201);
    }

    public function updateRealisasi(Request $request, $id)
    {
        $kolom = 'realisasi_' . strtolower($request->triwulan);
        DB::table('program_kerja')->where('id', $id)->update([
            $kolom => (int) $request->status,
        ]);
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('program_kerja')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}