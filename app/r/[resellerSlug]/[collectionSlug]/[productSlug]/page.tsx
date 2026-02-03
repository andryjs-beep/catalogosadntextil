/**
 * Página de Detalle de Producto para Revendedor
 * Muestra producto SIN precio y SIN botón WhatsApp
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection, Product } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { ChevronLeft } from 'lucide-react';
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

    // Buscar producto
    const product = await Product.findOne({
        slug: productSlug,
        collectionId: collection._id,
        isActive: true,
    }).lean();

    if (!product) {
        notFound();
    }

    const productData = product as any;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    href={`/r/${resellerSlug}/${collectionSlug}`}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Volver a {(collection as any).name}</span>
                </Link>
            </div>

            {/* Contenido del producto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Galería de imágenes */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                    <ImageGallery
                        images={productData.images || []}
                        productName={productData.name}
                        mode="slider-manual"
                    />
                </div>

                {/* Info del producto - SIN PRECIO, SIN WHATSAPP */}
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                        {productData.name}
                    </h1>

                    {/* Descripción */}
                    {productData.description && (
                        <div className="prose prose-slate max-w-none mb-6">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {productData.description}
                            </p>
                        </div>
                    )}

                    {/* Especificaciones */}
                    {(productData.material || productData.dimensions || productData.weight) && (
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-slate-700 mb-3">
                                Especificaciones
                            </h3>
                            <dl className="space-y-2">
                                {productData.material && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Material</dt>
                                        <dd className="font-medium text-slate-700">{productData.material}</dd>
                                    </div>
                                )}
                                {productData.dimensions && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Dimensiones</dt>
                                        <dd className="font-medium text-slate-700">{productData.dimensions}</dd>
                                    </div>
                                )}
                                {productData.weight && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Peso</dt>
                                        <dd className="font-medium text-slate-700">{productData.weight}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {/* Colores disponibles */}
                    {productData.colors && productData.colors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-slate-700 mb-3">
                                Colores disponibles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {productData.colors.map((color: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                                    >
                                        {color}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NO HAY PRECIO AQUÍ */}
                    {/* NO HAY BOTÓN WHATSAPP AQUÍ */}
                </div>
            </div>
        </div>
    );
}
