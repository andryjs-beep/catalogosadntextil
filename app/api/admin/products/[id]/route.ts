/**
 * API Route: Producto individual (Super-Admin)
 * GET /api/admin/products/[id] - Obtener producto
 * PUT /api/admin/products/[id] - Actualizar producto
 * DELETE /api/admin/products/[id] - Eliminar producto
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Obtener producto por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener producto' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar producto
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
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

        const product = await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        ).lean();

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al actualizar producto' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar producto
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id } = await params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al eliminar producto' },
            { status: 500 }
        );
    }
}
