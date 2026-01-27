/**
 * Detalle de Producto
 */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import { Tenant, Collection, Product, TenantProduct, TenantCollection } from '@/lib/models';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { ArrowLeft, Package } from 'lucide-react';
import type { Metadata } from 'next';

// Tipos para los datos con lean()
interface TenantData {
    _id: { toString(): string };
    slug: string;
    socialLinks: { whatsappLink: string };
    globalTexts: { ctaButtonText: string };
}

interface CollectionData {
    _id: { toString(): string };
    name: string;
    slug: string;
    productIds: Array<{ toString(): string }>;
}

interface ProductData {
    _id: { toString(): string };
    name: string;
    images: string[];
}

interface TenantCollectionData {
    ctaButtonText: string;
}

interface CustomizationData {
    customName?: string;
    customPrice?: string;
    customDescription?: string;
    ctaText?: string;
}

async function getProductData(
    tenantSlug: string,
    collectionSlug: string,
    productId: string
) {
    await dbConnect();

    const tenant = (await Tenant.findOne({ slug: tenantSlug, isActive: true }).lean()) as unknown as TenantData | null;
    if (!tenant) return null;

    const collection = (await Collection.findOne({ slug: collectionSlug }).lean()) as unknown as CollectionData | null;
    if (!collection) return null;

    const product = (await Product.findById(productId).lean()) as unknown as ProductData | null;
    if (!product) return null;

    // Verificar que el producto está en la colección
    const isInCollection = collection.productIds.some(
        (id) => id.toString() === productId
    );
    if (!isInCollection) return null;

    // Verificar colección publicada para este tenant
    const tenantCollection = (await TenantCollection.findOne({
        tenantId: tenant._id,
        collectionId: collection._id,
        isPublished: true,
    }).lean()) as unknown as TenantCollectionData | null;
    if (!tenantCollection) return null;

    // Obtener personalización
    const customization = (await TenantProduct.findOne({
        tenantId: tenant._id,
        productId: product._id,
    }).lean()) as unknown as CustomizationData | null;

    return {
        tenant,
        collection,
        product,
        customization,
        tenantCollection,
    };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tenantSlug: string; collectionSlug: string; productId: string }>;
}): Promise<Metadata> {
    const { tenantSlug, collectionSlug, productId } = await params;
    const data = await getProductData(tenantSlug, collectionSlug, productId);

    if (!data) {
        return { title: 'Producto no encontrado' };
    }

    const productName = data.customization?.customName || data.product.name;

    return {
        title: `${productName} | ${data.collection.name}`,
        description: data.customization?.customDescription || `Ver detalles de ${productName}`,
        openGraph: {
            images: data.product.images[0] ? [data.product.images[0]] : [],
        },
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ tenantSlug: string; collectionSlug: string; productId: string }>;
}) {
    const { tenantSlug, collectionSlug, productId } = await params;
    const data = await getProductData(tenantSlug, collectionSlug, productId);

    if (!data) {
        notFound();
    }

    const { tenant, collection, product, customization, tenantCollection } = data;
    const productName = customization?.customName || product.name;
    const productPrice = customization?.customPrice || '';
    const productDescription = customization?.customDescription || '';
    const ctaText = customization?.ctaText || tenantCollection.ctaButtonText || tenant.globalTexts.ctaButtonText;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Analytics Tracker */}
            <AnalyticsTracker
                tenantId={tenant._id.toString()}
                type="product_view"
                collectionId={collection._id.toString()}
                productId={product._id.toString()}
            />

            {/* Navegación */}
            <Link
                href={`/t/${tenantSlug}/${collectionSlug}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:tenant-text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a {collection.name}
            </Link>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Galería de imágenes */}
                <div className="space-y-4">
                    {/* Imagen principal */}
                    <div className="aspect-square relative rounded-2xl overflow-hidden bg-slate-100">
                        {product.images[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={productName}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Package className="h-24 w-24 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.slice(0, 4).map((img, index) => (
                                <div
                                    key={index}
                                    className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <Image
                                        src={img}
                                        alt={`${productName} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="100px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            {productName}
                        </h1>

                        {productPrice && (
                            <div className="text-3xl font-bold tenant-gradient-text mb-6">
                                {productPrice}
                            </div>
                        )}
                    </div>

                    {/* Botón WhatsApp arriba */}
                    {tenant.socialLinks.whatsappLink && (
                        <WhatsAppButton
                            href={tenant.socialLinks.whatsappLink}
                            text={ctaText}
                            productName={productName}
                            tenantId={tenant._id.toString()}
                            productId={product._id.toString()}
                            collectionId={collection._id.toString()}
                            className="w-full justify-center text-lg py-4"
                        />
                    )}

                    {/* Descripción */}
                    {productDescription && (
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-xl font-semibold text-slate-900 mb-3">
                                Descripción
                            </h2>
                            <p className="text-slate-600 whitespace-pre-wrap">
                                {productDescription}
                            </p>
                        </div>
                    )}

                    {/* Separador */}
                    <div className="border-t border-slate-200 pt-6">
                        <p className="text-slate-500 text-sm mb-4">
                            ¿Tienes alguna pregunta? ¡Escríbenos!
                        </p>

                        {/* Botón WhatsApp abajo */}
                        {tenant.socialLinks.whatsappLink && (
                            <WhatsAppButton
                                href={tenant.socialLinks.whatsappLink}
                                text={ctaText}
                                productName={productName}
                                tenantId={tenant._id.toString()}
                                productId={product._id.toString()}
                                collectionId={collection._id.toString()}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* WhatsApp flotante */}
            {tenant.socialLinks.whatsappLink && (
                <WhatsAppButton
                    href={tenant.socialLinks.whatsappLink}
                    text=""
                    productName={productName}
                    tenantId={tenant._id.toString()}
                    productId={product._id.toString()}
                    variant="floating"
                />
            )}
        </div>
    );
}
