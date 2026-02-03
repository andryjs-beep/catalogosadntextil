/**
 * API Route: Debug single product by ID
 * GET /api/debug/full-product/[id]
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const product = await Product.findById(id).lean();
        return NextResponse.json(product || { error: 'Not found', id });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
