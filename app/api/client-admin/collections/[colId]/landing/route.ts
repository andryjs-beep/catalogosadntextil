import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TenantCollection } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { tenantCollectionSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ colId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session.isAuthenticated || !session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { colId } = await params;
        const body = await request.json();

        await dbConnect();

        // Verificar que la colección pertenece al tenant
        const tc = await TenantCollection.findOne({
            tenantId: session.tenantId,
            collectionId: colId
        });

        if (!tc) {
            return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
        }

        // Actualizar solo los campos de landing y persuasivos
        if (body.persuasiveTextTop !== undefined) tc.persuasiveTextTop = body.persuasiveTextTop;
        if (body.persuasiveTextBottom !== undefined) tc.persuasiveTextBottom = body.persuasiveTextBottom;
        if (body.ctaButtonText !== undefined) tc.ctaButtonText = body.ctaButtonText;
        if (body.isPublished !== undefined) tc.isPublished = body.isPublished;
        if (body.useLandingLayout !== undefined) tc.useLandingLayout = body.useLandingLayout;
        if (body.landingPageSections !== undefined) tc.landingPageSections = body.landingPageSections;

        await tc.save();

        return NextResponse.json({ success: true, collection: tc });
    } catch (error: any) {
        console.error('Error updating client landing:', error);
        return NextResponse.json({ error: 'Error al guardar cambios', details: error.message }, { status: 500 });
    }
}
