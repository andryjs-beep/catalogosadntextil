import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TenantCollection, Tenant } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.isAuthenticated || !session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        // Obtener info del tenant
        const tenant = await Tenant.findById(session.tenantId).select('slug name').lean();

        const collections = await TenantCollection.find({ tenantId: session.tenantId })
            .populate('collectionId', 'name slug coverImage')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json({ collections, tenant });
    } catch (error) {
        console.error('Error fetching client collections:', error);
        return NextResponse.json({ error: 'Error al obtener colecciones' }, { status: 500 });
    }
}
