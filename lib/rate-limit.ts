/**
 * Rate Limiter en memoria para Next.js App Router
 * Protege contra fuerza bruta y sobreconsumo de APIs
 */

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Limpieza automática cada 10 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
    limit: number;      // Cantidad máxima de peticiones permitidas
    windowMs: number;   // Ventana de tiempo en milisegundos
}

/**
 * Verifica si una clave (ej: IP o IP:endpoint) excedió el límite
 */
export function checkRateLimit(key: string, options: RateLimitOptions): { success: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + options.windowMs,
        });
        return { success: true, remaining: options.limit - 1 };
    }

    if (record.count >= options.limit) {
        return { success: false, remaining: 0 };
    }

    record.count += 1;
    return { success: true, remaining: options.limit - record.count };
}

/**
 * Extrae la IP del cliente de los headers
 */
export function getClientIP(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}
