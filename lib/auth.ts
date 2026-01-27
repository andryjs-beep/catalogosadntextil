/**
 * Autenticación - Funciones para hash, JWT y sesiones
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { UserRole } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || '';
const COOKIE_NAME = 'auth_token';

function getJwtSecret(): string {
    if (!JWT_SECRET) {
        throw new Error('Por favor define la variable de entorno JWT_SECRET');
    }
    return JWT_SECRET;
}

// Payload del token JWT
export interface TokenPayload {
    userId: string;
    role: UserRole;
    tenantId: string | null;
}

// Sesión del usuario actual
export interface Session extends TokenPayload {
    isAuthenticated: boolean;
}

/**
 * Hashea una contraseña con bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

/**
 * Compara una contraseña con su hash
 */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT con los datos del usuario
 */
export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, getJwtSecret()) as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Establece la cookie de autenticación
 */
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
    });
}

/**
 * Elimina la cookie de autenticación
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Obtiene la sesión actual del usuario desde la cookie
 */
export async function getSession(): Promise<Session> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return {
            isAuthenticated: false,
            userId: '',
            role: 'client-admin',
            tenantId: null,
        };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return {
            isAuthenticated: false,
            userId: '',
            role: 'client-admin',
            tenantId: null,
        };
    }

    return {
        isAuthenticated: true,
        ...payload,
    };
}

/**
 * Verifica si el usuario tiene acceso como super-admin
 */
export async function requireSuperAdmin(): Promise<Session> {
    const session = await getSession();
    if (!session.isAuthenticated || session.role !== 'super-admin') {
        throw new Error('Acceso denegado: se requiere rol super-admin');
    }
    return session;
}

/**
 * Verifica si el usuario tiene acceso como client-admin del tenant especificado
 */
export async function requireClientAdmin(tenantId: string): Promise<Session> {
    const session = await getSession();
    if (!session.isAuthenticated) {
        throw new Error('Acceso denegado: no autenticado');
    }
    if (session.role === 'super-admin') {
        return session; // Super-admin tiene acceso a todo
    }
    if (session.role !== 'client-admin' || session.tenantId !== tenantId) {
        throw new Error('Acceso denegado: no tienes permiso para este tenant');
    }
    return session;
}
