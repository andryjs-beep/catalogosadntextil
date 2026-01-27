/**
 * API Routes para Cliente-Admin
 * Branding, Social, Productos personalizados
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { requireClientAdmin } from '@/lib/auth';
import { brandingSchema } from '@/lib/validations';

// GET: Obtener branding del tenant
export async function GET(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const tenant = await Tenant.findById(session.tenantId).lean() as ITenant | null;

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ branding: tenant.branding });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// PUT: Actualizar branding
export async function PUT(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const result = brandingSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            session.tenantId,
            { branding: result.data },
            { new: true }
        ).lean() as ITenant | null;

        return NextResponse.json({ branding: tenant?.branding });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
