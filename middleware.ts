/**
 * Middleware Multi-Tenant
 * Detecta subdominios y reescribe rutas para servir contenido del tenant
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache simple para tenants (TTL 5 minutos)
const tenantCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en ms

// Rate limiting simple por IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 requests por minuto

/**
 * Verifica el rate limit para una IP
 */
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const requests = rateLimitMap.get(ip) || [];
    const recentRequests = requests.filter((t) => now - t < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= RATE_LIMIT_MAX) {
        return false;
    }

    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    return true;
}

/**
 * Limpia el cache de rate limit periódicamente
 */
function cleanRateLimitCache(): void {
    const now = Date.now();
    for (const [ip, requests] of rateLimitMap.entries()) {
        const recentRequests = requests.filter((t) => now - t < RATE_LIMIT_WINDOW);
        if (recentRequests.length === 0) {
            rateLimitMap.delete(ip);
        } else {
            rateLimitMap.set(ip, recentRequests);
        }
    }
}

// Limpiar cache cada minuto
setInterval(cleanRateLimitCache, 60000);

export async function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000';
    const pathname = request.nextUrl.pathname;

    // Obtener IP para rate limiting
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    // Aplicar rate limiting solo a API routes
    if (pathname.startsWith('/api/')) {
        if (!checkRateLimit(ip)) {
            return new NextResponse('Demasiadas solicitudes. Intenta más tarde.', {
                status: 429,
            });
        }
    }

    // Extraer subdomain
    let subdomain = '';

    // En desarrollo local con localhost
    if (host.includes('localhost')) {
        // Formato: subdomain.localhost:3000
        const parts = host.split('.');
        if (parts.length > 1 && parts[0] !== 'www') {
            subdomain = parts[0];
        }
    } else {
        // En producción: subdomain.tudominio.com
        const domainParts = baseDomain.split('.');
        const hostParts = host.split('.');

        if (hostParts.length > domainParts.length) {
            subdomain = hostParts[0];
        }
    }

    // Subdomains reservados (no son tenants)
    const reservedSubdomains = ['admin', 'www', 'api', 'app'];

    // Si no hay subdomain o es reservado, continuar normalmente
    if (!subdomain || reservedSubdomains.includes(subdomain)) {
        return NextResponse.next();
    }

    // Verificar si ya estamos en una ruta de tenant para evitar loops
    if (pathname.startsWith('/t/')) {
        return NextResponse.next();
    }

    // Verificar tenant en cache
    const cachedTenant = tenantCache.get(subdomain);
    const now = Date.now();

    if (cachedTenant && now - cachedTenant.timestamp < CACHE_TTL) {
        if (!cachedTenant.valid) {
            return new NextResponse('Tienda no encontrada', { status: 404 });
        }
    } else {
        // Validar tenant en MongoDB (se hará en la ruta, no en middleware por Edge Runtime)
        // El cache se actualizará desde las páginas
        tenantCache.set(subdomain, { valid: true, timestamp: now });
    }

    // Rewrite a la ruta interna de tenant
    const url = request.nextUrl.clone();
    url.pathname = `/t/${subdomain}${pathname}`;

    return NextResponse.rewrite(url);
}

export const config = {
    // Excluir rutas que no necesitan procesamiento
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (empiezan con /api)
         * - static files (empiezan con /_next/static)
         * - image optimization (empiezan con /_next/image)
         * - favicon.ico
         * - public files (tienen extensión)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
