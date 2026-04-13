/**
 * Página de Detalle de Producto para Revendedor
 * Muestra producto SIN precio y SIN botón WhatsApp
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection, Product } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { ImageGallery } from '@/components/ImageGallery';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string; productSlug: string }>;
}) {
    const { resellerSlug, productSlug } = await params;
    await dbConnect();

    const tenant = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (!tenant) {
        return { title: 'Producto no encontrado' };
    }

    const product = await Product.findOne({ slug: productSlug }).lean();

    return {
        title: product ? `${(product as any).name} | ${tenant.resellerConfig.headerTitle}` : 'Producto',
    };
}

export default async function ResellerProductPage({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string; productSlug: string }>;
}) {
    const { resellerSlug, collectionSlug, productSlug } = await params;
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

    // Buscar colección
    const collection = await Collection.findOne({ slug: collectionSlug }).lean() as { _id: any; name: string } | null;
    if (!collection) {
        notFound();
    }

    // Verificar que la colección esté asignada al tenant
    const tenantCollection = await TenantCollection.findOne({
        tenantId: tenant._id,
        collectionId: collection._id,
    }).lean();

    if (!tenantCollection) {
        notFound();
    }

    // Buscar producto por slug o por ID
    let product = await Product.findOne({ slug: productSlug }).lean();

    // Si no se encuentra por slug, intentar por ID
    if (!product && productSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(productSlug).lean();
    }

    if (!product) {
        notFound();
    }

    const productData = product as any;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Breadcrumb Premium */}
            <div className="mb-10">
                <Link
                    href={`/r/${resellerSlug}/${collectionSlug}`}
                    className="inline-flex items-center gap-2 group text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                >
                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                    <span>Volver a {(collection as any).name}</span>
                </Link>
            </div>

            {/* Contenido del producto - Rediseño Vibrant */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Galería de imágenes - Con Badge de Calidad */}
                <div className="relative group/gallery">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-premium border border-slate-50 relative z-10">
                        <ImageGallery
                            images={productData.images || []}
                            productName={productData.name}
                            mode="slider-manual"
                        />
                    </div>
                    {/* Badge Detalle */}
                    <div className="absolute top-8 right-8 z-20">
                        <div className="px-4 py-2 rounded-2xl vibrant-grad-1 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                            <span className="text-sm">✦</span> Calidad Garantizada
                        </div>
                    </div>
                    {/* Decoración de fondo */}
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 z-0" />
                </div>

                {/* Info del producto - Estilo High-End */}
                <div className="flex flex-col pt-4">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                            Diseño Disponible
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter-extra leading-[1.1] mb-6">
                            {productData.name}
                        </h1>
                    </div>

                    {/* Botón CTA Principal - Máximo Impacto */}
                    <div className="mb-10">
                        <a
                            href={`https://wa.me/?text=Hola!%20Vi%20este%20producto%20en%20el%20cat%C3%A1logo%20y%20quiero%20hacer%20un%20pedido:%20${encodeURIComponent(productData.name)}%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between w-full p-6 rounded-[2rem] bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl transition-all duration-500 transform hover:-translate-y-2 active:scale-95 overflow-hidden relative"
                        >
                            <div className="relative z-10 flex flex-col items-start">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">¡Hazlo realidad!</span>
                                <span className="text-xl font-black tracking-tight">Hacer pedido ahora</span>
                            </div>
                            <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                            </div>
                            {/* Brillo dinámico en hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
                        </a>
                        {/* Texto de ayuda debajo del botón */}
                        <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Atención inmediata por WhatsApp
                        </p>
                    </div>

                    {/* Descripción */}
                    {productData.description && (
                        <div className="mb-10">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 border-l-4 border-indigo-500 pl-3">
                                Sobre este diseño
                            </h3>
                            <p className="text-slate-500 font-medium leading-[1.8] whitespace-pre-line text-lg md:text-xl italic">
                                "{productData.description}"
                            </p>
                        </div>
                    )}

                    {/* Grid de Especificaciones y Colores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Especificaciones */}
                        {(productData.material || productData.dimensions || productData.weight) && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Detalles Técnicos
                                </h3>
                                <dl className="space-y-4">
                                    {productData.material && (
                                        <div className="flex flex-col">
                                            <dt className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Material</dt>
                                            <dd className="font-black text-slate-800 tracking-tight">{productData.material}</dd>
                                        </div>
                                    )}
                                    {productData.dimensions && (
                                        <div className="flex flex-col">
                                            <dt className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Dimensiones</dt>
                                            <dd className="font-black text-slate-800 tracking-tight">{productData.dimensions}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Colores */}
                        {productData.colors && productData.colors.length > 0 && (
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Opciones
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {productData.colors.map((color: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-white text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm"
                                        >
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Separador */}
            <div className="my-24 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Guía Rápida de Pedido */}
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-12">¿Cómo recibir este producto?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl mb-4">📸</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">01. CAPTURA</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl mb-4">📦</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">02. PÍDELO</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl mb-4">🎉</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">03. RECÍBELO</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
