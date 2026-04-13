import { headers } from 'next/headers';

/**
 * Construye una URL absoluta para una imagen basándose en el host de la petición actual.
 * @param path Ruta relativa o absoluta de la imagen (/uploads/...)
 * @returns URL absoluta completa (https://domain.com/path)
 */
export async function getAbsoluteImageUrl(path: string | undefined): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    try {
        const headersList = await headers();
        const host = headersList.get('host') || 'adntextil.catalogo.dpdns.org';
        const protocol = host.includes('localhost') ? 'http' : 'https';

        // Asegurar que el path empiece con /
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        return `${protocol}://${host}${cleanPath}`;
    } catch (error) {
        // Fallback si falla el acceso a headers (fuera de request context)
        return path;
    }
}
