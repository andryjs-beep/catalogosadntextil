/**
 * Página principal del Catálogo de Revendedor
 * Versión Pro 2026 — WhatsApp CTA + Colores dinámicos + Trust Badges
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import { TenantCollection, Collection } from '@/lib/models';
import { getResellerContext } from '@/lib/reseller';
import type { ITenant } from '@/lib/models/Tenant';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { getAbsoluteImageUrl } from '@/lib/utils/metadata';

interface CollectionData {
    _id: string;
    slug: string;
    name: string;
    description: string;
    image: string;
}

// WhatsApp SVG Icon
function WhatsAppIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ resellerSlug: string }>;
}) {
    const { resellerSlug } = await params;
    await dbConnect();

    const context = await getResellerContext(resellerSlug);
    if (!context) {
        return { title: 'Catálogo no encontrado' };
    }
    const { tenant } = context;

    const title = `${tenant.resellerConfig.headerTitle} | Catálogo Oficial`;
    const description = `Explora las últimas colecciones de ${tenant.resellerConfig.headerTitle}. Diseños exclusivos y calidad premium. ¡Haz tu pedido ahora!`;
    // Usar imagen personalizada de compartir si existe; si no, usar logo solo si no está oculto
    const rawImage = tenant.resellerConfig.shareImage || (!tenant.resellerConfig.hideLogo ? tenant.branding.logo : '');
    const ogImage = rawImage ? await getAbsoluteImageUrl(rawImage) : null;

    return {
        title,
        description,
        openGraph: { title, description, images: ogImage ? [ogImage] : [] },
        twitter: { card: 'summary_large_image', title, description, images: ogImage ? [ogImage] : [] },
    };
}

export default async function ResellerHomePage({
    params,
}: {
    params: Promise<{ resellerSlug: string }>;
}) {
    const { resellerSlug } = await params;
    await dbConnect();

    const context = await getResellerContext(resellerSlug);
    if (!context) {
        notFound();
    }
    const { tenant, whatsappNumber } = context;
    const rc = tenant.resellerConfig;

    // Colores y textos configurables
    const primaryColor = rc.primaryColor || '#4f46e5';
    const buttonText = rc.ctaText || rc.buttonText || 'Hacer mi pedido ahora';
    const trustBadge1 = rc.trustBadge1 || '✅ Respuesta en minutos';
    const trustBadge2 = rc.trustBadge2 || '🔒 Pago seguro';
    const trustBadge3 = rc.trustBadge3 || '🚚 Envío rápido';
    const step1Title = rc.step1Title || 'Captura el diseño';
    const step1Desc = rc.step1Desc || 'Navega por el catálogo y toma captura del diseño que más te guste.';
    const step2Title = rc.step2Title || 'Dinos cuánto';
    const step2Desc = rc.step2Desc || 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.';
    const step3Title = rc.step3Title || 'Espera el envío';
    const step3Desc = rc.step3Desc || 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.';

    // WhatsApp link
    const waNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
    const customMsg = rc.whatsappMessage || '';
    const waMessage = encodeURIComponent(customMsg || 'Hola! Vi el catálogo y quiero hacer un pedido.');
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    // Colecciones
    const tenantCollections = await TenantCollection.find({
        tenantId: tenant._id,
        isPublished: true,
    })
        .populate('collectionId', 'slug name description coverImage order isActive')
        .lean();

    const sortedTenantCollections = (tenantCollections as any[]).sort((a, b) =>
        (a.collectionId?.order || 0) - (b.collectionId?.order || 0)
    );

    const collections = sortedTenantCollections
        .filter((tc: any) => tc.collectionId)
        .map((tc: any) => ({
            _id: tc.collectionId._id.toString(),
            slug: tc.collectionId.slug,
            name: tc.collectionId.name,
            description: tc.collectionId.description || '',
            image: tc.collectionId.coverImage || '',
        }));

    if (collections.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                    <Grid3X3 className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Sin colecciones</h2>
                <p className="text-slate-500 font-medium">Explora otros catálogos mientras trabajamos en este.</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .btn-wa-home {
                    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                    box-shadow: 0 12px 40px -4px rgba(37, 211, 102, 0.5);
                    transition: all 0.3s ease;
                }
                .btn-wa-home:hover {
                    background: linear-gradient(135deg, #20bd5a 0%, #0e7a6e 100%);
                    box-shadow: 0 20px 50px -4px rgba(37, 211, 102, 0.6);
                    transform: translateY(-3px);
                }
                .btn-wa-home:active { transform: scale(0.97); }
                @keyframes wa-pulse {
                    0%, 100% { box-shadow: 0 12px 40px -4px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4); }
                    50% { box-shadow: 0 12px 40px -4px rgba(37,211,102,0.5), 0 0 0 12px rgba(37,211,102,0); }
                }
                .wa-pulse { animation: wa-pulse 2.5s infinite; }
                .collection-card:hover .card-name { transform: translateX(6px); }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Grid de colecciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {collections.map((collection, idx) => {
                        const overlayColors = [
                            'from-indigo-600/90', 'from-rose-600/90', 'from-emerald-600/90',
                            'from-amber-600/90', 'from-purple-600/90', 'from-cyan-600/90'
                        ];
                        const overlayClass = overlayColors[idx % overlayColors.length];

                        return (
                            <Link
                                key={collection._id}
                                href={`/r/${resellerSlug}/${collection.slug}`}
                                className="collection-card group relative bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    {collection.image ? (
                                        <Image
                                            src={collection.image}
                                            alt={collection.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                            <Grid3X3 className="h-16 w-16 text-slate-300" />
                                        </div>
                                    )}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${overlayClass} via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white">
                                            Colección
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-7 pt-16 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-white">
                                    <h3 className="card-name text-2xl md:text-3xl font-black mb-2 tracking-tighter transition-all duration-300">
                                        {collection.name}
                                    </h3>
                                    {collection.description && (
                                        <p className="text-sm text-white/75 line-clamp-2 mb-5 font-medium leading-relaxed max-w-[280px]">
                                            {collection.description}
                                        </p>
                                    )}
                                    <div className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest shadow-lg">
                                        <span>Explorar</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* ═══ SECCIÓN: CÓMO HACER TU PEDIDO ═══ */}
                <section className="mt-24 mb-12">
                    <div className="text-center mb-14">
                        <span
                            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4"
                            style={{ background: `${primaryColor}18`, color: primaryColor }}
                        >
                            Proceso de Compra
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            Tu producto,{' '}
                            <span style={{ color: primaryColor }}>en 3 pasos.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { emoji: '📸', num: '01', title: step1Title, desc: step1Desc, color: '#25D366' },
                            { emoji: '💬', num: '02', title: step2Title, desc: step2Desc, color: '#128C7E' },
                            { emoji: '🎉', num: '03', title: step3Title, desc: step3Desc, color: primaryColor },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="relative p-10 rounded-[3rem] text-white overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${step.color}, color-mix(in srgb, ${step.color} 70%, black))`,
                                    boxShadow: `0 20px 40px -10px ${step.color}55`,
                                }}
                            >
                                <div className="absolute top-[-20px] right-[-15px] text-white/10 font-black text-[110px] leading-none pointer-events-none select-none">
                                    {step.num}
                                </div>
                                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30 text-4xl">
                                    {step.emoji}
                                </div>
                                <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">{step.title}</h3>
                                <p className="text-white/80 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Final */}
                    <div className="mt-16 flex flex-col items-center gap-4">
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-wa-home wa-pulse group inline-flex items-center gap-4 py-6 px-12 rounded-[2.5rem] text-white"
                        >
                            <WhatsAppIcon size={28} />
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-70">¿Listo para ordenar?</span>
                                <span className="text-2xl font-black">{buttonText}</span>
                            </div>
                            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform ml-2" />
                        </a>
                        <div className="flex items-center gap-5 flex-wrap justify-center">
                            {[trustBadge1, trustBadge2, trustBadge3].filter(Boolean).map((badge, i) => (
                                <span key={i} className="text-sm font-bold text-slate-500">{badge}</span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
