/**
 * Layout para Client-Admin
 */
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Package, Palette, Share2, LogOut, LayoutDashboard } from 'lucide-react';

export default async function ClientAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session.isAuthenticated) {
        redirect('/login');
    }

    // Los clientes pueden acceder a su propio panel
    if (session.role !== 'client-admin' && session.role !== 'super-admin') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex items-center gap-3 p-6 border-b">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">Mi Catálogo</h1>
                            <p className="text-xs text-slate-500">Panel de Cliente</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        <Link
                            href="/client-admin/products"
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Package className="h-5 w-5" />
                            Productos
                        </Link>
                        <Link
                            href="/client-admin/branding"
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Palette className="h-5 w-5" />
                            Branding
                        </Link>
                        <Link
                            href="/client-admin/social"
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Share2 className="h-5 w-5" />
                            Redes Sociales
                        </Link>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <form action="/api/auth/logout" method="POST">
                            <button
                                type="submit"
                                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                            >
                                <LogOut className="h-5 w-5" />
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
