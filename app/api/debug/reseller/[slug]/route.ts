/**
 * API Route: Debug reseller data
 * GET /api/debug/reseller/[slug]
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;

        // Buscar tenant por slug de revendedor
        const tenant = await Tenant.findOne({
            'resellerConfig.slug': slug,
        }).lean();

        if (!tenant) {
            // Intentar buscar por slug normal para debug
            const tenantBySlug = await Tenant.findOne({ slug }).lean() as any;
            return NextResponse.json({
                error: 'Tenant no encontrado por resellerConfig.slug',
                searchedSlug: slug,
                tenantByNormalSlug: tenantBySlug ? {
                    _id: tenantBySlug._id,
                    slug: tenantBySlug.slug,
                    resellerConfig: tenantBySlug.resellerConfig,
                } : null,
            });
        }

        // Buscar TenantCollections
        const tenantCollections = await TenantCollection.find({
            tenantId: (tenant as any)._id,
        }).lean();

        // Buscar colecciones
        const collectionIds = tenantCollections.map((tc: any) => tc.collectionId);
        const collections = await Collection.find({
            _id: { $in: collectionIds },
            isActive: true,
        }).lean();

        return NextResponse.json({
            tenant: {
                _id: (tenant as any)._id,
                slug: (tenant as any).slug,
                resellerConfig: (tenant as any).resellerConfig,
                isActive: (tenant as any).isActive,
            },
            tenantCollections: tenantCollections.map((tc: any) => ({
                _id: tc._id,
                tenantId: tc.tenantId,
                collectionId: tc.collectionId,
            })),
            collections: collections.map((c: any) => ({
                _id: c._id,
                slug: c.slug,
                name: c.name,
                isActive: c.isActive,
            })),
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
