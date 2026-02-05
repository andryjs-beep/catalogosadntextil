/**
 * Detalle de Producto - Diseño tipo Landing Page
 */
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Tenant, Collection, Product, TenantProduct, TenantCollection } from '@/lib/models';
import { ImageGallery } from '@/components/ImageGallery';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { ArrowLeft, CheckCircle, MapPin, ExternalLink } from 'lucide-react';
import { LandingPageLayout } from '@/components/LandingPageLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { GalleryMode } from '@/lib/models/TenantProduct';

// Tipos para los datos con lean()
interface TenantData {
    _id: { toString(): string };
    slug: string;
    socialLinks: {
        whatsappLink: string;
        address?: string;
        googleMapsLink?: string;
        locationImage?: string;
    };
    globalTexts: { ctaButtonText: string };
    branding: { primaryColor: string; secondaryColor: string };
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
    description?: string;
    images: string[];
}

interface TenantCollectionData {
    ctaButtonText: string;
    landingPageSections?: any;
}

interface CustomizationData {
    customTitle?: string;
    customName?: string;
    customPrice?: string;
    customDescription?: string;
    ctaText?: string;
    ctaSubtext?: string;
    footerNote?: string;
    galleryMode?: GalleryMode;
    sliderSpeed?: number;
    tieredPricing?: Array<{
        unitCount: number;
        price: string;
        enabled: boolean;
    }>;
    showLocation?: boolean;
    useLandingLayout?: boolean;
    landingContent?: {
        headline?: string;
        subheadline?: string;
    };
}

