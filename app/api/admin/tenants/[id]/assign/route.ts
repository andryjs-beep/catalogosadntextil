/**
 * API Route: Asignar colecciones a tenant (Super-Admin)
 * GET /api/admin/tenants/[id]/assign - Obtener asignaciones
 * PUT /api/admin/tenants/[id]/assign - Actualizar asignaciones
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, Collection, TenantCollection } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { tenantCollectionSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Schema para bulk update de asignaciones
const assignmentsSchema = z.object({
    assignments: z.array(tenantCollectionSchema),
});

// GET: Obtener asignaciones de colecciones del tenant
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;

        // Verificar tenant existe
        const tenant = await Tenant.findById(id).lean();
        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        // Obtener todas las colecciones disponibles
        const allCollections = await Collection.find()
            .select('slug name coverImage productIds order')
            .sort({ order: 1 })
            .lean();

        // Obtener asignaciones del tenant
        const tenantCollections = await TenantCollection.find({ tenantId: id })
            .populate('collectionId', 'slug name coverImage')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json({
            tenant,
            allCollections,
            tenantCollections,
        });
    } catch (error) {
        console.error('Error obteniendo asignaciones:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener asignaciones' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar asignaciones de colecciones
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Verificar tenant existe
        const tenant = await Tenant.findById(id).lean();
        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        // Validar entrada
        const result = assignmentsSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { assignments } = result.data;

        // Eliminar asignaciones anteriores
        await TenantCollection.deleteMany({ tenantId: id });

        // Crear nuevas asignaciones
        if (assignments.length > 0) {
            const newAssignments = assignments.map((a, index) => ({
                tenantId: id,
                collectionId: a.collectionId,
                persuasiveTextTop: a.persuasiveTextTop,
                persuasiveTextBottom: a.persuasiveTextBottom,
                ctaButtonText: a.ctaButtonText,
                isPublished: a.isPublished,
                order: a.order ?? index,
            }));

            await TenantCollection.insertMany(newAssignments);
        }

        // Devolver asignaciones actualizadas
        const tenantCollections = await TenantCollection.find({ tenantId: id })
            .populate('collectionId', 'slug name coverImage')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json({ tenantCollections });
    } catch (error) {
        console.error('Error actualizando asignaciones:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al actualizar asignaciones' },
            { status: 500 }
        );
    }
}
