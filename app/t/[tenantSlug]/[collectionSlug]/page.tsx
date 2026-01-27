/**
 * Galería de Colección - Grid de productos
 */
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection, Product, TenantProduct } from '@/lib/models';
import { ProductCard } from '@/components/ProductCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// Tipos para los datos con lean()
interface TenantData {
    _id: { toString(): string };
    globalTexts: { headerText: string; ctaButtonText: string };
    socialLinks: { whatsappLink: string };
}

interface CollectionData {
    _id: { toString(): string };
    name: string;
    productIds: Array<{ toString(): string }>;
}

interface TenantCollectionData {
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
}

interface ProductWithCustom {
    _id: { toString(): string };
    name: string;
    images: string[];
    customName?: string;
    customPrice?: string;
    customDescription?: string;
}

interface CustomizationData {
    productId: { toString(): string };
    customName?: string;
    customPrice?: string;
    customDescription?: string;
}

async function getCollectionData(tenantSlug: string, collectionSlug: string) {
    await dbConnect();

    const tenant = (await Tenant.findOne({ slug: tenantSlug, isActive: true }).lean()) as unknown as TenantData | null;
    if (!tenant) return null;

    const collection = (await Collection.findOne({ slug: collectionSlug }).lean()) as unknown as CollectionData | null;
    if (!collection) return null;

    const tenantCollection = (await TenantCollection.findOne({
        tenantId: tenant._id,
        collectionId: collection._id,
        isPublished: true,
    }).lean()) as unknown as TenantCollectionData | null;
    if (!tenantCollection) return null;

    // Obtener productos
    const products = (await Product.find({
        _id: { $in: collection.productIds },
    }).lean()) as unknown as ProductWithCustom[];

    // Obtener personalizaciones
    const customizations = (await TenantProduct.find({
        tenantId: tenant._id,
        productId: { $in: collection.productIds },
    }).lean()) as unknown as CustomizationData[];

    const customizationMap = new Map(
        customizations.map((c) => [c.productId.toString(), c])
    );

    // Combinar datos
    const productsWithCustom = products.map((product) => {
        const custom = customizationMap.get(product._id.toString());
        return {
            ...product,
            customName: custom?.customName || '',
            customPrice: custom?.customPrice || '',
            customDescription: custom?.customDescription || '',
        };
    });

    return {
        tenant,
        collection,
        tenantCollection,
        products: productsWithCustom,
    };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tenantSlug: string; collectionSlug: string }>;
}): Promise<Metadata> {
    const { tenantSlug, collectionSlug } = await params;
    const data = await getCollectionData(tenantSlug, collectionSlug);

    if (!data) {
        return { title: 'Colección no encontrada' };
    }

    return {
        title: `${data.collection.name} | ${data.tenant.globalTexts.headerText || tenantSlug}`,
        description: data.tenantCollection.persuasiveTextTop || `Explora ${data.collection.name}`,
    };
}

export default async function CollectionPage({
    params,
}: {
    params: Promise<{ tenantSlug: string; collectionSlug: string }>;
}) {
    const { tenantSlug, collectionSlug } = await params;
    const data = await getCollectionData(tenantSlug, collectionSlug);

    if (!data) {
        notFound();
    }

    const { tenant, collection, tenantCollection, products } = data;
    const ctaText = tenantCollection.ctaButtonText || tenant.globalTexts.ctaButtonText;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Analytics Tracker */}
            <AnalyticsTracker
                tenantId={tenant._id.toString()}
                type="collection_view"
                collectionId={collection._id.toString()}
            />

            {/* Navegación */}
            <Link
                href={`/t/${tenantSlug}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:tenant-text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 tenant-gradient-text">
                    {collection.name}
                </h1>

                {/* Texto persuasivo arriba */}
                {tenantCollection.persuasiveTextTop && (
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                        {tenantCollection.persuasiveTextTop}
                    </p>
                )}

                {/* Botón WhatsApp */}
                {tenant.socialLinks.whatsappLink && (
                    <WhatsAppButton
                        href={tenant.socialLinks.whatsappLink}
                        text={ctaText}
                        tenantId={tenant._id.toString()}
                        collectionId={collection._id.toString()}
                    />
                )}
            </div>

            {/* Grid de productos */}
            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id.toString()}
                            id={product._id.toString()}
                            name={product.customName || product.name}
                            price={product.customPrice || ''}
                            image={product.images[0] || ''}
                            tenantSlug={tenantSlug}
                            collectionSlug={collectionSlug}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-slate-500">
                    <p>No hay productos en esta colección</p>
                </div>
            )}

            {/* Texto persuasivo abajo */}
            {tenantCollection.persuasiveTextBottom && (
                <div className="mt-12 text-center">
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                        {tenantCollection.persuasiveTextBottom}
                    </p>
                    {tenant.socialLinks.whatsappLink && (
                        <WhatsAppButton
                            href={tenant.socialLinks.whatsappLink}
                            text={ctaText}
                            tenantId={tenant._id.toString()}
                            collectionId={collection._id.toString()}
                        />
                    )}
                </div>
            )}

            {/* WhatsApp flotante */}
            {tenant.socialLinks.whatsappLink && (
                <WhatsAppButton
                    href={tenant.socialLinks.whatsappLink}
                    text=""
                    tenantId={tenant._id.toString()}
                    collectionId={collection._id.toString()}
                    variant="floating"
                />
            )}
        </div>
    );
}
