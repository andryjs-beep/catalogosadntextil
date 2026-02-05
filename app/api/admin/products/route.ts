/**
 * API Route: Productos (Super-Admin)
 * GET /api/admin/products - Listar productos
 * POST /api/admin/products - Crear producto
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

// GET: Listar productos con paginación
export async function GET(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Query con búsqueda opcional
        const query = search
            ? { $text: { $search: search } }
            : {};

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error listando productos:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener productos' },
            { status: 500 }
        );
    }
}

// POST: Crear producto
export async function POST(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const body = await request.json();

        // Validar entrada
        const result = productSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const productData = { ...result.data };
        if (!productData.slug) {
            productData.slug = productData.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        const product = await Product.create(productData);

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Error creando producto:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al crear producto' },
            { status: 500 }
        );
    }
}
