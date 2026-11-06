/**
 * Script de Respaldo Local de Base de Datos
 * Ejecutar con: npm run backup
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar .env.local desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runBackup() {
    console.log('🚀 Iniciando respaldo local de la base de datos...');
    
    if (!process.env.MONGODB_URI) {
        console.error('❌ Error: MONGODB_URI no está definida en .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas.');

        const db = mongoose.connection.db;
        const collections = [
            'tenants',
            'users',
            'collections',
            'products',
            'tenantcollections',
            'tenantproducts',
            'analytics',
        ];

        const backupData = {
            _metadata: {
                createdAt: new Date().toISOString(),
                database: db.databaseName,
            },
        };

        let totalDocs = 0;
        for (const colName of collections) {
            const docs = await db.collection(colName).find({}).toArray();
            backupData[colName] = docs;
            totalDocs += docs.length;
            console.log(`📦 Respaldada colección: ${colName} (${docs.length} documentos)`);
        }

        const backupDir = path.resolve(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filePath = path.join(backupDir, `backup_${dateStr}.json`);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

        console.log('----------------------------------------------------');
        console.log(`🎉 ¡Respaldo completado con éxito!`);
        console.log(`📄 Archivo guardado en: ${filePath}`);
        console.log(`📊 Total documentos respaldados: ${totalDocs}`);
        console.log('----------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error realizando el respaldo:', error);
        process.exit(1);
    }
}

runBackup();
