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
    const collectionName = tenantCollection.collectionId?.name || 'Colección';

    // Configuración premium con defaults
    const countdown = landingPageSections?.countdown || { enabled: false };
    const sizes = landingPageSections?.sizes || { enabled: false, items: [] };
    const termsConfig = landingPageSections?.termsAndConditions || { enabled: false };
    const badge = landingPageSections?.badge || { enabled: false };
    const testimonials = landingPageSections?.socialProof?.testimonials || [];
    const showGallery = landingPageSections?.showProductGallery !== false;
    const showSticky = landingPageSections?.showStickyCTA !== false;

    // Recopilar todas las imágenes de productos para la galería principal
    const allProductImages = products.flatMap(p => p.images || []).slice(0, 8);

    return (
        <div className="landing-page-flow relative">
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

            {/* Product Gallery Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                            Nuestros Productos
                        </h2>
                        <p className="text-slate-600">Selección exclusiva para ti.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id.toString()}
                                id={product._id.toString()}
                                name={product.customName || product.name}
                                price={product.customPrice || ''}
                                image={product.images?.[0] || ''}
                                tenantSlug={tenantSlug}
                                collectionSlug={collectionSlug}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            {landingPageSections?.faq?.length > 0 && (
                <FAQSection faqs={landingPageSections.faq} />
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
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="bg-primary text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                {landingPageSections?.finalCTA?.headline || '¿Listo para hacer tu pedido?'}
                            </h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                {landingPageSections?.finalCTA?.description || 'Haz click en el botón y uno de nuestros asesores te atenderá personalmente por WhatsApp.'}
                            </p>
                            <div className="flex justify-center pt-4">
                                <WhatsAppButton
                                    href={tenant.socialLinks?.whatsappLink || ''}
                                    text={landingPageSections?.finalCTA?.ctaText || 'Contactar Ahora'}
                                    collectionName={collectionName}
                                    tenantId={tenant._id.toString()}
                                    collectionId={tenantCollection.collectionId?._id?.toString() || ''}
                                    className="bg-white text-primary hover:bg-slate-100 text-xl py-6 px-10"
                                />
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
