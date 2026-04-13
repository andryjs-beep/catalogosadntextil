/**
 * Layout para Catálogo de Revendedor
 * Versión limpia sin precios, WhatsApp, ni información de contacto
 */
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { Footer } from '@/components/Footer';
import './reseller.css';

interface CollectionData {
    _id: string;
    slug: string;
    name: string;
    image: string;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ resellerSlug: string }>;
}) {
    const { resellerSlug } = await params;
    await dbConnect();

    const tenant = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (!tenant) {
        return { title: 'Catálogo no encontrado' };
    }

    const title = tenant.resellerConfig.headerTitle || 'Catálogo Online';

    return {
        title,
        description: tenant.resellerConfig.headerSubtitle || 'Explora nuestros productos',
    };
}

export default async function ResellerLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ resellerSlug: string }>;
}) {
    const { resellerSlug } = await params;
    await dbConnect();

    // Buscar tenant por el slug del revendedor
    const tenant = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (!tenant) {
        notFound();
    }

    const { branding, resellerConfig } = tenant;

    // Obtener colecciones asignadas (solo publicadas)
    const tenantCollections = await TenantCollection.find({
        tenantId: tenant._id,
        isPublished: true,
    })
        .populate('collectionId', 'slug name image isActive')
        .sort({ order: 1 })
        .lean();

    const collections = tenantCollections
        .filter((tc: any) => tc.collectionId)
        .map((tc: any) => ({
            _id: tc.collectionId._id.toString(),
            slug: tc.collectionId.slug,
            name: tc.collectionId.name,
            image: tc.collectionId.coverImage || tc.collectionId.image || '',
        }));

    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link
                    href={`https://fonts.googleapis.com/css2?family=${branding.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`}
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: `'${branding.fontFamily}', sans-serif` }}>
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
                    {/* Header Neutro - Premium */}
                    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-lg border-b border-slate-100 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 pt-4 pb-3">
                            {/* Título */}
                            <div className="flex items-center justify-center mb-3">
                                <div className="text-center">
                                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                                        {resellerConfig.headerTitle || 'Catálogo Online'}
                                    </h1>
                                    {resellerConfig.headerSubtitle && (
                                        <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-widest">
                                            {resellerConfig.headerSubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Navegación de colecciones - Premium */}
                            {collections.length > 0 && (
                                <div className="relative">
                                    {/* Fade edges en mobile */}
                                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 md:hidden" />
                                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 md:hidden" />
                                    <nav className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 justify-start md:justify-center px-2">
                                        <a
                                            href={`/r/${resellerSlug}`}
                                            className="flex-shrink-0 group flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            <span>✦</span>
                                            <span>Todo</span>
                                        </a>
                                        {collections.map((col) => (
                                            <a
                                                key={col._id.toString()}
                                                href={`/r/${resellerSlug}/${col.slug}`}
                                                className="flex-shrink-0 group flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                            >
                                                <span>{col.name}</span>
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Contenido principal */}
                    <main className="flex-1">{children}</main>

                    {/* Footer Neutro */}
                    <footer className="bg-slate-900 text-white py-6">
                        <div className="max-w-7xl mx-auto px-4 text-center">
                            <p className="text-slate-400 text-sm">
                                {resellerConfig.footerText || '© Catálogo Online'}
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
