import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, User } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';

/**
 * GET: Obtener detalles completos de un tenant
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const tenant = await Tenant.findById(params.id).lean();
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        // Obtener también el email del admin asociado
        const adminUser = await User.findOne({ tenantId: params.id, role: 'client-admin' }).lean() as any;

        return NextResponse.json({
            tenant,
            adminEmail: adminUser?.email || '',
            adminName: adminUser?.name || '',
        });
    } catch (error) {
        console.error('Error obteniendo detalles del tenant:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

/**
 * PATCH: Actualizar configuración del tenant (branding, redes, etc)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const body = await request.json();

        // Actualizar el tenant
        const updatedTenant = await Tenant.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json(updatedTenant);
    } catch (error) {
        console.error('Error actualizando tenant:', error);
        return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
    }
}
