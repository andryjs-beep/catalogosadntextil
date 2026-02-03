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
                    {/* Header Neutro */}
                    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-slate-800">
                                        {resellerConfig.headerTitle || 'Catálogo Online'}
                                    </h1>
                                    {resellerConfig.headerSubtitle && (
                                        <p className="text-sm text-slate-500 mt-1">
                                            {resellerConfig.headerSubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Navegación de colecciones */}
                            {collections.length > 0 && (
                                <nav className="mt-4 flex flex-wrap justify-center gap-2">
                                    {collections.map((col) => (
                                        <a
                                            key={col._id.toString()}
                                            href={`/r/${resellerSlug}/${col.slug}`}
                                            className="px-4 py-2 text-sm rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                        >
                                            {col.name}
                                        </a>
                                    ))}
                                </nav>
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
