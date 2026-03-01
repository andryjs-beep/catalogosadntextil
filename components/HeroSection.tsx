import { WhatsAppButton } from './WhatsAppButton';
import { ProductSlider } from './ProductSlider';
import { Badge } from '@/components/ui/badge';
import type { ITenant } from '@/lib/models/Tenant';

interface HeroSectionProps {
    data: {
        headline: string;
        subheadline: string;
        ctaText: string;
        heroImage?: string; // Opcional, ya no se usa como principal
    };
    tenant: ITenant;
    tenantId: string;
    collectionId: string;
    collectionName?: string;
    productImages?: string[]; // NUEVO: Array de imágenes de productos
    price?: string; // NUEVO: Precio individual
    tieredPricing?: Array<{ unitCount: number; price: string; enabled: boolean }>; // NUEVO: Precios multinivel
}

export function HeroSection({
    data,
    tenant,
    tenantId,
    collectionId,
    collectionName,
    productImages = [],
    price,
    tieredPricing
}: HeroSectionProps) {
    // Obtener link de WhatsApp con fallback
    const whatsappLink = tenant?.socialLinks?.whatsappLink || '';

    // Lógica de precio para el Hero
    const hasTiers = tieredPricing && tieredPricing.some(t => t.enabled);
    const activeTiers = tieredPricing?.filter(t => t.enabled) || [];
    const firstTier = activeTiers[0];

    // Formateo profesional de precio (Estándar 2026)
    const formatPrice = (p: string) => {
        const clean = p.replace('$', '').trim();
        return `$${clean}`;
    };
    const displayValue = hasTiers && firstTier ? firstTier.price : (price || '');
    const displayPrice = displayValue ? formatPrice(displayValue) : '';

    return (
        <section className="relative overflow-hidden py-16 lg:py-24 px-4 bg-slate-50">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-3xl" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Slider de Productos */}
                    <div className="w-full lg:w-1/2 relative animate-fade-in-up delay-200 group order-2 lg:order-2">
                        <ProductSlider
                            images={productImages}
                            productName={collectionName || 'Producto'}
                            autoPlay={true}
                            interval={4000}
                        />

                        {/* Floating elements */}
                        <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                                    ✅
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Entrega rápida</p>
                                    <p className="text-xs text-slate-500">En todo el país</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in-up order-1 lg:order-1">
                        <Badge className="mb-4 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Colección Exclusiva
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-slate-900">
                            {data.headline || 'Descubre Nuestra Nueva Colección'}
                        </h1>
                        {displayPrice && (
                            <div className="mb-8 flex flex-col items-center lg:items-start gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-primary/60 uppercase tracking-tighter">
                                        {hasTiers ? 'Desde' : 'Precio'}
                                    </span>
                                    <span className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter flex items-baseline leading-[0.85]">
                                        {displayPrice}
                                        <span className="text-2xl md:text-3xl font-bold text-slate-400 ml-2">
                                            USD
                                        </span>
                                    </span>
                                </div>

                                {activeTiers.length > 1 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {activeTiers.slice(1).map((tier, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-xl flex items-center gap-3 animate-fade-in group/tier hover:border-primary/30 transition-colors"
                                                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover/tier:text-primary/60 transition-colors">Lleva {tier.unitCount}+</span>
                                                    <span className="text-lg font-black text-slate-700 leading-tight group-hover/tier:text-primary transition-colors">{formatPrice(tier.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {hasTiers && activeTiers.length === 1 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-md">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                                            Mejores ofertas disponibles por volumen
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div
                            className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 hero-subheadline-container"
                            dangerouslySetInnerHTML={{ __html: data.subheadline || 'Calidad premium diseñada para superar tus expectativas en cada detalle.' }}
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {whatsappLink ? (
                                <WhatsAppButton
                                    href={whatsappLink}
                                    text={data.ctaText || 'Consultar por WhatsApp'}
                                    collectionName={collectionName}
                                    tenantId={tenantId}
                                    collectionId={collectionId}
                                    className="shadow-lg hover:shadow-xl w-full sm:w-auto"
                                />
                            ) : (
                                <div className="bg-gray-300 text-gray-600 py-3 px-6 rounded-full text-sm">
                                    WhatsApp no configurado
                                </div>
                            )}
                            <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">100%</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Calidad</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">Envío</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Garantizado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style jsx>{`
                .hero-subheadline-container :global(ul) {
                    list-style-type: none;
                    padding: 0;
                    margin: 1rem 0;
                }
                .hero-subheadline-container :global(li) {
                    margin-bottom: 0.5rem;
                }
                /* Asegurar que si el HTML interno no tiene alineación, herede la del contenedor */
                .hero-subheadline-container :global(p),
                .hero-subheadline-container :global(div),
                .hero-subheadline-container :global(ul),
                .hero-subheadline-container :global(li) {
                    text-align: inherit;
                }
            `}</style>
        </section>
    );
}
