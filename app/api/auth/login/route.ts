/**
 * API Route: Login
 * POST /api/auth/login
 * Autentica usuarios y devuelve JWT en cookie httpOnly
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIP(request.headers);
        const rateCheck = checkRateLimit(`login:${clientIp}`, {
            limit: 5,
            windowMs: 10 * 60 * 1000,
        });
        if (!rateCheck.success) {
            return NextResponse.json(
                { error: 'Demasiados intentos fallidos. Por seguridad, espera 10 minutos.' },
                { status: 429 }
            );
        }
        await dbConnect();

        const body = await request.json();

        // Validar entrada
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // Buscar usuario
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        // Verificar contraseña
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        // Generar token
        const token = signToken({
            userId: user._id.toString(),
            role: user.role,
            tenantId: user.tenantId?.toString() || null,
        });

        // Establecer cookie
        await setAuthCookie(token);

        // Determinar URL de redirección según rol
        let redirectUrl = '/admin';
        if (user.role === 'client-admin') {
            redirectUrl = '/client-admin';
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            redirectUrl,
        });
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
