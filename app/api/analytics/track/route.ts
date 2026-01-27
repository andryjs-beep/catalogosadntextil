/**
 * API Route: Analytics tracking
 * POST /api/analytics/track - Registrar evento de analytics
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Analytics } from '@/lib/models';
import { trackEventSchema } from '@/lib/validations';

/**
 * Anonimiza una dirección IP (GDPR compliant)
 */
function anonymizeIP(ip: string): string {
    if (!ip || ip === 'unknown') return '';

    // IPv4: reemplazar último octeto con 0
    if (ip.includes('.')) {
        const parts = ip.split('.');
        parts[3] = '0';
        return parts.join('.');
    }

    // IPv6: reemplazar últimos 80 bits con 0
    if (ip.includes(':')) {
        const parts = ip.split(':');
        return parts.slice(0, 4).join(':') + '::0';
    }

    return '';
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Validar entrada
        const result = trackEventSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos' },
                { status: 400 }
            );
        }

        const { tenantId, type, collectionId, productId } = result.data;

        // Obtener metadata
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            '';
        const userAgent = request.headers.get('user-agent') || '';
        const referer = request.headers.get('referer') || '';

        // Crear evento de analytics
        await Analytics.create({
            tenantId,
            type,
            collectionId: collectionId || null,
            productId: productId || null,
            timestamp: new Date(),
            metadata: {
                userAgent: userAgent.substring(0, 500), // Limitar tamaño
                referer: referer.substring(0, 500),
                ipAnonymized: anonymizeIP(ip),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error registrando analytics:', error);
        // No devolver error para no bloquear al usuario
        return NextResponse.json({ success: true });
    }
}
