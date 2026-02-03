'use client';

/**
 * Página de Analytics - Panel Super Admin
 * Muestra estadísticas globales de todos los tenants
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, Eye, MousePointerClick, MessageCircle, RefreshCw, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
    totals: {
        collectionViews: number;
        productViews: number;
        whatsappClicks: number;
        total: number;
    };
    byTenant: Array<{
        tenantId: string;
        tenantSlug: string;
        views: number;
        whatsappClicks: number;
    }>;
    period: {
        days: number;
        startDate: string;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?days=${days}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-blue-600" />
                        Analytics
                    </h1>
                    <p className="text-slate-500">Estadísticas globales de todos los catálogos</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value={7}>Últimos 7 días</option>
                        <option value={30}>Últimos 30 días</option>
                        <option value={60}>Últimos 60 días</option>
                        <option value={90}>Últimos 90 días</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Eventos</p>
                                <p className="text-3xl font-bold text-blue-900">{data?.totals.total.toLocaleString() || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Vistas de Colecciones</p>
                                <p className="text-3xl font-bold text-purple-900">{data?.totals.collectionViews.toLocaleString() || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                                <Eye className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600">Vistas de Productos</p>
                                <p className="text-3xl font-bold text-amber-900">{data?.totals.productViews.toLocaleString() || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                                <MousePointerClick className="h-6 w-6 text-amber-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Clicks WhatsApp</p>
                                <p className="text-3xl font-bold text-green-900">{data?.totals.whatsappClicks.toLocaleString() || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Tenants */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Catálogos</CardTitle>
                    <CardDescription>Los catálogos con más actividad en el período seleccionado</CardDescription>
                </CardHeader>
                <CardContent>
                    {data?.byTenant && data.byTenant.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-slate-600">#</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600">Catálogo</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-600">Vistas Totales</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-600">Clicks WhatsApp</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-600">Conversión</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.byTenant.map((tenant, index) => {
                                        const conversion = tenant.views > 0
                                            ? ((tenant.whatsappClicks / tenant.views) * 100).toFixed(1)
                                            : '0';
                                        return (
                                            <tr key={tenant.tenantId} className="border-b hover:bg-slate-50">
                                                <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <Link
                                                        href={`/admin/tenants/${tenant.tenantId}/settings`}
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        {tenant.tenantSlug}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">{tenant.views.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <MessageCircle className="h-4 w-4" />
                                                        {tenant.whatsappClicks.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(conversion) >= 5
                                                            ? 'bg-green-100 text-green-700'
                                                            : Number(conversion) >= 2
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {conversion}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay datos de analytics en el período seleccionado</p>
                            <p className="text-sm mt-1">Los datos se registran automáticamente cuando los usuarios visitan los catálogos</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
