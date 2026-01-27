import Image from 'next/image';
import { WhatsAppButton } from './WhatsAppButton';
import { Badge } from '@/components/ui/badge';
import type { ITenant } from '@/lib/models/Tenant';

interface HeroSectionProps {
    data: {
        headline: string;
        subheadline: string;
        ctaText: string;
        heroImage: string;
    };
    tenant: ITenant;
    tenantId: string;
    collectionId: string;
    collectionName?: string;
}

export function HeroSection({ data, tenant, tenantId, collectionId, collectionName }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden py-16 lg:py-24 px-4 bg-slate-50">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-3xl" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left animate-fade-in-up">
                        <Badge className="mb-4 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Colección Exclusiva
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
                            {data.headline || 'Descubre Nuestra Nueva Colección'}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            {data.subheadline || 'Calidad premium diseñada para superar tus expectativas en cada detalle.'}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <WhatsAppButton
                                href={tenant.socialLinks.whatsappLink}
                                text={data.ctaText || 'Consultar por WhatsApp'}
                                collectionName={collectionName}
                                tenantId={tenantId}
                                collectionId={collectionId}
                                className="shadow-lg hover:shadow-xl w-full sm:w-auto"
                            />
                            <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">100%</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Calidad</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">Envío</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Garanzidado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-fade-in-up delay-200">
                        {data.heroImage ? (
                            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                <Image
                                    src={data.heroImage}
                                    alt={data.headline}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="aspect-square bg-white rounded-3xl shadow-xl flex items-center justify-center p-8 border border-slate-100">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                                        <span className="text-4xl">✨</span>
                                    </div>
                                    <p className="text-slate-400 font-medium italic">Sube una imagen impactante para tu Hero</p>
                                </div>
                            </div>
                        )}
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
                </div>
            </div>
        </section>
    );
}
