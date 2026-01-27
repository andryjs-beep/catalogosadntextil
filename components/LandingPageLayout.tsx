import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { FAQSection } from './FAQSection';
import { ProductCard } from './ProductCard';
import { WhatsAppButton } from './WhatsAppButton';
import type { ITenant } from '@/lib/models/Tenant';
import type { ITenantCollection } from '@/lib/models/TenantCollection';

interface LandingPageLayoutProps {
    tenant: ITenant;
    tenantCollection: any; // ITenantCollection populated
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
    const ctaText = tenantCollection.ctaButtonText || tenant.globalTexts.ctaButtonText;

    return (
        <div className="landing-page-flow">
            {/* Hero Section */}
            <HeroSection
                data={landingPageSections.hero}
                tenant={tenant}
                tenantId={tenant._id.toString()}
                collectionId={tenantCollection.collectionId._id.toString()}
            />

            {/* Benefits Section */}
            <BenefitsSection benefits={landingPageSections.benefits.items} />

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
                                image={product.images[0] || ''}
                                tenantSlug={tenantSlug}
                                collectionSlug={collectionSlug}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQSection faqs={landingPageSections.faq} />

            {/* Final CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="bg-primary text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        {/* Static pattern overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                {landingPageSections.finalCTA.headline || '¿Listo para hacer tu pedido?'}
                            </h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                {landingPageSections.finalCTA.description || 'Haz click en el botón y uno de nuestros asesores te atenderá personalmente por WhatsApp.'}
                            </p>
                            <div className="flex justify-center pt-4">
                                <WhatsAppButton
                                    href={tenant.socialLinks.whatsappLink}
                                    text={landingPageSections.finalCTA.ctaText || 'Contactar Ahora'}
                                    tenantId={tenant._id.toString()}
                                    collectionId={tenantCollection.collectionId._id.toString()}
                                    className="bg-white text-primary hover:bg-slate-100 text-xl py-6 px-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
