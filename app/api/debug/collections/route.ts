/**
 * API Route: Debug collections directly
 * GET /api/debug/collections
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection, TenantCollection } from '@/lib/models';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // IDs de las colecciones del tenant adntextil
        const collectionIds = [
            "69780ebe31d20b99086000be",
            "697815192591e5d9345ba945",
            "697815192591e5d9345ba946",
            "697815192591e5d9345ba947",
            "697ad05829bdfc5843790908",
            "698162cc56e9e4406b839646"
        ];

        // Buscar todas las colecciones con esos IDs
        const collections = await Collection.find({
            _id: { $in: collectionIds }
        }).lean();

        // También verificar TenantCollections
        const tenantCollections = await TenantCollection.find({
            tenantId: "6978e59cc1bb5a761b312217"
        }).lean();

        return NextResponse.json({
            totalCollections: collections.length,
            collections: collections.map((c: any) => ({
                _id: c._id,
                slug: c.slug,
                name: c.name,
                isActive: c.isActive,
            })),
            tenantCollections: tenantCollections.map((tc: any) => ({
                _id: tc._id,
                collectionId: tc.collectionId,
                isPublished: tc.isPublished,
                order: tc.order,
            })),
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
