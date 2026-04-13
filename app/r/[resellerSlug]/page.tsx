/**
 * Página principal del Catálogo de Revendedor
 * Muestra las colecciones disponibles
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { getAbsoluteImageUrl } from '@/lib/utils/metadata';

interface CollectionData {
    _id: string;
    slug: string;
    name: string;
    description: string;
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

    const title = `${tenant.resellerConfig.headerTitle} | Catálogo Oficial`;
    const description = `Explora las últimas colecciones de ${tenant.resellerConfig.headerTitle}. Diseños exclusivos y calidad premium en cada prenda. ¡Haz tu pedido ahora!`;
    const logoUrl = await getAbsoluteImageUrl(tenant.branding.logo);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: logoUrl ? [logoUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: logoUrl ? [logoUrl] : [],
        },
    };
}

export default async function ResellerHomePage({
    params,
}: {
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

    // Obtener colecciones asignadas usando el mismo patrón que el catálogo principal
    const tenantCollections = await TenantCollection.find({
        tenantId: tenant._id,
        isPublished: true,  // Solo colecciones publicadas
    })
        .populate('collectionId', 'slug name description coverImage order isActive')
        .lean();

    // Ordenar por el mismo criterio que el catálogo principal (orden global de la colección)
    const sortedTenantCollections = (tenantCollections as any[]).sort((a, b) =>
        (a.collectionId?.order || 0) - (b.collectionId?.order || 0)
    );

    // Filtrar solo las colecciones que existen (pobladas correctamente)
    const collections = sortedTenantCollections
        .filter((tc: any) => tc.collectionId)
        .map((tc: any) => ({
            _id: tc.collectionId._id.toString(),
            slug: tc.collectionId.slug,
            name: tc.collectionId.name,
            description: tc.collectionId.description || '',
            image: tc.collectionId.coverImage || '',
        }));

    if (collections.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                    <Grid3X3 className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Sin colecciones
                </h2>
                <p className="text-slate-500 font-medium">
                    Explora otros catálogos mientras trabajamos en este.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Grid de colecciones - Rediseño Vibrant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {collections.map((collection, idx) => {
                    const grads = ['from-indigo-500/80', 'from-rose-500/80', 'from-emerald-500/80', 'from-amber-500/80'];
                    const gradClass = grads[idx % grads.length];

                    return (
                        <Link
                            key={collection._id.toString()}
                            href={`/r/${resellerSlug}/${collection.slug}`}
                            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 animate-lift"
                        >
                            {/* Imagen Cuadrada (1080x1080) */}
                            <div className="relative aspect-square overflow-hidden">
                                {collection.image ? (
                                    <Image
                                        src={collection.image}
                                        alt={collection.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        <Grid3X3 className="h-16 w-16 text-slate-300" />
                                    </div>
                                )}

                                {/* Overlay Vibrante Dinámico */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${gradClass} via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />

                                {/* Badge Flotante de Categoría */}
                                <div className="absolute top-6 left-6">
                                    <span className="px-4 py-1.5 rounded-full glass-dark text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                        Colección
                                    </span>
                                </div>
                            </div>

                            {/* Info Flotante sobre la imagen (Bottom) */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                                <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter transition-all group-hover:translate-x-2">
                                    {collection.name}
                                </h3>

                                {collection.description && (
                                    <p className="text-sm text-white/80 line-clamp-2 mb-6 font-medium leading-relaxed max-w-[280px]">
                                        {collection.description}
                                    </p>
                                )}

                                {/* CTA Button integrado Premium */}
                                <div className="flex items-center gap-3">
                                    <div className="h-12 flex items-center gap-3 px-6 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-slate-100 transition-all active:scale-95">
                                        <span>Explorar Ahora</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* ── SECCIÓN: ¿CÓMO HACER TU PEDIDO? - Rediseño Vibrant ── */}
            <section className="mt-24 mb-12">
                <div className="text-center mb-16">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block">
                        Proceso de Compra
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter-extra leading-tight">
                        Tu producto, <span className="text-indigo-600">en 3 pasos.</span>
                    </h2>
                </div>

                {/* Grid de Pasos Vibrantes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Paso 1 */}
                    <div className="relative group p-10 rounded-[3rem] vibrant-grad-1 shadow-glow-primary text-white overflow-hidden animate-lift">
                        <div className="absolute top-[-20px] right-[-20px] text-white/10 font-black text-[120px] leading-none pointer-events-none">01</div>
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-inner border border-white/30">
                            <span className="text-4xl">📸</span>
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Captura el diseño</h3>
                        <p className="text-white/80 font-medium leading-relaxed">
                            Navega por el catálogo y toma captura de pantalla o anota el nombre de lo que más te guste.
                        </p>
                    </div>

                    {/* Paso 2 */}
                    <div className="relative group p-10 rounded-[3rem] vibrant-grad-2 shadow-xl text-white overflow-hidden animate-lift" style={{ boxShadow: '0 20px 40px -10px rgba(244, 63, 94, 0.3)' }}>
                        <div className="absolute top-[-20px] right-[-20px] text-white/10 font-black text-[120px] leading-none pointer-events-none">02</div>
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-inner border border-white/30">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Dinos cuánto</h3>
                        <p className="text-white/80 font-medium leading-relaxed">
                            Envíanos la cantidad y la talla (si aplica). Recuerda que atendemos desde 1 unidad sin problemas.
                        </p>
                    </div>

                    {/* Paso 3 */}
                    <div className="relative group p-10 rounded-[3rem] vibrant-grad-3 shadow-xl text-white overflow-hidden animate-lift" style={{ boxShadow: '0 20px 40px -10px rgba(34, 197, 94, 0.3)' }}>
                        <div className="absolute top-[-20px] right-[-20px] text-white/10 font-black text-[120px] leading-none pointer-events-none">03</div>
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-inner border border-white/30">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Espera el envío</h3>
                        <p className="text-white/80 font-medium leading-relaxed">
                            Confirmamos tu pedido al instante y coordinamos la entrega de forma rápida y segura.
                        </p>
                    </div>
                </div>

                {/* Final CTA Vibrant */}
                <div className="mt-16 flex justify-center">
                    <a
                        href="https://wa.me/?text=Hola!%20Vi%20el%20cat%C3%A1logo%20y%20quiero%20hacer%20un%20pedido."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-4 py-8 px-12 rounded-[3.5rem] bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">🚀</span>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-70">¿Listo para ordenar?</span>
                                <span className="text-2xl font-black">Hacer mi pedido ahora</span>
                            </div>
                            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </a>
                </div>
            </section>
        </div>
    );
}
