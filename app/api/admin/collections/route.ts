/**
 * API Route: Colecciones (Super-Admin)
 * GET /api/admin/collections - Listar colecciones
 * POST /api/admin/collections - Crear colección
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { collectionSchema } from '@/lib/validations';

// GET: Listar colecciones
export async function GET(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const skip = (page - 1) * limit;

        const [collections, total] = await Promise.all([
            Collection.find()
                .populate('productIds', 'name images')
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Collection.countDocuments(),
        ]);

        return NextResponse.json({
            collections,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error listando colecciones:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener colecciones' },
            { status: 500 }
        );
    }
}

// POST: Crear colección
export async function POST(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const body = await request.json();

        // Validar entrada
        const result = collectionSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verificar slug único
        const existingCollection = await Collection.findOne({ slug: result.data.slug });
        if (existingCollection) {
            return NextResponse.json(
                { error: 'Ya existe una colección con ese slug' },
                { status: 400 }
            );
        }

        const collection = await Collection.create(result.data);

        return NextResponse.json({ collection }, { status: 201 });
    } catch (error) {
        console.error('Error creando colección:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al crear colección' },
            { status: 500 }
        );
    }
}
