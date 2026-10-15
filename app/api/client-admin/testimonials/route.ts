/**
 * API Routes para Reseñas y Testimonios (Client-Admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { requireClientAdmin } from '@/lib/auth';

const DEFAULT_TESTIMONIALS = {
    enabled: true,
    displayScope: 'all',
    score: '4.8',
    totalReviewsText: '+189 reseñas verificadas',
    title: 'Clientes felices en toda Venezuela',
    items: [
        {
            name: 'Sandra G.',
            city: 'Maracaibo',
            text: 'Me encanta, la calidad de la tela es insuperable y el estampado no se cae con las lavadas. Pagué al recibir con delivery.',
            rating: 5,
            verified: true
        },
        {
            name: 'Carlos L.',
            city: 'Valencia',
            text: 'Tenía dudas al principio pero llegó súper rápido por MRW. Muy bien empaquetado y la talla exacta. Súper recomendado.',
            rating: 5,
            verified: true
        },
        {
            name: 'Luisa M.',
            city: 'Caracas',
            text: 'Llegó en el tiempo prometido. Los colores están súper vivos y la atención por WhatsApp fue excelente.',
            rating: 4,
            verified: true
        },
        {
            name: 'Tomás R.',
            city: 'Barquisimeto',
            text: 'Compré dos franelas y la confección es de primera. Cero franelas desechables, se nota que dura años.',
            rating: 5,
            verified: true
        },
        {
            name: 'Mariana T.',
            city: 'San Cristóbal',
            text: 'Excelente atención al cliente y el envío por TEALCA fue puntual. Quedé fascinada con el diseño.',
            rating: 5,
            verified: true
        },
        {
            name: 'Andrés Q.',
            city: 'Lechería',
            text: 'Buen acabado y las medidas de la tabla de tallas son exactas. Definitivamente volveré a pedir.',
            rating: 5,
            verified: true
        }
    ]
};

// GET: Obtener configuración de testimonios
export async function GET(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const tenant = await Tenant.findById(session.tenantId).lean() as ITenant | null;

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        const config = tenant.testimonialsConfig || DEFAULT_TESTIMONIALS;

        return NextResponse.json({ testimonialsConfig: config });
    } catch (error: any) {
        if (error.message?.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// PUT: Guardar configuración de testimonios
export async function PUT(request: NextRequest) {
    try {
        const session = await requireClientAdmin();
        if (!session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const tenant = await Tenant.findByIdAndUpdate(
            session.tenantId,
            { testimonialsConfig: body },
            { new: true }
        ).lean() as ITenant | null;

        return NextResponse.json({ testimonialsConfig: tenant?.testimonialsConfig });
    } catch (error: any) {
        if (error.message?.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Error al guardar testimonios' }, { status: 500 });
    }
}
