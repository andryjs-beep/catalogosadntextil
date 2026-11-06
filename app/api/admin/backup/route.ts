/**
 * API Route: Exportar Backup Completo de la Base de Datos
 * GET /api/admin/backup
 * Solo accesible por Super Admin
 */
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 });
        }

        const collectionsToBackup = [
            'tenants',
            'users',
            'collections',
            'products',
            'tenantcollections',
            'tenantproducts',
            'analytics',
        ];

        const backupData: Record<string, any[]> = {
            _metadata: [{
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
                totalCollections: collectionsToBackup.length,
            }]
        };

        for (const colName of collectionsToBackup) {
            try {
                const docs = await db.collection(colName).find({}).toArray();
                backupData[colName] = docs;
            } catch (colErr) {
                console.error(`Error respaldando colección ${colName}:`, colErr);
                backupData[colName] = [];
            }
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `backup-catalogos-${dateStr}.json`;

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: any) {
        console.error('Error generando backup:', error);
        return NextResponse.json({ error: 'Error al generar respaldo' }, { status: 500 });
    }
}
