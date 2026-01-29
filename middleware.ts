import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000';
    const pathname = request.nextUrl.pathname;

    // Excluir archivos estáticos, APIs, y rutas de admin
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/client-admin') ||
        pathname.startsWith('/login') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Extraer subdomain
    let subdomain = '';

    // En desarrollo local con localhost
    if (host.includes('localhost')) {
        const parts = host.split('.');
        if (parts.length > 1 && parts[0] !== 'www') {
            subdomain = parts[0];
        }
    } else {
        // En producción: subdomain.catalogo.dpdns.org
        // Si el host es diferente al baseDomain, asumimos que la primera parte es el subdomain
        if (host !== baseDomain && host.endsWith(baseDomain)) {
            subdomain = host.replace(`.${baseDomain}`, '');
        }
    }

    // Subdomains reservados
    const reservedSubdomains = ['admin', 'www', 'api', 'app'];

    // Si no hay subdomain o es reservado, continuar normalmente
    if (!subdomain || reservedSubdomains.includes(subdomain)) {
        return NextResponse.next();
    }

    // Evitar rewrites infinitos
    if (pathname.startsWith('/t/')) {
        return NextResponse.next();
    }

    // Rewrite a la ruta interna de tenant
    const url = request.nextUrl.clone();
    url.pathname = `/t/${subdomain}${pathname}`;

    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
