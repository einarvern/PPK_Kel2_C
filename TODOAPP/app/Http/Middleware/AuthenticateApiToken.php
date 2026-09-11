<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        preg_match('/^Bearer\s+(\S+)$/i', $request->header('Authorization', ''), $matches);

        $token = $matches[1] ?? null;
        $tokenRecord = $token
            ? DB::table('api_tokens')->where('token_hash', hash('sha256', $token))->first()
            : null;
        $user = $tokenRecord
            ? User::query()->where('id', $tokenRecord->user_id)->first()
            : null;

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau belum dikirim.',
            ], 401);
        }

        DB::table('api_tokens')->where('id', $tokenRecord->id)->update([
            'last_used_at' => now(),
            'updated_at' => now(),
        ]);

        $request->setUserResolver(fn () => $user);
        Auth::guard()->setUser($user);
        $request->attributes->set('api_token_id', $tokenRecord->id);

        return $next($request);
    }
}
