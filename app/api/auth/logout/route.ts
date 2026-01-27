/**
 * API Route: Logout
 * POST/GET /api/auth/logout
 * Elimina la cookie de autenticación
 */
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        await clearAuthCookie();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en logout:', error);
        return NextResponse.json(
            { error: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
}

// GET para permitir logout desde navegador directo
export async function GET() {
    try {
        await clearAuthCookie();
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_DOMAIN ? `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN}` : 'http://localhost:3000'));
    } catch {
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_DOMAIN ? `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN}` : 'http://localhost:3000'));
    }
}
