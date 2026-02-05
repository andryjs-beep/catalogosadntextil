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
    const { landingPageSections } = tenantCollection;
    const isSingleProduct = products.length === 1;
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
    // 2. Imagen de portada de la colección (SI existe)
    // 3. Si no hay portadas, imágenes del producto destacado
    const allProductImages = landingHeroImage
        ? [landingHeroImage]
        : (collectionCoverImage
            ? [collectionCoverImage]
            : (products.length > 0 ? (products[0].images || []) : []));

    // Si es producto único, el precio del Hero debe ser el de ese producto
    const heroPrice = products[0]?.customPrice || '';
    const heroTieredPricing = products[0]?.tieredPricing || [];

    return (
        <div className="landing-page-flow relative">
            {/* Ticker Banner (si está habilitado) */}
            <TickerBanner
                text={tenant.branding?.tickerText || ''}
                bgColor={tenant.branding?.tickerBgColor}
                textColor={tenant.branding?.tickerTextColor}
                speed={tenant.branding?.tickerSpeed as 'slow' | 'normal' | 'fast'}
                direction={tenant.branding?.tickerDirection as 'left' | 'right'}
                enabled={tenant.branding?.tickerEnabled}
            />

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

            {/* Benefits Section */}
            {landingPageSections?.benefits?.items?.length > 0 && (
                <BenefitsSection benefits={landingPageSections.benefits.items} />
            )}

            {/* Testimonials Section */}
            {testimonials.length > 0 && (
                <TestimonialSection testimonials={testimonials} />
            )}

            {/* FAQ Section */}
            {landingPageSections?.faq?.length > 0 && (
                <FAQSection faqs={landingPageSections.faq} />
            )}

            {/* Product Gallery Section (condicional) */}
            {(tenant.branding?.showProducts !== false) && products.length > 0 && (
                <section className="py-8 px-4 bg-slate-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
                                Nuestros Productos
                            </h2>
                            <p className="text-sm text-slate-500">Selección exclusiva para ti.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Terms and Conditions */}
            {termsConfig.enabled && termsConfig.content && (
                <section className="py-8 px-4 bg-slate-100">
                    <div className="container mx-auto max-w-4xl">
                        <TermsAndConditions
                            content={termsConfig.content}
                            requireAcceptance={termsConfig.requireAcceptance}
                        />
                    </div>
                </section>
            )}

            {/* Final CTA Section */}
            <section className="py-8 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <div
                        className="rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                        style={{
                            backgroundColor: tenant.branding?.primaryColor || '#3b82f6',
                            color: '#ffffff'
                        }}
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="relative z-10 space-y-4">
                            <h2 className="text-xl md:text-2xl font-bold">
                                {landingPageSections?.finalCTA?.headline || '¿Listo para hacer tu pedido?'}
                            </h2>
                            <p className="text-sm md:text-base opacity-90 max-w-xl mx-auto">
                                {landingPageSections?.finalCTA?.description || 'Haz click en el botón y uno de nuestros asesores te atenderá personalmente por WhatsApp.'}
                            </p>
                            <div className="flex justify-center pt-2">
                                <a
                                    href={`https://wa.me/${(tenant.socialLinks?.whatsappLink || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hola, me interesa la colección: ${collectionName}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 font-bold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-lg"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        color: tenant.branding?.primaryColor || '#3b82f6'
                                    }}
                                >
                                    {landingPageSections?.finalCTA?.ctaText || 'Contactar Ahora'}
                                </a>
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
        </div>
    );
}
