/**
 * Home del Tenant - Grid de colecciones publicadas
 */
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection } from '@/lib/models';
import { CollectionCard } from '@/components/CollectionCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import type { Metadata } from 'next';

// Tipos para datos con lean()
interface TenantData {
    _id: { toString(): string };
    globalTexts: {
        headerText: string;
        footerText: string;
        ctaButtonText: string;
        homeTitle?: string;
        homeSubtitle?: string;
    };
    socialLinks: { whatsappLink: string };
    branding?: { primaryColor?: string };
}

interface TenantCollectionPopulated {
    _id: { toString(): string };
    collectionId: {
        _id: string;
        slug: string;
        name: string;
        coverImage: string;
        productIds: string[];
        order: number;
    };
    ctaButtonText: string;
    order: number;
}

async function getTenantData(slug: string) {
    await dbConnect();

    const tenant = (await Tenant.findOne({ slug, isActive: true }).lean()) as unknown as TenantData | null;
    if (!tenant) return null;

    const collections = (await TenantCollection.find({
        tenantId: tenant._id,
        isPublished: true,
    })
        .populate('collectionId', 'slug name coverImage productIds order')
        .lean()) as unknown as TenantCollectionPopulated[];

    // Ordenar en memoria por el orden global de la colección
    const sortedCollections = collections.sort((a, b) =>
        (a.collectionId.order || 0) - (b.collectionId.order || 0)
    );

    return { tenant, collections: sortedCollections };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tenantSlug: string }>;
}): Promise<Metadata> {
    const { tenantSlug } = await params;
    const data = await getTenantData(tenantSlug);

    if (!data) {
        return { title: 'Tienda no encontrada' };
    }

    return {
        title: data.tenant.globalTexts?.headerText || `Catálogo - ${tenantSlug}`,
        description: data.tenant.globalTexts?.footerText || 'Explora nuestro catálogo de productos',
    };
}

export default async function TenantHomePage({
    params,
}: {
    params: Promise<{ tenantSlug: string }>;
}) {
    const { tenantSlug } = await params;
    const data = await getTenantData(tenantSlug);

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Tienda no encontrada</h1>
            </div>
        );
    }

    const { tenant, collections } = data;
    const branding = tenant.branding || {};
    const globalTexts = tenant.globalTexts || {};
    const socialLinks = tenant.socialLinks || {};

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 lg:py-28">
            {/* Hero Section / Welcome */}
            <div className="text-center mb-16 md:mb-24 animate-fade-in-up max-w-4xl mx-auto space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
                    Bienvenido
                </div>
                <h1
                    className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-balance"
                    style={{ color: branding.primaryColor || '#0f172a' }}
                >
                    {globalTexts.homeTitle || 'Explora Nuestras Colecciones'}
                </h1>
                <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed text-balance">
                    {globalTexts.homeSubtitle || 'Diseños exclusivos y calidad garantizada en cada una de nuestras piezas.'}
                </p>

                <div className="flex justify-center pt-4">
                    <div className="h-1 w-20 bg-primary/20 rounded-full" />
                </div>
            </div>

            {/* Grid de colecciones */}
            {collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {collections.map((tc, index) => (
                        <div
                            key={tc._id.toString()}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${(index % 3) * 100}ms` }}
                        >
                            <CollectionCard
                                name={tc.collectionId?.name || 'Colección'}
                                slug={tc.collectionId?.slug || ''}
                                coverImage={tc.collectionId?.coverImage || ''}
                                tenantSlug={tenantSlug}
                                ctaText={tc.ctaButtonText || globalTexts.ctaButtonText || 'Ver catálogo'}
                                productCount={tc.collectionId?.productIds?.length || 0}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay colecciones disponibles en este momento</p>
                </div>
            )}

            {/* WhatsApp flotante */}
            {socialLinks.whatsappLink && (
                <WhatsAppButton
                    href={socialLinks.whatsappLink}
                    text=""
                    tenantId={tenant._id.toString()}
                    variant="floating"
                />
            )}
        </div>
    );
}