async function getProductData(
    tenantSlug: string,
    collectionSlug: string,
    productIdOrSlug: string
) {
    await dbConnect();

    const tenant = (await Tenant.findOne({ slug: tenantSlug, isActive: true }).lean()) as unknown as TenantData | null;
    if (!tenant) return null;

    const collection = (await Collection.findOne({ slug: collectionSlug }).lean()) as unknown as CollectionData | null;
    if (!collection) return null;

    // Buscar por ID o por Slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(productIdOrSlug);
    const productQuery = isObjectId
        ? { _id: productIdOrSlug }
        : { slug: productIdOrSlug };

    const product = (await Product.findOne(productQuery).lean()) as unknown as ProductData | null;
    if (!product) return null;

    // Verificar que el producto está en la colección (usando string para comparar)
    const productIdStr = product._id.toString();
    const isInCollection = collection.productIds.some(
        (id) => id.toString() === productIdStr
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

// Parsear descripción con viñetas
function parseDescription(text: string) {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
        // Si empieza con - o • o ✓ o ✔, es una viñeta
        const isBullet = /^[-•✓✔■□▪▫]\s*/.test(line);
        const cleanLine = line.replace(/^[-•✓✔■□▪▫]\s*/, '').trim();
        return { text: cleanLine, isBullet };
    });
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

    // Valores con fallbacks
    const productTitle = customization?.customTitle || '';
    const productName = customization?.customName || product.name;
    const productPrice = customization?.customPrice || '';
    // Descripción base del producto o personalizada
    const baseDescription = product.description || '';
    const finalDescription = customization?.customDescription || baseDescription;

    // Procesar descripción para viñetas
    const descriptionItems = finalDescription
        ? finalDescription.split('\n').filter(line => line.trim()).map(line => ({
            text: line.replace(/^-\s*/, '').trim(),
            isBullet: line.trim().startsWith('-'),
        }))
        : [];

    const ctaText = customization?.ctaText || tenant.globalTexts.ctaButtonText;
    const ctaSubtext = customization?.ctaSubtext || '';
    const footerNote = customization?.footerNote || '';
    const galleryMode = customization?.galleryMode || 'album';
    const sliderSpeed = customization?.sliderSpeed || 3;
    const showProductLocation = customization?.showLocation !== false; // Default true

    if (customization?.useLandingLayout) {
        return (
            <LandingPageLayout
                tenant={tenant as any}
                tenantCollection={{
                    ...tenantCollection,
                    collectionId: collection,
                    landingPageSections: {
                        ...tenantCollection.landingPageSections,
                        hero: {
                            ...tenantCollection.landingPageSections?.hero,
                            headline: customization.landingContent?.headline || productTitle || productName,
                            subheadline: customization.landingContent?.subheadline || '',
                        }
                    }
                }}
                products={[{
                    ...product,
                    customName: productName,
                    customPrice: productPrice,
                    tieredPricing: customization.tieredPricing,
                    customDescription: finalDescription
                }]}
                tenantSlug={tenantSlug}
                collectionSlug={collectionSlug}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Analytics Tracker */}
            <AnalyticsTracker
                tenantId={tenant._id.toString()}
                type="product_view"
                collectionId={collection._id.toString()}
                productId={product._id.toString()}
            />

            {/* Header con título destacado */}
            {productTitle && (
                <div
                    className="text-white py-6 px-4"
                    style={{
                        background: `linear-gradient(135deg, ${tenant.branding.primaryColor || '#1e293b'}, ${tenant.branding.secondaryColor || '#0f172a'})`
                    }}
                >
                    <div className="container mx-auto text-center">
                        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
                            {productTitle}
                        </h1>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-6">
                {/* Navegación */}
                <Link
                    href={`/t/${tenantSlug}/${collectionSlug}`}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a {collection.name}
                </Link>

                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Galería de imágenes - ARRIBA */}
                    <div className="w-full">
                        <ImageGallery
                            images={product.images}
                            mode={galleryMode}
                            sliderSpeed={sliderSpeed}
                            productName={productName}
                        />
                    </div>

                    {/* Información del producto - ABAJO */}
                    <div className="space-y-8 bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
                        {/* Nombre y precio */}
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                                {customization?.useLandingLayout && customization.landingContent?.headline
                                    ? customization.landingContent.headline
                                    : productName}
                            </h2>

                            {/* Subheadline Enriquecida (Silicon Valley style) */}
                            {customization?.useLandingLayout && customization.landingContent?.subheadline && (
                                <div
                                    className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto"
                                    dangerouslySetInnerHTML={{ __html: customization.landingContent.subheadline }}
                                />
                            )}

                            {/* Visualización de Precios Multinivel */}
                            {customization?.tieredPricing && customization.tieredPricing.some(t => t.enabled) ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {customization.tieredPricing.filter(t => t.enabled).map((tier) => (
                                            <div
                                                key={tier.unitCount}
                                                className="bg-white border-2 rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
                                                style={{
                                                    borderColor: tenant.branding.primaryColor + '30',
                                                    boxShadow: `0 10px 15px -3px ${tenant.branding.primaryColor}15`
                                                }}
                                            >
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                    {tier.unitCount} {tier.unitCount === 1 ? 'Unidad' : 'Unidades'}
                                                </div>
                                                <div
                                                    className="text-2xl font-black"
                                                    style={{ color: tenant.branding.primaryColor || '#3b82f6' }}
                                                >
                                                    {tier.price}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 italic">
                                        * Precios válidos para la misma referencia
                                    </p>
                                </div>
                            ) : (
                                productPrice && (
                                    <div
                                        className="text-2xl md:text-3xl font-bold"
                                        style={{ color: tenant.branding.primaryColor || '#3b82f6' }}
                                    >
                                        {productPrice}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Descripción Pro (Silicon Valley 2026 Style) */}
                        <div className="prose prose-slate max-w-none">
                            <div
                                className="text-slate-700 leading-relaxed text-lg md:text-xl text-center"
                                dangerouslySetInnerHTML={{ __html: finalDescription }}
                            />
                        </div>

                        {/* Especificaciones con Checks (Si hay líneas con guiones) */}
                        {descriptionItems.some(item => item.isBullet) && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-2xl mx-auto w-full">
                                <h3 className="text-center font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">
                                    Lo que obtienes
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {descriptionItems.filter(item => item.isBullet).map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle
                                                className="h-5 w-5 flex-shrink-0"
                                                style={{ color: tenant.branding.primaryColor || '#22c55e' }}
                                            />
                                            <span className="text-slate-700 font-medium">
                                                {item.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Ubicación / Ubícanos */}
                        {showProductLocation && tenant.socialLinks.address && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    Ubícanos
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-slate-700 font-medium">
                                        {tenant.socialLinks.address}
                                    </p>

                                    {tenant.socialLinks.locationImage && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                                            <img
                                                src={tenant.socialLinks.locationImage}
                                                alt="Mapa de ubicación"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {tenant.socialLinks.googleMapsLink && (
                                        <a
                                            href={tenant.socialLinks.googleMapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center w-full gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-colors"
                                        >
                                            Ver en Google Maps <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botón CTA principal */}
                        {tenant.socialLinks.whatsappLink && (
                            <div className="space-y-3 pt-4">
                                <WhatsAppButton
                                    href={tenant.socialLinks.whatsappLink}
                                    text={ctaText}
                                    productName={productName}
                                    tenantId={tenant._id.toString()}
                                    productId={product._id.toString()}
                                    collectionId={collection._id.toString()}
                                    className="w-full justify-center text-lg py-4 font-semibold"
                                />
                                {ctaSubtext && (
                                    <p className="text-center text-sm text-slate-500">
                                        {ctaSubtext}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Nota de pie */}
                        {footerNote && (
                            <div
                                className="text-sm text-white p-4 rounded-xl text-center"
                                style={{
                                    background: `linear-gradient(135deg, ${tenant.branding.primaryColor || '#1e293b'}, ${tenant.branding.secondaryColor || '#0f172a'})`
                                }}
                            >
                                {footerNote}
                            </div>
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
