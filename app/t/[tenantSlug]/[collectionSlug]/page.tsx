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
    coverImage?: string;
    customName?: string;
    customPrice?: string;
    tieredPricing?: Array<{ unitCount: number; price: string; enabled: boolean }>;
    customDescription?: string;
    reviewName?: string;
    starRating?: number;
}

interface CustomizationData {
    productId: { toString(): string };
    customName?: string;
    customPrice?: string;
    tieredPricing?: Array<{ unitCount: number; price: string; enabled: boolean }>;
    customDescription?: string;
    landingContent?: any;
    useLandingLayout?: boolean;
    reviewName?: string;
    starRating?: number;
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
            landingContent: custom?.landingContent || null,
            useLandingLayout: custom?.useLandingLayout || false,
            coverImage: product.coverImage, // Pasar la nueva portada
            reviewName: custom?.reviewName || '',
            starRating: custom?.starRating || 5,
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
        ? `${products[0]?.customName || products[0]?.name} | ${tenant.globalTexts?.headerText || tenantSlug}`
        : `${collection.name} | ${tenant.globalTexts?.headerText || tenantSlug}`;

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
    const ctaText = tenantCollection.ctaButtonText || tenant.globalTexts?.ctaButtonText || 'Contactar';

    // PRIORIDAD 2026: Flujo de Catálogo -> Landing
    // Si es un producto único (acceso por slug de producto), usar LandingPageLayout
    if (isSingleProduct) {
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
                href={`/`}
                className="inline-flex items-center gap-2 text-slate-600 hover:tenant-text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
            </Link>

            {/* Título de Colección Minimalista 2026 */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
                <div className="animate-fade-in-up">
                    <Badge variant="outline" className="mb-3 text-[10px] uppercase font-black tracking-widest border-slate-200 text-slate-400">
                        Catálogo Oficial
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        {collection.name}
                    </h1>
                    {tenantCollection.persuasiveTextTop && (
                        <p className="mt-3 text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                            {tenantCollection.persuasiveTextTop}
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 animate-fade-in delay-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                        {products.length} Referencias Disponibles
                    </span>
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
                            coverImage={product.coverImage}
                            tenantSlug={tenantSlug}
                            collectionSlug={collectionSlug}
                            reviewName={product.reviewName}
                            starRating={product.starRating}
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
