<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $isAdmin = $request->user()?->role === 'admin';

        return match ($role) {
            'admin' => $isAdmin
                ? $next($request)
                : response()->json([
                    'success' => false,
                    'message' => 'Akses hanya untuk admin.',
                ], 403),
            'not-admin' => $isAdmin
                ? abort(403, 'Admin hanya mengelola daftar anggota sistem.')
                : $next($request),
            default => throw new InvalidArgumentException("Role middleware tidak mendukung parameter [{$role}]."),
        };
    }
}
