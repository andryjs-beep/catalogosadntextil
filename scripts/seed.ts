/**
 * Seed Script - Crear datos iniciales
 * Ejecutar con: npm run seed
 */
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Conexión directa para el script
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo';

async function seed() {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Importar modelos después de conectar
        const { default: User } = await import('../lib/models/User');
        const { default: Product } = await import('../lib/models/Product');
        const { default: Collection } = await import('../lib/models/Collection');
        const { default: Tenant } = await import('../lib/models/Tenant');
        const { default: TenantCollection } = await import('../lib/models/TenantCollection');

        // 1. Crear Super Admin
        console.log('👤 Creando Super Admin...');
        const existingAdmin = await User.findOne({ email: 'admin@catalogo.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123456', 10);
            await User.create({
                email: 'admin@catalogo.com',
                password: hashedPassword,
                name: 'Administrador',
                role: 'super-admin',
                tenantId: null,
            });
            console.log('   ✅ Super Admin creado: admin@catalogo.com / admin123456\n');
        } else {
            console.log('   ℹ️  Super Admin ya existe\n');
        }

        // 2. Crear Productos de ejemplo
        console.log('📦 Creando productos de ejemplo...');
        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0) {
            const products = await Product.insertMany([
                { name: 'Gorra Clásica Negra', images: [], tags: ['gorras', 'negro', 'clásico'] },
                { name: 'Gorra Deportiva Blanca', images: [], tags: ['gorras', 'blanco', 'deporte'] },
                { name: 'Gorra Trucker Azul', images: [], tags: ['gorras', 'azul', 'trucker'] },
                { name: 'Mug Cerámico 11oz', images: [], tags: ['mugs', 'cerámico', 'sublimación'] },
                { name: 'Mug Mágico Cambia Color', images: [], tags: ['mugs', 'mágico', 'novedad'] },
                { name: 'Mug Viajero Acero', images: [], tags: ['mugs', 'acero', 'viajero'] },
                { name: 'Llavero Acrílico Personalizado', images: [], tags: ['llaveros', 'acrílico'] },
                { name: 'Llavero Metal Premium', images: [], tags: ['llaveros', 'metal', 'premium'] },
                { name: 'Llavero PVC 3D', images: [], tags: ['llaveros', 'pvc', '3d'] },
                { name: 'Llavero Madera Grabado', images: [], tags: ['llaveros', 'madera', 'grabado'] },
            ]);
            console.log(`   ✅ ${products.length} productos creados\n`);
        } else {
            console.log(`   ℹ️  Ya existen ${existingProducts} productos\n`);
        }

        // 3. Crear Colecciones
        console.log('📁 Creando colecciones...');
        const existingCollections = await Collection.countDocuments();
        if (existingCollections === 0) {
            const products = await Product.find().lean();

            // Agrupar productos por categoría
            const gorras = products.filter(p => p.tags.includes('gorras'));
            const mugs = products.filter(p => p.tags.includes('mugs'));
            const llaveros = products.filter(p => p.tags.includes('llaveros'));

            await Collection.insertMany([
                {
                    slug: 'gorras',
                    name: 'Gorras Personalizadas',
                    coverImage: '',
                    productIds: gorras.map(p => p._id),
                    order: 0,
                },
                {
                    slug: 'mugs',
                    name: 'Mugs y Tazas',
                    coverImage: '',
                    productIds: mugs.map(p => p._id),
                    order: 1,
                },
                {
                    slug: 'llaveros',
                    name: 'Llaveros Personalizados',
                    coverImage: '',
                    productIds: llaveros.map(p => p._id),
                    order: 2,
                },
            ]);
            console.log('   ✅ 3 colecciones creadas: gorras, mugs, llaveros\n');
        } else {
            console.log(`   ℹ️  Ya existen ${existingCollections} colecciones\n`);
        }

        // 4. Crear Tenant de prueba
        console.log('🏪 Creando tenant de prueba...');
        const existingTenant = await Tenant.findOne({ slug: 'demo' });
        if (!existingTenant) {
            const tenant = await Tenant.create({
                slug: 'demo',
                branding: {
                    logo: '',
                    favicon: '',
                    primaryColor: '#3b82f6',
                    secondaryColor: '#1e40af',
                    accentColor: '#f59e0b',
                    fontFamily: 'Inter',
                },
                socialLinks: {
                    instagram: 'https://instagram.com/demo',
                    facebook: 'https://facebook.com/demo',
                    tiktok: '',
                    whatsappLink: 'https://wa.me/5491234567890',
                },
                globalTexts: {
                    headerText: 'Demo Catálogo',
                    footerText: '¡Gracias por visitarnos! Contáctanos para más información.',
                    ctaButtonText: 'Consultar por WhatsApp',
                },
                isActive: true,
            });

            // Crear usuario cliente
            const clientPassword = await bcrypt.hash('cliente123456', 10);
            await User.create({
                email: 'cliente@demo.com',
                password: clientPassword,
                name: 'Cliente Demo',
                role: 'client-admin',
                tenantId: tenant._id,
            });

            // Asignar todas las colecciones
            const collections = await Collection.find().lean();
            await TenantCollection.insertMany(
                collections.map((col, index) => ({
                    tenantId: tenant._id,
                    collectionId: col._id,
                    persuasiveTextTop: `¡Descubre nuestra colección de ${col.name}!`,
                    persuasiveTextBottom: '¿Te gustó algo? ¡Escríbenos por WhatsApp!',
                    ctaButtonText: 'Cotizar ahora',
                    isPublished: true,
                    order: index,
                }))
            );

            console.log('   ✅ Tenant "demo" creado con usuario: cliente@demo.com / cliente123456\n');
        } else {
            console.log('   ℹ️  Tenant "demo" ya existe\n');
        }

        console.log('✨ Seed completado exitosamente!\n');
        console.log('📋 Resumen:');
        console.log('   - Super Admin: admin@catalogo.com / admin123456');
        console.log('   - Cliente Demo: cliente@demo.com / cliente123456');
        console.log('   - Subdominio demo: demo.tudominio.com\n');

    } catch (error) {
        console.error('❌ Error en seed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

seed();
