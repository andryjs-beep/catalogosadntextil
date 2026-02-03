/**
 * API Route: Debug products for a collection
 * GET /api/debug/products/[collectionId]
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ collectionId: string }> }
) {
    try {
        await dbConnect();
        const { collectionId } = await params;

        // Buscar todos los productos de esa colección sin filtros
        const allProducts = await Product.find({
            collectionId: collectionId
        }).lean();

        // Buscar productos de esa colección con isActive: true
        const activeProducts = await Product.find({
            collectionId: collectionId,
            isActive: true
        }).lean();

        return NextResponse.json({
            collectionId,
            countAll: allProducts.length,
            countActive: activeProducts.length,
            products: allProducts.map((p: any) => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                isActive: p.isActive,
                collectionId: p.collectionId
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
