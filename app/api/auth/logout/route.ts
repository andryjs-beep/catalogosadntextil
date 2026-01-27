/**
 * API Route: Logout
 * POST /api/auth/logout
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
