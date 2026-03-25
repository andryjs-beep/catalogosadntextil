'use client';

import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { FAQSection } from './FAQSection';
import { ProductCard } from './ProductCard';
import { WhatsAppButton } from './WhatsAppButton';
import { CountdownTimer } from './CountdownTimer';
import { ProductGallery } from './ProductGallery';
import { SizeSelector } from './SizeSelector';
import { StickyFooterCTA } from './StickyFooterCTA';
import { TermsAndConditions } from './TermsAndConditions';
import { TestimonialSection } from './TestimonialSection';
import { BadgeOverlay } from './BadgeOverlay';
import { TickerBanner } from './TickerBanner';
import type { ITenant } from '@/lib/models/Tenant';

interface LandingPageLayoutProps {
    tenant: ITenant;
    tenantCollection: any;
    products: any[];
    tenantSlug: string;
    collectionSlug: string;
}

export function LandingPageLayout({
    tenant,
    tenantCollection,
    products,
    tenantSlug,
    collectionSlug
}: LandingPageLayoutProps) {
    const isSingleProduct = products.length === 1;

    // PRIORIDAD 2026: Si es producto único, usar su landingContent específico si existe
    const productLanding = (isSingleProduct && products[0]?.landingContent)
        ? products[0].landingContent
        : null;

    let { landingPageSections } = tenantCollection;

    // Sobrescribir secciones si hay contenido de producto específico
    if (productLanding) {
        landingPageSections = {
            ...landingPageSections,
            hero: productLanding.hero || landingPageSections?.hero,
            benefits: { items: productLanding.features || landingPageSections?.benefits?.items || [] },
            faq: productLanding.faq || landingPageSections?.faq || [],
            finalCTA: productLanding.finalCTA || landingPageSections?.finalCTA
        };
    }

    const collectionName = isSingleProduct
        ? (products[0].customName || products[0].name)
        : (tenantCollection.collectionId?.name || 'Colección');

    // Configuración premium con defaults
    const countdown = landingPageSections?.countdown || { enabled: false };
    const sizes = landingPageSections?.sizes || { enabled: false, items: [] };
    const termsConfig = landingPageSections?.termsAndConditions || { enabled: false };
    const badge = landingPageSections?.badge || { enabled: false };
    const testimonials = landingPageSections?.socialProof?.testimonials || [];
    const showGallery = landingPageSections?.showProductGallery !== false;
    const showSticky = landingPageSections?.showStickyCTA !== false;

    // Recopilar imágenes para el Hero
    // PRIORIDAD PROFESIONAL 2026: 
    // 1. Imagen de Hero específica configurada para la landing
    // 2. Si es producto único, todas sus imágenes
    // 3. Si es colección, las imágenes del PRIMER producto (destacado) para mantener identidad visual pura
    const landingHeroImage = landingPageSections?.hero?.heroImage;
    const collectionCoverImage = tenantCollection.collectionId?.coverImage;

    // PRIORIDAD PROFESIONAL 2026: 
    // 1. Imagen de Hero específica configurada para la landing
    // 2. Si es producto único, PRIORIDAD TOTAL a su galería (si existe)
    // 3. Imagen de portada de la colección (SI existe)
    // 4. Si no hay nada, imágenes del primer producto
    const allProductImages = landingHeroImage
        ? [landingHeroImage]
        : (isSingleProduct && products[0]?.images?.length > 0
            ? products[0].images
            : (collectionCoverImage
                ? [collectionCoverImage]
                : (products.length > 0 ? (products[0].images || []) : [])));

    // Si es producto único, el precio del Hero debe ser el de ese producto
    const heroPrice = products[0]?.customPrice || '';
    const heroTieredPricing = products[0]?.tieredPricing || [];

    return (
        <main className="min-h-screen tenant-font-body" style={{ backgroundColor: 'var(--color-body-bg)' }}>

            {/* Badge Overlay (si está habilitado) */}
            {badge.enabled && (
                <BadgeOverlay
                    type={badge.type || 'new'}
                    text={badge.customText}
                    discount={badge.discount}
                    position="top-left"
                />
            )}

            {/* Countdown Timer (si está habilitado) */}
            {countdown.enabled && (
                <CountdownTimer
                    durationMinutes={countdown.durationMinutes || 30}
                    title={countdown.title}
                    subtitle={countdown.subtitle}
                    show={true}
                />
            )}

            {/* Hero Section con Slider de Productos */}
            <HeroSection
                data={landingPageSections?.hero || {}}
                tenant={tenant}
                tenantId={tenant._id.toString()}
                collectionId={tenantCollection.collectionId?._id?.toString() || ''}
                collectionName={collectionName}
                productImages={allProductImages}
                price={heroPrice}
                tieredPricing={heroTieredPricing}
            />

            {/* ProductGallery ELIMINADO - Las imágenes ahora se muestran en el slider del Hero */}

            {/* Size Selector (si está habilitado) */}
            {sizes.enabled && sizes.items?.length > 0 && (
                <section className="py-8 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <SizeSelector sizes={sizes.items} />
                    </div>
                </section>
            )}

            {/* Product Gallery Section - PRIORIDAD 2026: Ver catálogo inmediatamente */}
            {(tenant.branding?.showProducts !== false) && products.length > 0 && !isSingleProduct && (
                <section className="py-16 md:py-24 px-4 bg-slate-50/50">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-slate-900 tracking-tight">
                                {collectionName}
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px w-8 bg-primary/20" />
                                <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.3em]">
                                    Catálogo Disponible ({products.length})
                                </p>
                                <div className="h-px w-8 bg-primary/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id.toString()}
                                    id={product._id.toString()}
                                    slug={product.slug}
                                    name={product.customName || product.name}
                                    price={product.customPrice || ''}
                                    image={product.images?.[0] || ''}
                                    coverImage={product.coverImage}
                                    tenantSlug={tenantSlug}
                                    collectionSlug={collectionSlug}
                                    reviewName={product.reviewName}
                                    starRating={product.starRating}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Benefits Section */}
            {landingPageSections?.benefits?.items?.length > 0 && (
                <div className="bg-white">
                    <BenefitsSection benefits={landingPageSections.benefits.items} />
                </div>
            )}

            {/* FAQ Section */}
            {landingPageSections?.faq?.length > 0 && (
                <div className="bg-slate-50/30">
                    <FAQSection faqs={landingPageSections.faq} />
                </div>
            )}

            {/* Terms and Conditions */}
            {termsConfig.enabled && termsConfig.content && (
                <section className="py-12 md:py-20 px-4 bg-white border-t border-slate-100">
                    <div className="container mx-auto max-w-4xl">
                        <TermsAndConditions
                            content={termsConfig.content}
                            requireAcceptance={termsConfig.requireAcceptance}
                        />
                    </div>
                </section>
            )}

            {/* Final CTA Section - High Impact Premium Design */}
            <section className="py-16 md:py-28 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div
                        className="rounded-[3rem] p-8 md:p-16 lg:p-20 shadow-2xl relative overflow-hidden text-center group"
                        style={{
                            backgroundColor: tenant.branding?.primaryColor || '#0f172a',
                            color: '#ffffff'
                        }}
                    >
                        {/* Abstract Background pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />

                        <div className="relative z-10 space-y-8 md:space-y-12">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm border border-white/5">
                                    Atención Directa
                                </span>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none balance-text">
                                    {landingPageSections?.finalCTA?.headline || '¿Listo para hacer tu pedido?'}
                                </h2>
                                <p className="text-base md:text-xl opacity-70 max-w-2xl mx-auto font-medium leading-relaxed balance-text text-white/90">
                                    {landingPageSections?.finalCTA?.description || 'Haz click en el botón y uno de nuestros asesores te atenderá personalmente por WhatsApp.'}
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-6 pt-4 w-full">
                                <WhatsAppButton
                                    href={tenant.socialLinks?.whatsappLink || ''}
                                    text={landingPageSections?.finalCTA?.ctaText || 'Contactar Ahora'}
                                    collectionName={collectionName}
                                    tenantId={tenant._id.toString()}
                                    variant="large"
                                    className="!bg-white !text-slate-900 hover:!bg-slate-100"
                                />

                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-40">
                                    Respuesta inmediata garantizada
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Footer CTA (Mobile) */}
            {showSticky && (
                <StickyFooterCTA
                    phoneNumber={tenant.socialLinks?.whatsappLink || ''}
                    collectionName={collectionName}
                    ctaText="¡Comprar Ahora!"
                />
            )}
        </main>
    );
}
