/**
 * API Route: Get analytics stats for Super Admin
 * GET /api/admin/analytics - Obtener estadísticas globales
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Analytics, Tenant } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authError = await requireSuperAdmin();
        if (authError) return authError;

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Base query
        const matchQuery: any = {
            timestamp: { $gte: startDate }
        };

        if (tenantId) {
            matchQuery.tenantId = tenantId;
        }

        // Aggregate stats by type
        const statsByType = await Analytics.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Stats by day
        const statsByDay = await Analytics.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Stats by tenant (top 10)
        const statsByTenant = await Analytics.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$tenantId',
                    views: { $sum: 1 },
                    whatsappClicks: {
                        $sum: { $cond: [{ $eq: ['$type', 'whatsapp_click'] }, 1, 0] }
                    }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 }
        ]);

        // Get tenant names
        const tenantIds = statsByTenant.map(s => s._id);
        const tenants = await Tenant.find({ _id: { $in: tenantIds } }).select('slug').lean();
        const tenantMap = tenants.reduce((acc: any, t: any) => {
            acc[t._id.toString()] = t.slug;
            return acc;
        }, {});

        // Format stats by tenant with names
        const formattedByTenant = statsByTenant.map(s => ({
            tenantId: s._id,
            tenantSlug: tenantMap[s._id?.toString()] || 'Desconocido',
            views: s.views,
            whatsappClicks: s.whatsappClicks
        }));

        // Total counts
        const totals = {
            collectionViews: statsByType.find(s => s._id === 'collection_view')?.count || 0,
            productViews: statsByType.find(s => s._id === 'product_view')?.count || 0,
            whatsappClicks: statsByType.find(s => s._id === 'whatsapp_click')?.count || 0,
            total: statsByType.reduce((sum, s) => sum + s.count, 0)
        };

        return NextResponse.json({
            totals,
            byDay: statsByDay,
            byTenant: formattedByTenant,
            period: { days, startDate: startDate.toISOString() }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
