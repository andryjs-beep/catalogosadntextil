/**
 * API Route: Upload de imágenes
 * POST /api/upload - Subir imágenes a Cloudinary
 */
import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImages } from '@/lib/cloudinary';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación (cualquier usuario autenticado puede subir)
        const session = await getSession();
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const formData = await request.formData();
        let files = formData.getAll('files') as File[];
        if (!files || files.length === 0) {
            files = formData.getAll('file') as File[];
        }

        // Filter out any non-File values or invalid files
        files = files.filter((f) => f && typeof f === 'object' && f.name);

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No se enviaron archivos' },
                { status: 400 }
            );
        }

        // Validar que sean imágenes
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Tipo de archivo no válido: ${file.type}` },
                    { status: 400 }
                );
            }
            // Limitar tamaño a 10MB
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json(
                    { error: 'El archivo excede el límite de 10MB' },
                    { status: 400 }
                );
            }
        }

        // Convertir archivos a buffers
        const buffers = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return Buffer.from(arrayBuffer);
            })
        );

        // Subir a Cloudinary
        const results = await uploadMultipleImages(buffers);

        return NextResponse.json({
            url: results[0]?.url || '',
            urls: results.map((r) => r.url),
            images: results,
        });
    } catch (error) {
        console.error('Error subiendo imágenes:', error);
        return NextResponse.json(
            { error: 'Error al subir imágenes' },
            { status: 500 }
        );
    }
}
