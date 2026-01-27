/**
 * Layout Super-Admin
 * Verifica autenticación y muestra sidebar
 */
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    // Verificar autenticación y rol
    if (!session.isAuthenticated) {
        redirect('/login');
    }

    if (session.role !== 'super-admin') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar isSuperAdmin={true} />
            <main className="md:ml-64 min-h-screen">
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
