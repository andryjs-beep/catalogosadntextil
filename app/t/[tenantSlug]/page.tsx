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
    globalTexts: { headerText: string; footerText: string; ctaButtonText: string };
    socialLinks: { whatsappLink: string };
}

interface TenantCollectionPopulated {
    _id: { toString(): string };
    collectionId: {
        _id: string;
        slug: string;
        name: string;
        coverImage: string;
        productIds: string[];
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
        .populate('collectionId', 'slug name coverImage productIds')
        .sort({ order: 1 })
        .lean()) as unknown as TenantCollectionPopulated[];

    return { tenant, collections };
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
        title: data.tenant.globalTexts.headerText || `Catálogo - ${tenantSlug}`,
        description: data.tenant.globalTexts.footerText || 'Explora nuestro catálogo de productos',
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

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tenant-gradient-text">
                    {tenant.globalTexts.headerText || 'Bienvenido a nuestro catálogo'}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Explora nuestras colecciones y encuentra lo que necesitas
                </p>
            </div>

            {/* Grid de colecciones */}
            {collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((tc, index) => (
                        <div
                            key={tc._id.toString()}
                            className={`animate-fade-in-up animation-delay-${(index % 3) * 100 + 100}`}
                        >
                            <CollectionCard
                                name={tc.collectionId.name}
                                slug={tc.collectionId.slug}
                                coverImage={tc.collectionId.coverImage}
                                tenantSlug={tenantSlug}
                                ctaText={tc.ctaButtonText || tenant.globalTexts.ctaButtonText}
                                productCount={tc.collectionId.productIds?.length || 0}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-slate-500">
                    <p>No hay colecciones disponibles</p>
                </div>
            )}

            {/* WhatsApp flotante */}
            {tenant.socialLinks.whatsappLink && (
                <WhatsAppButton
                    href={tenant.socialLinks.whatsappLink}
                    text=""
                    tenantId={tenant._id.toString()}
                    variant="floating"
                />
            )}
        </div>
    );
}
