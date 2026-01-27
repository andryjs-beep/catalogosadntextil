/**
 * API Route: Tenant individual (Super-Admin)
 * GET /api/admin/tenants/[id] - Obtener tenant
 * PUT /api/admin/tenants/[id] - Actualizar tenant
 * DELETE /api/admin/tenants/[id] - Eliminar tenant
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, TenantProduct, User } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { tenantSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Obtener tenant por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const tenant = await Tenant.findById(id).lean();

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        // Obtener usuarios del tenant
        const users = await User.find({ tenantId: id })
            .select('email name role createdAt')
            .lean();

        return NextResponse.json({ tenant, users });
    } catch (error) {
        console.error('Error obteniendo tenant:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener tenant' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar tenant
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Validar entrada
        const result = tenantSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verificar slug único (excluyendo el tenant actual)
        const existingTenant = await Tenant.findOne({
            slug: result.data.slug,
            _id: { $ne: id },
        });
        if (existingTenant) {
            return NextResponse.json(
                { error: 'Ya existe un tenant con ese slug' },
                { status: 400 }
            );
        }

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            result.data,
            { new: true, runValidators: true }
        ).lean();

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ tenant });
    } catch (error) {
        console.error('Error actualizando tenant:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al actualizar tenant' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar tenant y todos sus datos relacionados
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;

        // Eliminar datos relacionados
        await Promise.all([
            TenantCollection.deleteMany({ tenantId: id }),
            TenantProduct.deleteMany({ tenantId: id }),
            User.deleteMany({ tenantId: id }),
        ]);

        const tenant = await Tenant.findByIdAndDelete(id);

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando tenant:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al eliminar tenant' },
            { status: 500 }
        );
    }
}
