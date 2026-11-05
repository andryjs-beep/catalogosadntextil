/**
 * API Route: Configuración del Modo Revendedor
 * GET/PUT /api/admin/tenants/[id]/reseller
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';

// GET - Obtener configuración de revendedor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const tenant = await Tenant.findById(id).select('resellerConfig slug').lean();

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            resellerConfig: (() => {
                const r = (tenant as any).resellerConfig || {};
                return {
                    enabled: r.enabled ?? false,
                    slug: r.slug || '',
                    whatsappNumber: r.whatsappNumber || '',
                    headerTitle: r.headerTitle || 'Catálogo Online',
                    headerSubtitle: r.headerSubtitle || 'Encuentra los mejores productos',
                    hideLogo: r.hideLogo ?? true,
                    hideBusinessName: r.hideBusinessName ?? true,
                    hideSocialLinks: r.hideSocialLinks ?? true,
                    footerText: r.footerText || '© Catálogo Online',
                    shareImage: r.shareImage || '',
                    resellers: r.resellers || [],
                    primaryColor: r.primaryColor || '#25D366',
                    buttonText: r.buttonText || 'Pedir por WhatsApp',
                    buttonSubtext: r.buttonSubtext || '¡Hazlo realidad!',
                    ctaText: r.ctaText || 'Hacer mi pedido ahora',
                    badgeText: r.badgeText || 'Diseño Disponible',
                    whatsappMessage: r.whatsappMessage || '',
                    trustBadge1: r.trustBadge1 ?? '✅ Respuesta en minutos',
                    trustBadge2: r.trustBadge2 ?? '🔒 Pago seguro',
                    trustBadge3: r.trustBadge3 ?? '🚚 Envío rápido',
                    step1Title: r.step1Title || 'Captura el diseño',
                    step1Desc: r.step1Desc || 'Navega por el catálogo y toma captura del diseño que más te guste.',
                    step2Title: r.step2Title || 'Dinos cuánto',
                    step2Desc: r.step2Desc || 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.',
                    step3Title: r.step3Title || 'Espera el envío',
                    step3Desc: r.step3Desc || 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.',
                };
            })(),
            tenantSlug: (tenant as any).slug,
        });
    } catch (error) {
        console.error('Error fetching reseller config:', error);
        return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
    }
}

// PUT - Actualizar configuración de revendedor
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Validar slug único si se proporciona
        if (body.slug) {
            const existing = await Tenant.findOne({
                'resellerConfig.slug': body.slug,
                _id: { $ne: id },
            });

            if (existing) {
                return NextResponse.json(
                    { error: 'Este slug de revendedor ya está en uso' },
                    { status: 400 }
                );
            }
        }

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            {
                $set: {
                    'resellerConfig.enabled': body.enabled ?? false,
                    'resellerConfig.slug': body.slug || '',
                    'resellerConfig.headerTitle': body.headerTitle || 'Catálogo Online',
                    'resellerConfig.headerSubtitle': body.headerSubtitle || '',
                    'resellerConfig.hideLogo': body.hideLogo ?? true,
                    'resellerConfig.hideBusinessName': body.hideBusinessName ?? true,
                    'resellerConfig.hideSocialLinks': body.hideSocialLinks ?? true,
                    'resellerConfig.footerText': body.footerText || '© Catálogo Online',
                    'resellerConfig.shareImage': body.shareImage || '',
                    'resellerConfig.whatsappNumber': body.whatsappNumber || '',
                    'resellerConfig.resellers': Array.isArray(body.resellers) ? body.resellers : [],
                    'resellerConfig.primaryColor': body.primaryColor || '#25D366',
                    'resellerConfig.buttonText': body.buttonText || 'Pedir por WhatsApp',
                    'resellerConfig.buttonSubtext': body.buttonSubtext || '¡Hazlo realidad!',
                    'resellerConfig.ctaText': body.ctaText || 'Hacer mi pedido ahora',
                    'resellerConfig.badgeText': body.badgeText || 'Diseño Disponible',
                    'resellerConfig.whatsappMessage': body.whatsappMessage || '',
                    'resellerConfig.trustBadge1': body.trustBadge1 ?? '✅ Respuesta en minutos',
                    'resellerConfig.trustBadge2': body.trustBadge2 ?? '🔒 Pago seguro',
                    'resellerConfig.trustBadge3': body.trustBadge3 ?? '🚚 Envío rápido',
                    'resellerConfig.step1Title': body.step1Title || 'Captura el diseño',
                    'resellerConfig.step1Desc': body.step1Desc || 'Navega por el catálogo y toma captura del diseño que más te guste.',
                    'resellerConfig.step2Title': body.step2Title || 'Dinos cuánto',
                    'resellerConfig.step2Desc': body.step2Desc || 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.',
                    'resellerConfig.step3Title': body.step3Title || 'Espera el envío',
                    'resellerConfig.step3Desc': body.step3Desc || 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.',
                },
            },
            { new: true }
        );

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Configuración de revendedor actualizada',
            resellerConfig: tenant.resellerConfig,
        });
    } catch (error) {
        console.error('Error updating reseller config:', error);
        return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
    }
}
