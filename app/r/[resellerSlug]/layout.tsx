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
                    {/* Header Neutro - Rediseño Vibrant Premium */}
                    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
                            {/* Título y Branding */}
                            <div className="flex flex-col items-center justify-center mb-6 text-center">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-slate-900 text-[9px] font-black uppercase tracking-[0.4em] text-white mb-2 shadow-glow-primary">
                                    Catálogo Oficial
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter-extra text-slate-900 leading-none">
                                    {resellerConfig.headerTitle || 'Catálogo Online'}
                                </h1>
                                {resellerConfig.headerSubtitle && (
                                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] max-w-[250px] mx-auto opacity-70">
                                        {resellerConfig.headerSubtitle}
                                    </p>
                                )}
                            </div>

                            {/* Navegación de colecciones - Cards Vibrantes */}
                            {collections.length > 0 && (
                                <div className="relative group/nav">
                                    {/* Scroll horizontal con máscara de desvanecimiento */}
                                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 md:hidden" />
                                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 md:hidden" />

                                    <nav className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 justify-start md:justify-center">
                                        {/* Botón TODO con gradiente primario */}
                                        <a
                                            href={`/r/${resellerSlug}`}
                                            className="flex-shrink-0 group flex flex-col items-center justify-center px-6 py-3 rounded-2xl vibrant-grad-1 text-white shadow-glow-primary hover:scale-105 transition-all duration-300 min-w-[100px]"
                                        >
                                            <span className="text-sm font-black uppercase tracking-widest">Todo</span>
                                            <span className="text-[10px] opacity-70 font-bold uppercase mt-0.5">Categorías</span>
                                        </a>

                                        {collections.map((col, idx) => {
                                            // Asignar un gradiente basado en el índice para variedad visual
                                            const grads = ['vibrant-grad-2', 'vibrant-grad-3', 'vibrant-grad-4', 'vibrant-grad-1'];
                                            const gradClass = grads[idx % grads.length];

                                            return (
                                                <a
                                                    key={col._id.toString()}
                                                    href={`/r/${resellerSlug}/${col.slug}`}
                                                    className={`flex-shrink-0 flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-800 shadow-sm hover:border-transparent hover:text-white hover:${gradClass} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[120px]`}
                                                >
                                                    <span className="text-sm font-black uppercase tracking-widest">{col.name}</span>
                                                    <span className="text-[10px] text-slate-400 group-hover:text-white/70 font-bold uppercase mt-0.5">Explorar</span>
                                                </a>
                                            );
                                        })}
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
