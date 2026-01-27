/**
 * API Route: Personalización de productos del Cliente
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TenantProduct, TenantCollection, Collection, Product } from '@/lib/models';
import { requireClientAdmin } from '@/lib/auth';
import { tenantProductSchema } from '@/lib/validations';

// GET: Listar productos personalizables
export async function GET() {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        // Obtener colecciones asignadas
        const tenantCollections = await TenantCollection.find({
            tenantId: session.tenantId,
        }).lean();

        console.log(`[API] Tenant: ${session.tenantId}, Collections Found: ${tenantCollections.length}`);

        if (tenantCollections.length === 0) {
            return NextResponse.json({ products: [] });
        }

        const collectionIds = tenantCollections.map((tc: any) => tc.collectionId.toString());

        // Obtener productos de esas colecciones
        const collections = await Collection.find({
            _id: { $in: collectionIds },
        }).lean();

        console.log(`[API] Collections Found: ${collections.length}`);

        const productIds = collections.flatMap((c: any) => c.productIds.map((id: any) => id.toString()));
        const uniqueProductIds = [...new Set(productIds)];

        console.log(`[API] Unique Products Found: ${uniqueProductIds.length}`);

        if (uniqueProductIds.length === 0) {
            return NextResponse.json({ products: [] });
        }

        const products = (await Product.find({
            _id: { $in: uniqueProductIds },
        }).lean()) as any[];

        console.log(`[API] Total Products Fetched: ${products.length}`);

        // Obtener personalizaciones existentes
        const customizations = (await TenantProduct.find({
            tenantId: session.tenantId,
        }).lean()) as any[];

        const customizationMap = new Map(
            customizations.map((c: any) => [c.productId.toString(), c])
        );

        const productsWithCustom = products.map((p: any) => ({
            ...p,
            customization: customizationMap.get(p._id.toString()) || null,
        }));

        return NextResponse.json({ products: productsWithCustom });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// PUT: Actualizar personalización de producto
export async function PUT(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const result = tenantProductSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const { productId, ...customData } = result.data;

        // Upsert personalización
        const customization = await TenantProduct.findOneAndUpdate(
            { tenantId: session.tenantId, productId },
            { ...customData, tenantId: session.tenantId, productId },
            { new: true, upsert: true }
        ).lean();

        return NextResponse.json({ customization });
    } catch (error) {
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
