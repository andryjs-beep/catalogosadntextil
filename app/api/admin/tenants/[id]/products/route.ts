/**
 * API Route: Gestión de personalización de productos por el Super-Admin
 * GET /api/admin/tenants/[id]/products - Obtener productos y personalizaciones del tenant
 * PUT /api/admin/tenants/[id]/products - Actualizar personalización de un producto
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TenantProduct, TenantCollection, Collection, Product, Tenant } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';
import { tenantProductSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Listar productos y sus personalizaciones para un tenant específico
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id: tenantId } = await params;

        // Verificar tenant existe
        const tenant = await Tenant.findById(tenantId).lean();
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        // Obtener colecciones asignadas al tenant
        const tenantCollections = await TenantCollection.find({ tenantId }).lean();
        if (tenantCollections.length === 0) {
            return NextResponse.json({ products: [] });
        }

        const collectionIds = tenantCollections.map((tc: any) => tc.collectionId.toString());

        // Obtener productos de esas colecciones
        const collections = await Collection.find({
            _id: { $in: collectionIds },
        }).lean();

        const productIds = collections.flatMap((c: any) => c.productIds.map((pid: any) => pid.toString()));
        const uniqueProductIds = [...new Set(productIds)];

        if (uniqueProductIds.length === 0) {
            return NextResponse.json({ products: [] });
        }

        const products = await Product.find({
            _id: { $in: uniqueProductIds },
        }).lean();

        // Obtener personalizaciones existentes
        const customizations = await TenantProduct.find({ tenantId }).lean();
        const customizationMap = new Map(
            customizations.map((c: any) => [c.productId.toString(), c])
        );

        const productsWithCustom = products.map((p: any) => ({
            ...p,
            customization: customizationMap.get(p._id.toString()) || null,
        }));

        return NextResponse.json({ products: productsWithCustom });
    } catch (error) {
        console.error('Error en GET Super Admin Products:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// PUT: Actualizar personalización de producto (Super-Admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { id: tenantId } = await params;
        const body = await request.json();

        const result = tenantProductSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 400 });
        }

        const { productId, ...customData } = result.data;

        // Upsert personalización
        const customization = await TenantProduct.findOneAndUpdate(
            { tenantId, productId },
            { ...customData, tenantId, productId },
            { new: true, upsert: true }
        ).lean();

        return NextResponse.json({ customization });
    } catch (error) {
        console.error('Error en PUT Super Admin Products:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
