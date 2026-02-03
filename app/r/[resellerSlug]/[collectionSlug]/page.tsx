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
import { Package, ChevronLeft } from 'lucide-react';

interface ProductData {
    _id: string;
    slug: string;
    name: string;
    images: string[];
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

    const collection = await Collection.findOne({ slug: collectionSlug }).lean() as { name: string } | null;

    return {
        title: collection ? `${collection.name} | ${tenant.resellerConfig.headerTitle}` : 'Colección',
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
        .select('_id slug name images description')
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

            {/* Grid de productos */}
            {products.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">
                        Sin productos
                    </h2>
                    <p className="text-slate-500">
                        Esta colección aún no tiene productos disponibles.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link
                            key={product._id.toString()}
                            href={`/r/${resellerSlug}/${collectionSlug}/${product.slug || product._id.toString()}`}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            {/* Imagen */}
                            <div className="relative aspect-square overflow-hidden">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        <Package className="h-10 w-10 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info - SIN PRECIO */}
                            <div className="p-3">
                                <h3 className="font-medium text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>
                                {/* NO HAY PRECIO AQUÍ */}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
