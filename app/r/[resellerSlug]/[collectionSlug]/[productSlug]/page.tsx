/**
 * Página de Detalle de Producto para Revendedor
 * Versión Pro 2026 — WhatsApp CTA + Sticky Mobile Bar + Trust Badges
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import { TenantCollection, Collection, Product } from '@/lib/models';
import { getResellerContext } from '@/lib/reseller';
import type { ITenant } from '@/lib/models/Tenant';
import { ChevronLeft } from 'lucide-react';
import { ImageGallery } from '@/components/ImageGallery';
import { getAbsoluteImageUrl } from '@/lib/utils/metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string; productSlug: string }>;
}) {
    const { resellerSlug, productSlug } = await params;
    await dbConnect();

    const context = await getResellerContext(resellerSlug);
    if (!context) {
        return { title: 'Catálogo no encontrado' };
    }
    const { tenant } = context;

    const product = await Product.findOne({ slug: productSlug }).lean();
    if (!product) return { title: 'Producto no encontrado' };

    const productName = (product as any).name;
    const title = `${productName} | ${tenant.resellerConfig.headerTitle}`;
    const description = (product as any).description || `Descubre ${productName}. Calidad garantizada. Haz tu pedido ahora desde el catálogo oficial.`;

    const imagePath = (product as any).coverImage || ((product as any).images && (product as any).images[0]);
    const rawFallback = tenant.resellerConfig.shareImage || (!tenant.resellerConfig.hideLogo ? tenant.branding.logo : '');
    const imageUrl = await getAbsoluteImageUrl(imagePath);
    const fallbackImage = rawFallback ? await getAbsoluteImageUrl(rawFallback) : null;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: imageUrl ? [imageUrl] : (fallbackImage ? [fallbackImage] : []),
        },
    };
}

// Ícono SVG de WhatsApp inline
function WhatsAppIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    );
}

export default async function ResellerProductPage({
    params,
}: {
    params: Promise<{ resellerSlug: string; collectionSlug: string; productSlug: string }>;
}) {
    const { resellerSlug, collectionSlug, productSlug } = await params;
    await dbConnect();

    const context = await getResellerContext(resellerSlug);
    if (!context) {
        notFound();
    }
    const { tenant, whatsappNumber } = context;
    const rc = tenant.resellerConfig;

    // Colores personalizados
    const primaryColor = rc.primaryColor || '#4f46e5';

    // Buscar colección
    const collection = await Collection.findOne({ slug: collectionSlug }).lean() as { _id: any; name: string } | null;
    if (!collection) notFound();

    const tenantCollection = await TenantCollection.findOne({
        tenantId: tenant._id,
        collectionId: collection._id,
    }).lean();
    if (!tenantCollection) notFound();

    let product = await Product.findOne({ slug: productSlug }).lean();
    if (!product && productSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(productSlug).lean();
    }
    if (!product) notFound();

    const productData = product as any;

    // Construir mensaje de WhatsApp
    const waNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
    const customMsg = rc.whatsappMessage || '';
    const defaultMsg = `Hola! Vi este producto en el catálogo y quiero hacer un pedido: ${productData.name}`;
    const waMessage = encodeURIComponent(customMsg || defaultMsg);
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    // Textos configurables
    const buttonText = rc.buttonText || 'Pedir por WhatsApp';
    const buttonSubtext = rc.buttonSubtext || '¡Hazlo realidad!';
    const badgeText = rc.badgeText || 'Diseño Disponible';
    const trustBadge1 = rc.trustBadge1 || '✅ Respuesta en minutos';
    const trustBadge2 = rc.trustBadge2 || '🔒 Pago seguro';
    const trustBadge3 = rc.trustBadge3 || '🚚 Envío rápido';
    const step1Title = rc.step1Title || 'Captura el diseño';
    const step1Desc = rc.step1Desc || 'Navega por el catálogo y toma captura del diseño que más te guste.';
    const step2Title = rc.step2Title || 'Dinos cuánto';
    const step2Desc = rc.step2Desc || 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.';
    const step3Title = rc.step3Title || 'Espera el envío';
    const step3Desc = rc.step3Desc || 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.';

    return (
        <>
            {/* CSS Variables para colores dinámicos */}
            <style>{`
                :root {
                    --primary: ${primaryColor};
                    --primary-dark: color-mix(in srgb, ${primaryColor} 85%, black);
                    --wa-green: #25D366;
                    --wa-dark: #128C7E;
                }
                .btn-whatsapp {
                    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                    box-shadow: 0 8px 32px -4px rgba(37, 211, 102, 0.5);
                }
                .btn-whatsapp:hover {
                    background: linear-gradient(135deg, #20bd5a 0%, #0e7a6e 100%);
                    box-shadow: 0 16px 40px -4px rgba(37, 211, 102, 0.6);
                    transform: translateY(-3px);
                }
                .btn-whatsapp:active { transform: scale(0.97); }
                @keyframes wa-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
                    50% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
                }
                .wa-pulse { animation: wa-pulse 2s infinite; }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .shimmer-effect::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    animation: shimmer 2.5s infinite;
                }
                /* Sticky mobile CTA */
                @media (max-width: 1023px) {
                    .sticky-wa-bar {
                        position: fixed;
                        bottom: 0; left: 0; right: 0;
                        z-index: 999;
                        padding: 12px 16px;
                        background: rgba(255,255,255,0.95);
                        backdrop-filter: blur(16px);
                        border-top: 1px solid rgba(0,0,0,0.06);
                        box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
                    }
                    .sticky-wa-bar .wa-btn-mobile {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        width: 100%;
                        padding: 16px 24px;
                        border-radius: 16px;
                        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                        color: white;
                        font-weight: 900;
                        font-size: 15px;
                        text-decoration: none;
                        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
                        transition: all 0.2s;
                    }
                    .content-pb { padding-bottom: 90px; }
                }
                @media (min-width: 1024px) {
                    .sticky-wa-bar { display: none; }
                    .content-pb { padding-bottom: 0; }
                }
            `}</style>

            {/* Sticky WhatsApp Bar (solo mobile) */}
            <div className="sticky-wa-bar">
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="wa-btn-mobile">
                    <WhatsAppIcon size={22} />
                    <span>{buttonText}</span>
                </a>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 content-pb">
                {/* Breadcrumb */}
                <div className="mb-10">
                    <Link
                        href={`/r/${resellerSlug}/${collectionSlug}`}
                        className="inline-flex items-center gap-2 group text-slate-400 hover:text-slate-700 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span>Volver a {(collection as any).name}</span>
                    </Link>
                </div>

                {/* Layout producto */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Galería */}
                    <div className="relative group/gallery">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 relative z-10">
                            <ImageGallery
                                images={productData.images || []}
                                productName={productData.name}
                                mode="slider-manual"
                            />
                        </div>
                        {/* Badge calidad */}
                        <div className="absolute top-6 right-6 z-20">
                            <div
                                className="px-4 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 70%, black))` }}
                            >
                                <span className="text-sm">✦</span> Calidad Garantizada
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-3xl opacity-30 z-0" style={{ background: primaryColor }} />
                    </div>

                    {/* Info producto */}
                    <div className="flex flex-col pt-4">
                        <div className="mb-6">
                            <span
                                className="inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] mb-4"
                                style={{ background: `${primaryColor}18`, color: primaryColor }}
                            >
                                {badgeText}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-2">
                                {productData.name}
                            </h1>
                        </div>

                        {/* ═══ BOTÓN WHATSAPP PRINCIPAL (desktop) ═══ */}
                        <div className="mb-8 hidden lg:block">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp wa-pulse shimmer-effect group relative flex items-center justify-between w-full p-6 rounded-[2rem] text-white transition-all duration-300 overflow-hidden"
                            >
                                <div className="relative z-10 flex flex-col items-start">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">
                                        {buttonSubtext}
                                    </span>
                                    <span className="text-xl font-black tracking-tight">{buttonText}</span>
                                </div>
                                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors">
                                    <WhatsAppIcon size={28} />
                                </div>
                            </a>

                            {/* Trust badges */}
                            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                                {[trustBadge1, trustBadge2, trustBadge3].filter(Boolean).map((badge, i) => (
                                    <span key={i} className="text-[11px] font-bold text-slate-500">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                                                {/* Ficha de Calidad & Tallas de la Colección */}
                        {(collection as any).resellerDetails && ((collection as any).resellerDetails.adultSizes || (collection as any).resellerDetails.material) && (
                            <div className="mb-8 bg-slate-50/90 rounded-3xl p-6 border border-slate-200/60 shadow-xs">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-800 flex items-center gap-2">
                                    <span>✦</span> Especificaciones y Tallas
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(collection as any).resellerDetails.adultSizes && (
                                        <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                                👔 Tallas Adulto
                                            </span>
                                            <span className="text-xs font-bold text-slate-800">
                                                {(collection as any).resellerDetails.adultSizes}
                                            </span>
                                        </div>
                                    )}
                                    {(collection as any).resellerDetails.kidsSizes && (
                                        <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">
                                                👶 Tallas Niños
                                            </span>
                                            <span className="text-xs font-bold text-slate-800">
                                                {(collection as any).resellerDetails.kidsSizes}
                                            </span>
                                        </div>
                                    )}
                                    {(collection as any).resellerDetails.material && (
                                        <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                                🧵 Tela / Calidad
                                            </span>
                                            <span className="text-xs font-bold text-slate-800">
                                                {(collection as any).resellerDetails.material}
                                            </span>
                                        </div>
                                    )}
                                    {(collection as any).resellerDetails.printMethod && (
                                        <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                                🎨 Estampado
                                            </span>
                                            <span className="text-xs font-bold text-slate-800">
                                                {(collection as any).resellerDetails.printMethod}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Descripción */}
                        {productData.description && (
                            <div className="mb-8">
                                <h3
                                    className="text-xs font-black uppercase tracking-[0.2em] mb-3 border-l-4 pl-3"
                                    style={{ borderColor: primaryColor, color: primaryColor }}
                                >
                                    Sobre este diseño
                                </h3>
                                <p className="text-slate-500 font-medium leading-[1.8] whitespace-pre-line text-base italic">
                                    &ldquo;{productData.description}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Especificaciones y colores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(productData.material || productData.dimensions) && (
                                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Detalles Técnicos
                                    </h3>
                                    <dl className="space-y-3">
                                        {productData.material && (
                                            <div className="flex flex-col">
                                                <dt className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Material</dt>
                                                <dd className="font-black text-slate-800">{productData.material}</dd>
                                            </div>
                                        )}
                                        {productData.dimensions && (
                                            <div className="flex flex-col">
                                                <dt className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Dimensiones</dt>
                                                <dd className="font-black text-slate-800">{productData.dimensions}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}

                            {productData.colors && productData.colors.length > 0 && (
                                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Opciones</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {productData.colors.map((color: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-white text-slate-800 font-bold rounded-xl text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm"
                                            >
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Separador */}
                <div className="my-20 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* ═══ SECCIÓN: CÓMO RECIBIR ═══ */}
                <div className="text-center">
                    <span
                        className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4"
                        style={{ background: `${primaryColor}15`, color: primaryColor }}
                    >
                        Proceso de Compra
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-12">
                        ¿Cómo recibir este producto?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { emoji: '📸', num: '01', title: step1Title, desc: step1Desc },
                            { emoji: '💬', num: '02', title: step2Title, desc: step2Desc },
                            { emoji: '🎉', num: '03', title: step3Title, desc: step3Desc },
                        ].map((step) => (
                            <div key={step.num} className="relative group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden">
                                <div className="absolute top-[-15px] right-[-10px] text-slate-100 font-black text-[80px] leading-none pointer-events-none select-none">
                                    {step.num}
                                </div>
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                                    style={{ background: `${primaryColor}15` }}
                                >
                                    {step.emoji}
                                </div>
                                <h4 className="font-black text-slate-900 text-lg mb-2 tracking-tight">{step.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA final de la sección */}
                    <div className="mt-12">
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp inline-flex items-center gap-4 py-5 px-10 rounded-[2rem] text-white font-black text-lg transition-all duration-300 relative overflow-hidden shimmer-effect"
                        >
                            <WhatsAppIcon size={26} />
                            <span>{buttonText}</span>
                        </a>
                        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                            {[trustBadge1, trustBadge2, trustBadge3].filter(Boolean).map((badge, i) => (
                                <span key={i} className="text-[11px] font-bold text-slate-400">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
