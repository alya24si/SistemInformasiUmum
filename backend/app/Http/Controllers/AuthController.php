<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = DB::table('users')
            ->where('username', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah!',
            ], 401);
        }

        $bidang = $user->bidang;

        if ($user->role === 'pegawai' && $user->nip) {
            $pegawai = DB::table('pegawai')->where('nip', $user->nip)->first();
            if ($pegawai && $pegawai->bagian) {
                $bidang = $pegawai->bagian;
            }
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id'       => $user->id,
                'username' => $user->username,
                'nama'     => $user->nama,
                'role'     => $user->role,
                'bidang'   => $bidang,
                'nip'      => $user->nip,
            ],
        ]);
    }
}
