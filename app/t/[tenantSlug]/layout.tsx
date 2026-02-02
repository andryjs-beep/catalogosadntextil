/**
 * Layout dinámico para tenant
 * Inyecta CSS variables según branding del cliente
 */
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { TopBar } from '@/components/TopBar';
import './tenant.css';

interface CollectionData {
    _id: { toString(): string };
    name: string;
    slug: string;
    coverImage?: string;
}

async function getTenantWithCollections(slug: string) {
    await dbConnect();
    const tenant = await Tenant.findOne({ slug, isActive: true }).lean() as ITenant | null;
    if (!tenant) return null;

    // Obtener colecciones publicadas del tenant
    const tenantCollections = await TenantCollection.find({
        tenantId: tenant._id,
        isPublished: true,
    })
        .populate('collectionId', 'name slug coverImage')
        .sort({ order: 1 })
        .lean();

    const collections = tenantCollections
        .filter((tc: any) => tc.collectionId)
        .map((tc: any) => ({
            _id: tc.collectionId._id.toString(),
            name: tc.collectionId.name,
            slug: tc.collectionId.slug,
            coverImage: tc.collectionId.coverImage,
        }));

    return { tenant, collections };
}

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}) {
    const { tenantSlug } = await params;
    const data = await getTenantWithCollections(tenantSlug);

    if (!data) {
        notFound();
    }

    const { tenant, collections } = data;
    const { branding, socialLinks, globalTexts } = tenant;

    return (
        <html lang="es">
            <head>
                <title>{globalTexts.headerText || tenant.slug.toUpperCase()}</title>
                <meta name="description" content={`Catálogo de productos de ${tenant.slug}`} />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              :root {
                --primary: ${branding.primaryColor};
                --secondary: ${branding.secondaryColor};
                --accent: ${branding.accentColor};
              }
            `,
                    }}
                />
                {branding.favicon && <link rel="icon" href={branding.favicon} />}
                <link
                    href={`https://fonts.googleapis.com/css2?family=${branding.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`}
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: `'${branding.fontFamily}', sans-serif` }}>
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
                    {/* Barra de contacto superior */}
                    <TopBar socialLinks={socialLinks} branding={branding} />

                    <Header
                        logo={branding.logo}
                        headerText={globalTexts.headerText}
                        socialLinks={socialLinks}
                        tenantSlug={tenantSlug}
                        collections={collections}
                        primaryColor={branding.primaryColor}
                        branding={branding}
                    />
                    <main className="flex-1">{children}</main>
                    <WhatsAppButton
                        href={socialLinks.whatsappLink || ''}
                        text="Contactar"
                        tenantId={tenant._id.toString()}
                        variant="floating"
                    />
                    <Footer
                        footerText={globalTexts.footerText}
                        socialLinks={socialLinks}
                    />
                </div>
            </body>
        </html>
    );
}

