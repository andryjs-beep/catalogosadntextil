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
import { TickerBanner } from '@/components/TickerBanner';
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
        .populate('collectionId', 'name slug coverImage order')
        .lean();

    const collections = tenantCollections
        .filter((tc: any) => tc.collectionId)
        .map((tc: any) => ({
            _id: tc.collectionId._id.toString(),
            name: tc.collectionId.name,
            slug: tc.collectionId.slug,
            coverImage: tc.collectionId.coverImage,
            order: tc.collectionId.order || 0,
        }))
        .sort((a: any, b: any) => a.order - b.order);

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
    const branding = tenant.branding || {};
    const socialLinks = tenant.socialLinks || {};
    const globalTexts = tenant.globalTexts || {};

    return (
        <html lang="es">
            <head>
                <title>{globalTexts.headerText || tenant.slug?.toUpperCase() || 'Catálogo'}</title>
                <meta name="description" content={`Catálogo de productos de ${tenant.slug}`} />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              :root {
                --color-header-bg: ${branding.topBarBgColor || branding.primaryColor || '#000000'};
                --color-header-text: ${branding.topBarTextColor || '#ffffff'};
                --color-primary: ${branding.primaryColor || '#1f1f91'};
                --color-secondary: ${branding.secondaryColor || '#ffd400'};
                --color-accent: ${branding.accentColor || '#25d366'};
                --color-ticker-bg: ${branding.tickerBgColor || branding.primaryColor || '#1f1f91'};
                --color-ticker-text: ${branding.tickerTextColor || '#ffffff'};
                --color-body-bg: #f9f9f9;
                --color-card-bg: #ffffff;
                --color-review-text: #666666;
                --color-star-on: #ffd400;
                --color-star-off: #dddddd;
                --color-search-bg: #ffffff;
                --color-search-border: #eeeeee;
                
                /* Keep legacy for safety */
                --primary: ${branding.primaryColor || '#1f1f91'};
                --secondary: ${branding.secondaryColor || '#ffd400'};
                --accent: ${branding.accentColor || '#25d366'};
              }
            `,
                    }}
                />
                {branding.favicon && <link rel="icon" href={branding.favicon} />}
                <link
                    href={`https://fonts.googleapis.com/css2?family=${(branding.fontFamily || 'Inter').replace(' ', '+')}:wght@400;500;600;700&display=swap`}
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: `'${branding.fontFamily || 'Inter'}', sans-serif` }}>
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
                    {branding.tickerEnabled && (
                        <TickerBanner
                            text={branding.tickerText || ''}
                            speed={(branding.tickerSpeed as any) || 'normal'}
                            direction={(branding.tickerDirection as any) || 'left'}
                        />
                    )}
                    <Header
                        logo={branding.logo || ''}
                        headerText={globalTexts.headerText || ''}
                        tenantSlug={tenantSlug}
                        collections={collections}
                    />
                    <main className="flex-1">{children}</main>
                    <WhatsAppButton
                        href={socialLinks.whatsappLink || ''}
                        text="Contactar"
                        tenantId={tenant._id?.toString() || ''}
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

