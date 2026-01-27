/**
 * API Route: Sesión actual
 * GET /api/auth/session
 * Devuelve información de la sesión actual
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error obteniendo sesión:', error);
        return NextResponse.json(
            { isAuthenticated: false },
            { status: 200 }
        );
    }
}
