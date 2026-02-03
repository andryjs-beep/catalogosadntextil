/**
 * API Route: Configuración del Modo Revendedor
 * GET/PUT /api/admin/tenants/[id]/reseller
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import { requireClientAdmin } from '@/lib/auth';

// GET - Obtener configuración de revendedor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireClientAdmin();
        await dbConnect();

        const { id } = await params;
        const tenant = await Tenant.findById(id).select('resellerConfig slug').lean();

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            resellerConfig: (tenant as any).resellerConfig || {
                enabled: false,
                slug: '',
                headerTitle: 'Catálogo Online',
                headerSubtitle: 'Encuentra los mejores productos',
                hideLogo: true,
                hideBusinessName: true,
                hideSocialLinks: true,
                footerText: '© Catálogo Online',
            },
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
        await requireClientAdmin();
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
