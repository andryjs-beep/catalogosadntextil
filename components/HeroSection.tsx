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
        <section className="relative overflow-hidden py-10 md:py-20 lg:py-28 px-4 bg-background">
            {/* Background blobs - More subtle and responsive */}
            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-secondary/10 rounded-full blur-[80px]" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center">
                    {/* Slider de Productos */}
                    <div className="w-full lg:w-1/2 relative animate-fade-in-up delay-200 group order-1 lg:order-2">
                        <div className="relative rounded-3xl overflow-hidden premium-shadow group-hover:shadow-2xl transition-all duration-500">
                            <ProductSlider
                                images={productImages}
                                productName={collectionName || 'Producto'}
                                autoPlay={true}
                                interval={5000}
                            />
                        </div>

                        {/* Floating elements - Optimized for mobile */}
                        <div className="absolute -bottom-4 -right-4 md:-right-8 bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-white/20 hidden sm:block animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 text-lg">
                                    ✓
                                </div>
                                <div className="pr-2">
                                    <p className="text-xs md:text-sm font-bold text-slate-900">Entrega rápida</p>
                                    <p className="text-[10px] md:text-xs text-slate-500">Todo el país</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in-up order-2 lg:order-1 mt-4 lg:mt-0">
                        <Badge className="mb-4 md:mb-6 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                            Colección Exclusiva
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900 balance-text">
                            {data.headline || 'Descubre Nuestra Nueva Colección'}
                        </h1>

                        {displayPrice && (
                            <div className="mb-8 md:mb-10 flex flex-col items-center lg:items-start gap-4">
                                <div className="flex items-baseline gap-3">
                                    <div className="flex flex-col items-start translate-y-1">
                                        <span className="text-[10px] md:text-xs font-black text-primary/40 uppercase tracking-[0.2em]">
                                            {hasTiers ? 'Desde' : 'Precio'}
                                        </span>
                                    </div>
                                    <span className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter flex items-baseline leading-none">
                                        {displayPrice}
                                        <span className="text-xl md:text-2xl font-black text-slate-300 ml-2 tracking-normal">
                                            USD
                                        </span>
                                    </span>
                                </div>

                                {activeTiers.length > 1 && (
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 max-w-md">
                                        {activeTiers.slice(1).map((tier, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm px-4 py-2.5 rounded-2xl flex items-center gap-3 animate-fade-in group/tier hover:border-primary/20 hover:bg-white transition-all duration-300"
                                                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest group-hover/tier:text-primary/60">Lleva {tier.unitCount}+</span>
                                                    <span className="text-base font-black text-slate-700 leading-tight group-hover/tier:text-primary">{formatPrice(tier.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {hasTiers && activeTiers.length === 1 && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-l-4 border-primary rounded-r-2xl">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest leading-none">
                                            Mejores ofertas por volumen disponibles
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className="text-base md:text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 hero-subheadline-container font-medium"
                            dangerouslySetInnerHTML={{ __html: data.subheadline || 'Calidad premium diseñada para superar tus expectativas en cada detalle.' }}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            {whatsappLink ? (
                                <WhatsAppButton
                                    href={whatsappLink}
                                    text={data.ctaText || 'Consultar por WhatsApp'}
                                    collectionName={collectionName}
                                    tenantId={tenantId}
                                    collectionId={collectionId}
                                    className="shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto transform hover:-translate-y-1 transition-all duration-300 text-lg py-6 px-10"
                                />
                            ) : (
                                <div className="bg-slate-100 text-slate-400 py-4 px-8 rounded-full text-sm font-medium">
                                    WhatsApp no configurado
                                </div>
                            )}

                            <div className="flex items-center gap-8 md:gap-10 border-l border-slate-100 pl-0 sm:pl-8 mt-2 sm:mt-0">
                                <div className="text-center sm:text-left">
                                    <p className="text-xl font-black text-slate-900 leading-none">100%</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Calidad</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xl font-black text-slate-900 leading-none flex items-center justify-center sm:justify-start">
                                        <span className="text-green-500 mr-1">🚚</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Envío</p>
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
                    margin: 1.5rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .hero-subheadline-container :global(li) {
                    margin-bottom: 0;
                    padding-left: 1.5rem;
                    position: relative;
                }
                .hero-subheadline-container :global(li)::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: var(--primary);
                    font-weight: bold;
                }
                .hero-subheadline-container :global(p),
                .hero-subheadline-container :global(div),
                .hero-subheadline-container :global(ul),
                .hero-subheadline-container :global(li) {
                    text-align: inherit;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                .balance-text {
                    text-wrap: balance;
                }
            `}</style>
        </section>
    );
}
