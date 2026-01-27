/**
 * Componente AdminSidebar - Navegación del panel de administración
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Package,
    FolderOpen,
    Store,
    BarChart3,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface AdminSidebarProps {
    isSuperAdmin?: boolean;
    tenantSlug?: string;
}

export function AdminSidebar({ isSuperAdmin = true, tenantSlug }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Rutas para super-admin
    const superAdminNav: NavItem[] = [
        { href: '/admin', label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" /> },
        { href: '/admin/products', label: 'Productos', icon: <Package className="h-5 w-5" /> },
        { href: '/admin/collections', label: 'Colecciones', icon: <FolderOpen className="h-5 w-5" /> },
        { href: '/admin/tenants', label: 'Clientes', icon: <Store className="h-5 w-5" /> },
        { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ];

    // Rutas para client-admin
    const clientAdminNav: NavItem[] = [
        { href: `/t/${tenantSlug}/admin`, label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" /> },
        { href: `/t/${tenantSlug}/admin/branding`, label: 'Marca', icon: <Store className="h-5 w-5" /> },
        { href: `/t/${tenantSlug}/admin/social`, label: 'Redes Sociales', icon: <Store className="h-5 w-5" /> },
        { href: `/t/${tenantSlug}/admin/collections`, label: 'Colecciones', icon: <FolderOpen className="h-5 w-5" /> },
        { href: `/t/${tenantSlug}/admin/products`, label: 'Productos', icon: <Package className="h-5 w-5" /> },
        { href: `/t/${tenantSlug}/admin/analytics`, label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ];

    const navItems = isSuperAdmin ? superAdminNav : clientAdminNav;

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <>
            {/* Botón móvil */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Overlay móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-transform duration-300',
                    'md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-center border-b border-slate-700">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {isSuperAdmin ? 'Super Admin' : 'Mi Catálogo'}
                        </h1>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-slate-700 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
