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
}

export function HeroSection({
    data,
    tenant,
    tenantId,
    collectionId,
    collectionName,
    productImages = []
}: HeroSectionProps) {
    // Obtener link de WhatsApp con fallback
    const whatsappLink = tenant?.socialLinks?.whatsappLink || '';

    return (
        <section className="relative overflow-hidden py-16 lg:py-24 px-4 bg-slate-50">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-3xl" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Slider de Productos - AHORA PRIMERO (Arriba en móvil) */}
                    <div className="w-full lg:w-1/2 relative animate-fade-in-up delay-200 group order-1 lg:order-2">
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

                    <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
                        <Badge className="mb-4 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Colección Exclusiva
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
                            {data.headline || 'Descubre Nuestra Nueva Colección'}
                        </h1>
                        <div
                            className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
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
        </section>
    );
}
