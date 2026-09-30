<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CekPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = $request->attributes->get('user');

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan login terlebih dahulu.',
            ], 401);
        }

        $daftar = config('permissions')[$user->role] ?? [];

        $punyaHak = in_array('*', $daftar, true) || in_array($permission, $daftar, true);

        if (!$punyaHak) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk melakukan aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}