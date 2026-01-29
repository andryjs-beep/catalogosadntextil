/**
 * Página de entrada del Client-Admin
 */
import Link from 'next/link';
import { Package, Palette, Share2, LayoutTemplate } from 'lucide-react';

export default function ClientAdminPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    ¡Bienvenido a tu Panel!
                </h1>
                <p className="text-slate-600 mt-2">
                    Administra tu catálogo digital desde aquí.
                </p>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/client-admin/products"
                        className="p-6 bg-white rounded-xl border hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                            <Package className="h-6 w-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900">Productos</h3>
                        <p className="text-sm text-slate-500 mt-1">Gestiona tus productos</p>
                    </Link>

                    <Link
                        href="/client-admin/collections"
                        className="p-6 bg-white rounded-xl border hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                            <LayoutTemplate className="h-6 w-6 text-purple-600 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900">Colecciones</h3>
                        <p className="text-sm text-slate-500 mt-1">Tus landings de productos</p>
                    </Link>

                    <Link
                        href="/client-admin/branding"
                        className="p-6 bg-white rounded-xl border hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors">
                            <Palette className="h-6 w-6 text-pink-600 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900">Branding</h3>
                        <p className="text-sm text-slate-500 mt-1">Personaliza tu marca</p>
                    </Link>

                    <Link
                        href="/client-admin/social"
                        className="p-6 bg-white rounded-xl border hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                            <Share2 className="h-6 w-6 text-green-600 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900">Redes Sociales</h3>
                        <p className="text-sm text-slate-500 mt-1">Configura tus enlaces</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
