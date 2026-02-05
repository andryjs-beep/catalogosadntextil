/**
 * Galería de Colección - Grid de productos
 */
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection, Product, TenantProduct } from '@/lib/models';
import type { ILandingPageSections } from '@/lib/models/TenantCollection';
import { ProductCard } from '@/components/ProductCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { ArrowLeft } from 'lucide-react';
import { LandingPageLayout } from '@/components/LandingPageLayout';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
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
    coverImage: string;
    productIds: Array<{ toString(): string }>;
}

interface TenantCollectionData {
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
    useLandingLayout: boolean;
    landingPageSections: ILandingPageSections;
}

interface ProductWithCustom {
    _id: { toString(): string };
    slug?: string;
    name: string;
    images: string[];
    customName?: string;
    customPrice?: string;
    tieredPricing?: Array<{ unitCount: number; price: string; enabled: boolean }>;
    customDescription?: string;
}

interface CustomizationData {
    productId: { toString(): string };
    customName?: string;
    customPrice?: string;
    tieredPricing?: Array<{ unitCount: number; price: string; enabled: boolean }>;
    customDescription?: string;
}

async function getCollectionData(tenantSlug: string, collectionSlugOrProductSlug: string) {
    await dbConnect();

    const tenant = (await Tenant.findOne({ slug: tenantSlug, isActive: true }).lean()) as unknown as TenantData | null;
    if (!tenant) return null;

    // 1. Intentar buscar como Colección
    let collection = (await Collection.findOne({ slug: collectionSlugOrProductSlug }).lean()) as unknown as CollectionData | null;
    let tenantCollection: TenantCollectionData | null = null;
    let singleProductId: string | null = null;

    if (collection) {
        tenantCollection = (await TenantCollection.findOne({
            tenantId: tenant._id,
            collectionId: collection._id,
            isPublished: true,
        }).lean()) as unknown as TenantCollectionData | null;
    }

    // 2. Si no es colección o no está publicada para este tenant, intentar buscar como Producto
    if (!tenantCollection) {
        const product = await Product.findOne({ slug: collectionSlugOrProductSlug }).lean() as any;
        if (product) {
            // Buscar en todas las colecciones publicadas del tenant para encontrar la que tiene el producto
            const allTCs = await TenantCollection.find({
                tenantId: tenant._id,
                isPublished: true,
            }).populate('collectionId').lean() as any[];

            const targetTC = allTCs.find(t =>
                t.collectionId &&
                t.collectionId.productIds &&
                t.collectionId.productIds.some((id: any) => id.toString() === product._id.toString())
            );

            if (targetTC) {
                collection = targetTC.collectionId;
                tenantCollection = targetTC;
                singleProductId = product._id.toString();
            }
        }
    }

    if (!collection || !tenantCollection) return null;

    // Obtener productos
    const productQuery = singleProductId
        ? { _id: singleProductId }
        : { _id: { $in: collection.productIds } };

    const products = (await Product.find(productQuery).lean()) as unknown as ProductWithCustom[];

    // Obtener personalizaciones
    const customizations = (await TenantProduct.find({
        tenantId: tenant._id,
        productId: { $in: products.map(p => p._id) },
    }).lean()) as unknown as CustomizationData[];

    const customizationMap = new Map(
        customizations.map((c) => [c.productId.toString(), c])
    );

    // Combinar datos
    const productsWithCustom = products.map((product) => {
        const custom = customizationMap.get(product._id.toString());

        // Calcular precio a mostrar
        let displayPrice = custom?.customPrice || '';
        if (custom?.tieredPricing && custom.tieredPricing.some((t: any) => t.enabled)) {
            const enabledTiers = custom.tieredPricing.filter((t: any) => t.enabled);
            const firstTier = enabledTiers[0];
            if (firstTier) {
                displayPrice = `Desde ${firstTier.price}`;
            }
        }

        return {
            ...product,
            customName: custom?.customName || '',
            customPrice: displayPrice,
            customDescription: custom?.customDescription || '',
            tieredPricing: custom?.tieredPricing, // Pasar tieredPricing para el Hero
        };
    });

    return {
        tenant,
        collection,
        tenantCollection,
        products: productsWithCustom,
        isSingleProduct: !!singleProductId
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
        return { title: 'No encontrado' };
    }

    const { tenant, collection, products, isSingleProduct } = data;
    const title = isSingleProduct
        ? `${products[0]?.customName || products[0]?.name} | ${tenant.globalTexts.headerText || tenantSlug}`
        : `${collection.name} | ${tenant.globalTexts.headerText || tenantSlug}`;

    return {
        title,
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

    const { tenant, collection, tenantCollection, products, isSingleProduct } = data;
    const ctaText = tenantCollection.ctaButtonText || tenant.globalTexts.ctaButtonText;

    // Si es una vista de producto único vía slug, o la colección tiene layout de landing
    if (tenantCollection.useLandingLayout || isSingleProduct) {
        return (
            <LandingPageLayout
                tenant={tenant as any}
                tenantCollection={tenantCollection}
                products={products}
                tenantSlug={tenantSlug}
                collectionSlug={collectionSlug}
            />
        );
    }

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

            {/* Header Profesional 2026 */}
            <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/20 aspect-[3/1] min-h-[260px] flex items-end">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    {collection.coverImage ? (
                        <Image
                            src={collection.coverImage}
                            alt={collection.name}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-8 md:p-12 w-full flex flex-col md:flex-row items-end justify-between gap-6 animate-fade-in-up">
                    <div className="max-w-2xl">
                        <Badge className="mb-4 bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 transition-colors uppercase tracking-widest text-[10px] font-black">
                            Colección Oficial
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                            {collection.name}
                        </h1>
                        {tenantCollection.persuasiveTextTop && (
                            <p className="text-slate-200 text-lg md:text-xl font-medium line-clamp-2 max-w-xl drop-shadow">
                                {tenantCollection.persuasiveTextTop}
                            </p>
                        )}
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col gap-3 shrink-0">
                        {tenant.socialLinks.whatsappLink && (
                            <WhatsAppButton
                                href={tenant.socialLinks.whatsappLink}
                                text={ctaText}
                                tenantId={tenant._id.toString()}
                                collectionId={collection._id.toString()}
                                className="shadow-2xl hover:scale-105 transition-transform active:scale-95"
                            />
                        )}
                        <span className="text-[11px] text-white/60 font-medium text-center md:text-right uppercase tracking-widest">
                            {products.length} Productos Disponibles
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid de productos */}
            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id.toString()}
                            id={product._id.toString()}
                            slug={product.slug}
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
