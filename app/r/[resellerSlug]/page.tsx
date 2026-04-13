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

interface CollectionData {
    _id: string;
    slug: string;
    name: string;
    description: string;
    image: string;
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
        .populate('collectionId', 'slug name description coverImage isActive')
        .sort({ order: 1 })
        .lean();

    // Filtrar solo las colecciones que existen (pobladas correctamente)
    const collections = tenantCollections
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
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Grid3X3 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    Sin colecciones
                </h2>
                <p className="text-slate-500">
                    Este catálogo aún no tiene colecciones disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Grid de colecciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <Link
                        key={collection._id.toString()}
                        href={`/r/${resellerSlug}/${collection.slug}`}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        {/* Imagen */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            {collection.image ? (
                                <Image
                                    src={collection.image}
                                    alt={collection.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <Grid3X3 className="h-12 w-12 text-slate-400" />
                                </div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-bold mb-1 group-hover:underline">
                                {collection.name}
                            </h3>
                            {collection.description && (
                                <p className="text-sm text-white/80 line-clamp-2">
                                    {collection.description}
                                </p>
                            )}
                            <div className="mt-2 flex items-center gap-1 text-sm text-white/90">
                                <span>Ver productos</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── SECCIÓN: ¿CÓMO HACER TU PEDIDO? ── */}
            <section className="mt-16 mb-4">
                {/* Divider decorativo */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        ¿Cómo hacer tu pedido?
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200" />
                </div>

                {/* Card principal oscura */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
                    {/* Decoración de fondo */}
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    {/* Encabezado */}
                    <div className="relative text-center mb-10">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-3">
                            Solo 3 pasos
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Así de fácil es comprar
                        </h2>
                        <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
                            Sin complicaciones, sin formularios largos. Tu pedido en minutos.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Línea conectora desktop */}
                        <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-white/10 z-0" />

                        {/* Paso 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm shadow-lg">
                                <span className="text-3xl">📸</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                                Paso 01
                            </div>
                            <h3 className="text-base font-black text-white mb-2 leading-tight">
                                Elige lo que te gustó
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">
                                Toma captura de pantalla del producto o anota su nombre desde el catálogo.
                            </p>
                        </div>

                        {/* Paso 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm shadow-lg">
                                <span className="text-3xl">📦</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                                Paso 02
                            </div>
                            <h3 className="text-base font-black text-white mb-2 leading-tight">
                                Cantidad y talla
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">
                                Indícanos cuántas unidades necesitas y la talla (si aplica). Atendemos desde 1 unidad.
                            </p>
                        </div>

                        {/* Paso 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm shadow-lg">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                                Paso 03
                            </div>
                            <h3 className="text-base font-black text-white mb-2 leading-tight">
                                ¡Listo!
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">
                                Confirmamos disponibilidad, te enviamos el total y coordinamos la entrega. Sin rodeos.
                            </p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="relative mt-10 flex justify-center">
                        <a
                            href="https://wa.me/?text=Hola!%20Vi%20el%20cat%C3%A1logo%20y%20quiero%20hacer%20un%20pedido."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bc5a] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.549 4.093 1.508 5.814L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.214-3.727.972.995-3.635-.235-.374A9.818 9.818 0 1112 21.818z" />
                            </svg>
                            <span>Hacer mi pedido ahora</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
