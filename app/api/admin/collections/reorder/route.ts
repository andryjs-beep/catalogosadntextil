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

        const currentCollection = await Collection.findById(collectionId);
        if (!currentCollection) {
            return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
        }

        const currentOrder = currentCollection.order || 0;

        // Buscar la colección vecina
        let neighbor;
        if (direction === 'up') {
            neighbor = await Collection.findOne({ order: { $lt: currentOrder } }).sort({ order: -1 });
        } else {
            neighbor = await Collection.findOne({ order: { $gt: currentOrder } }).sort({ order: 1 });
        }

        if (neighbor) {
            // Intercambiar órdenes
            const tempOrder = neighbor.order;
            neighbor.order = currentOrder;
            currentCollection.order = tempOrder;

            await Promise.all([neighbor.save(), currentCollection.save()]);
        } else {
            // Si no hay vecino, tal vez necesitemos reinicializar órdenes si todos son 0
            const allCollections = await Collection.find().sort({ order: 1, createdAt: 1 });

            // Si la mayoría tiene orden 0 o hay duplicados, normalizamos
            let hasDuplicates = false;
            const seenOrders = new Set();
            for (const col of allCollections) {
                if (seenOrders.has(col.order)) {
                    hasDuplicates = true;
                    break;
                }
                seenOrders.add(col.order);
            }

            if (hasDuplicates || allCollections.every(c => c.order === 0)) {
                // Normalizar órdenes
                for (let i = 0; i < allCollections.length; i++) {
                    allCollections[i].order = i;
                    await allCollections[i].save();
                }
                // Reintentar encontrar vecino después de normalizar (opcional, pero mejor informamos para que refresque)
                return NextResponse.json({ success: true, normalized: true });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordenando colecciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
