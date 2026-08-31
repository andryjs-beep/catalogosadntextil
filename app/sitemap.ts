import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import { Collection, Product } from '@/lib/models';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://adntextil.catalogo.dpdns.org';

    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
    ];

    try {
        await dbConnect();

        // Colecciones públicas
        const collections = await Collection.find({}).lean();
        for (const col of collections as any[]) {
            if (col.slug) {
                routes.push({
                    url: `${baseUrl}/${col.slug}`,
                    lastModified: col.updatedAt ? new Date(col.updatedAt) : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        }

        // Productos públicos
        const products = await Product.find({}).lean();
        for (const prod of products as any[]) {
            const productSlugOrId = prod.slug || prod._id?.toString();
            if (productSlugOrId) {
                routes.push({
                    url: `${baseUrl}/${productSlugOrId}`,
                    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        }
    } catch (error) {
        console.error('Error al generar el sitemap:', error);
    }

    return routes;
}
