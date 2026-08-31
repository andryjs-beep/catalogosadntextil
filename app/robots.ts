import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://adntextil.catalogo.dpdns.org';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/client-admin/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
