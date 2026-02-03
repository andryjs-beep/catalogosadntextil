/**
 * API Route: Debug full collection
 * GET /api/debug/full-collection/[id]
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const collection = await Collection.findById(id).lean();
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
