/**
 * API Route: Reordenar Colecciones (Super-Admin)
 * POST /api/admin/collections/reorder
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/lib/models';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { collectionId, direction } = await request.json();

        if (!collectionId || !['up', 'down'].includes(direction)) {
            return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
        }

        // Primero: normalizar todos los orders para tenerlos únicos y consecutivos
        const allCollections = await Collection.find().sort({ order: 1, createdAt: 1 });
        for (let i = 0; i < allCollections.length; i++) {
            if (allCollections[i].order !== i) {
                allCollections[i].order = i;
                await allCollections[i].save();
            }
        }

        // Refrescar datos después de normalizar
        const sortedCollections = await Collection.find().sort({ order: 1 });
        const currentIndex = sortedCollections.findIndex(c => c._id.toString() === collectionId);

        if (currentIndex === -1) {
            return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
        }

        let neighborIndex: number;
        if (direction === 'up') {
            neighborIndex = currentIndex - 1;
        } else {
            neighborIndex = currentIndex + 1;
        }

        if (neighborIndex < 0 || neighborIndex >= sortedCollections.length) {
            // Ya está en el límite, no hay nada que mover
            return NextResponse.json({ success: true });
        }

        // Intercambiar orders
        const current = sortedCollections[currentIndex];
        const neighbor = sortedCollections[neighborIndex];

        const tempOrder = current.order;
        current.order = neighbor.order;
        neighbor.order = tempOrder;

        await Promise.all([current.save(), neighbor.save()]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordenando colecciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
