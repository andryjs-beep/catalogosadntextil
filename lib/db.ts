/**
 * Conexión singleton a MongoDB
 * Mantiene una sola conexión activa en entornos serverless
 */
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Tipo para la cache de conexión
interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Extensión del tipo global para cache de conexión
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

// Cache global para reutilizar conexión entre invocaciones
let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

/**
 * Conecta a MongoDB Atlas y devuelve la conexión
 * Reutiliza conexiones existentes para optimizar serverless
 */
async function dbConnect(): Promise<Mongoose> {
    if (!MONGODB_URI) {
        throw new Error(
            'Por favor define la variable de entorno MONGODB_URI en .env.local'
        );
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
