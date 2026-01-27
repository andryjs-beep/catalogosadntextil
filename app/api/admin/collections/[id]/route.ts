/**
 * API Route: Colección individual (Super-Admin)
 * GET /api/admin/collections/[id] - Obtener colección
 * PUT /api/admin/collections/[id] - Actualizar colección
 * DELETE /api/admin/collections/[id] - Eliminar colección
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection, TenantCollection } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { collectionSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Obtener colección por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const collection = await Collection.findById(id)
            .populate('productIds', 'name images tags')
            .lean();

        if (!collection) {
            return NextResponse.json(
                { error: 'Colección no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ collection });
    } catch (error) {
        console.error('Error obteniendo colección:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener colección' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar colección
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Validar entrada
        const result = collectionSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verificar slug único (excluyendo la colección actual)
        const existingCollection = await Collection.findOne({
            slug: result.data.slug,
            _id: { $ne: id },
        });
        if (existingCollection) {
            return NextResponse.json(
                { error: 'Ya existe una colección con ese slug' },
                { status: 400 }
            );
        }

        const collection = await Collection.findByIdAndUpdate(
            id,
            result.data,
            { new: true, runValidators: true }
        )
            .populate('productIds', 'name images')
            .lean();

        if (!collection) {
            return NextResponse.json(
                { error: 'Colección no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ collection });
    } catch (error) {
        console.error('Error actualizando colección:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al actualizar colección' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar colección
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;

        // Eliminar también las asignaciones a tenants
        await TenantCollection.deleteMany({ collectionId: id });

        const collection = await Collection.findByIdAndDelete(id);

        if (!collection) {
            return NextResponse.json(
                { error: 'Colección no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando colección:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al eliminar colección' },
            { status: 500 }
        );
    }
}
