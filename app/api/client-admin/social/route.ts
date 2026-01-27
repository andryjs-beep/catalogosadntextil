/**
 * API Route: Redes sociales del Cliente
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { requireClientAdmin } from '@/lib/auth';
import { socialLinksSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const tenant = await Tenant.findById(session.tenantId).lean() as ITenant | null;

        return NextResponse.json({ socialLinks: tenant?.socialLinks });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const result = socialLinksSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            session.tenantId,
            { socialLinks: result.data },
            { new: true }
        ).lean() as ITenant | null;

        return NextResponse.json({ socialLinks: tenant?.socialLinks });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
