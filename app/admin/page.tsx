/**
 * Dashboard Super-Admin
 * Muestra resumen de estadísticas
 */
import { Suspense } from 'react';
import dbConnect from '@/lib/db';
import { Product, Collection, Tenant, Analytics } from '@/lib/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderOpen, Store, BarChart3 } from 'lucide-react';

async function getStats() {
    await dbConnect();

    const [productsCount, collectionsCount, tenantsCount, analyticsCount] =
        await Promise.all([
            Product.countDocuments(),
            Collection.countDocuments(),
            Tenant.countDocuments({ isActive: true }),
            Analytics.countDocuments({
                timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            }),
        ]);

    return {
        products: productsCount,
        collections: collectionsCount,
        tenants: tenantsCount,
        events: analyticsCount,
    };
}

function StatsCard({
    title,
    value,
    icon,
    gradient,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
}) {
    return (
        <Card className="overflow-hidden">
            <div className={`h-2 ${gradient}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className="text-slate-400">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                    {value.toLocaleString('es-ES')}
                </div>
            </CardContent>
        </Card>
    );
}

function StatsLoading() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-2 bg-slate-200" />
                    <CardHeader className="pb-2">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-9 w-16 bg-slate-200 rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

async function StatsGrid() {
    const stats = await getStats();

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Productos"
                value={stats.products}
                icon={<Package className="h-5 w-5" />}
                gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatsCard
                title="Colecciones"
                value={stats.collections}
                icon={<FolderOpen className="h-5 w-5" />}
                gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <StatsCard
                title="Clientes Activos"
                value={stats.tenants}
                icon={<Store className="h-5 w-5" />}
                gradient="bg-gradient-to-r from-green-500 to-green-600"
            />
            <StatsCard
                title="Eventos (30d)"
                value={stats.events}
                icon={<BarChart3 className="h-5 w-5" />}
                gradient="bg-gradient-to-r from-amber-500 to-amber-600"
            />
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">
                    Resumen general del sistema de catálogos
                </p>
            </div>

            {/* Stats */}
            <Suspense fallback={<StatsLoading />}>
                <StatsGrid />
            </Suspense>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            Agregar Producto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">
                            Crea nuevos productos con imágenes para tu catálogo
                        </p>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-purple-500" />
                            Nueva Colección
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">
                            Organiza productos en colecciones temáticas
                        </p>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-green-500" />
                            Nuevo Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">
                            Registra un nuevo cliente con subdominio
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
