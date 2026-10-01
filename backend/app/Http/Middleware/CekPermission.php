<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CekPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        // ✨ UBAH CARA MENGAMBIL USER
        $user = $request->attributes->get('user');
        
        // Fallback: coba ambil dari merge jika attributes gagal
        if (!$user && $request->has('authenticated_user')) {
            $user = $request->input('authenticated_user');
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu.',
            ], 401);
        }

        // Debug: Pastikan role terbaca
        // Hapus komentar di bawah ini untuk testing
        /*
        \Log::info('Permission Check:', [
            'user_role' => $user->role,
            'permission_needed' => $permission,
            'permissions_list' => config('permissions.' . $user->role, []),
        ]);
        */

        $daftar = config('permissions')[$user->role] ?? [];

        $punyaHak = in_array('*', $daftar, true) || in_array($permission, $daftar, true);

        if (!$punyaHak) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk melakukan aksi ini. Role: ' . $user->role . ', Permission: ' . $permission,
            ], 403);
        }

        return $next($request);
    }
}