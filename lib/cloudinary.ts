/**
 * Configuración y utilidades de Cloudinary
 */
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

/**
 * Sube una imagen a Cloudinary con optimizaciones automáticas
 */
export async function uploadImage(
    file: Buffer,
    folder: string = 'catalogo-productos'
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                        });
                    }
                }
            )
            .end(file);
    });
}

/**
 * Sube múltiples imágenes a Cloudinary
 */
export async function uploadMultipleImages(
    files: Buffer[],
    folder: string = 'catalogo-productos'
): Promise<UploadResult[]> {
    const uploads = files.map((file) => uploadImage(file, folder));
    return Promise.all(uploads);
}

/**
 * Elimina una imagen de Cloudinary por su public_id
 */
export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

/**
 * Genera una URL optimizada de Cloudinary con transformaciones
 */
export function getOptimizedUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    } = {}
): string {
    // Si ya es una URL de Cloudinary, aplicar transformaciones
    if (url.includes('cloudinary.com')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            const transforms: string[] = ['f_auto', 'q_auto'];
            if (options.width) transforms.push(`w_${options.width}`);
            if (options.height) transforms.push(`h_${options.height}`);
            if (options.crop) transforms.push(`c_${options.crop}`);
            return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
        }
    }
    return url;
}

export default cloudinary;
