/**
 * Página de Colección para Revendedor
 * Muestra productos SIN precios y SIN botón WhatsApp
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection, Product } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { Package, ChevronLeft, ArrowRight } from 'lucide-react';
import { getAbsoluteImageUrl } from '@/lib/utils/metadata';

interface ProductData {
    _id: string;
    slug: string;
    name: string;
    images: string[];
    coverImage?: string;
    description?: string;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string }>;
}) {
    const { resellerSlug, collectionSlug } = await params;
    await dbConnect();

    const tenant = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (!tenant) {
        return { title: 'Colección no encontrada' };
    }

    const collection = await Collection.findOne({ slug: collectionSlug }).lean();
    const collectionName = (collection as any)?.name || 'Colección';
    const title = `${collectionName} | ${tenant.resellerConfig.headerTitle}`;
    const description = (collection as any)?.description || `Mira los mejores productos de la colección ${collectionName} en nuestro catálogo oficial.`;

    // Obtener URLs absolutas
    const imageUrl = await getAbsoluteImageUrl((collection as any)?.coverImage);
    const fallbackLogo = await getAbsoluteImageUrl(tenant.branding.logo);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: imageUrl ? [imageUrl] : (fallbackLogo ? [fallbackLogo] : []),
        },
    };
}

export default async function ResellerCollectionPage({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string }>;
}) {
    const { resellerSlug, collectionSlug } = await params;
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
    const collection = await Collection.findOne({ slug: collectionSlug }).lean() as { _id: any; name: string; description?: string; productIds: any[] } | null;
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

    // Obtener productos de la colección usando el array de IDs (forzando conversión a ObjectId)
    const productIds = (collection.productIds || []).map(id =>
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    const products = await Product.find({
        _id: { $in: productIds },
    })
        .select('_id slug name images coverImage description')
        .sort({ order: 1 })
        .lean<ProductData[]>();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    href={`/r/${resellerSlug}`}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Volver al catálogo</span>
                </Link>
            </div>

            {/* Título de la colección */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    {(collection as any).name}
                </h1>
                {(collection as any).description && (
                    <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
                        {(collection as any).description}
                    </p>
                )}
            </div>

            {/* Grid de productos - Rediseño Vibrant */}
            {products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <Package className="h-20 w-20 mx-auto text-slate-200 mb-6" />
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                        Colección Vacía
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Pronto tendremos diseños increíbles aquí.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product) => (
                        <Link
                            key={product._id.toString()}
                            href={`/r/${resellerSlug}/${collectionSlug}/${product.slug || product._id.toString()}`}
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 animate-lift border border-slate-50"
                        >
                            {/* Imagen Cuadrada */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50">
                                {product.coverImage || (product.images && product.images[0]) ? (
                                    <Image
                                        src={product.coverImage || product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-12 w-12 text-slate-200" />
                                    </div>
                                )}

                                {/* Badge de Calidad */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 rounded-lg glass text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm border-white/50">
                                        Calidad Premium
                                    </span>
                                </div>

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="px-4 py-2 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        Consultar
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="inline-block w-8 h-1 bg-slate-100 rounded-full group-hover:w-16 group-hover:bg-indigo-500 transition-all" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Detalles</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* CTA Secundario al final de la colección */}
            {products.length > 0 && (
                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">¿Viste algo que te gustó?</p>
                    <a
                        href={`https://wa.me/?text=Hola!%20Estoy%20viendo%20la%20colecci%C3%B3n%20${encodeURIComponent((collection as any).name)}%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest group"
                    >
                        <span>Hacer pedido de esta sección</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>
            )}
        </div>
    );
}
