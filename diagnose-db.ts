import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';

async function diagnose() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI no encontrada en .env.local');
        return;
    }

    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado\n');

        const { default: Tenant } = await import('./lib/models/Tenant');
        const { default: User } = await import('./lib/models/User');
        const { default: TenantCollection } = await import('./lib/models/TenantCollection');
        const { default: Collection } = await import('./lib/models/Collection');
        const { default: Product } = await import('./lib/models/Product');

        const tenantsCount = await Tenant.countDocuments();
        const usersCount = await User.countDocuments();
        const collectionsCount = await Collection.countDocuments();
        const productsCount = await Product.countDocuments();

        console.log('📊 Resumen General:');
        console.log(`- Tenants: ${tenantsCount}`);
        console.log(`- Usuarios: ${usersCount}`);
        console.log(`- Colecciones Master: ${collectionsCount}`);
        console.log(`- Productos Master: ${productsCount}\n`);

        const demoTenant = await Tenant.findOne({ slug: 'demo' });
        if (!demoTenant) {
            console.log('❌ Tenant "demo" NO ENCONTRADO');
        } else {
            console.log('🏪 Tenant "demo" encontrado:');
            console.log(`   ID: ${demoTenant._id}`);

            const demoUser = await User.findOne({ tenantId: demoTenant._id });
            console.log(`   Usuario asociado: ${demoUser ? demoUser.email : 'NINGUNO'}`);

            const tenantCollections = await TenantCollection.find({ tenantId: demoTenant._id });
            console.log(`   Colecciones vinculadas: ${tenantCollections.length}`);

            if (tenantCollections.length === 0) {
                console.log('   ⚠️ ADVERTENCIA: El tenant demo no tiene colecciones vinculadas. Por eso no se ven productos.');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

diagnose();
