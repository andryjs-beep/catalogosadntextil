import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Modelo oficial y único activo en Google AI Studio para tu API Key
const MODEL = 'gemini-3.8-flash';

async function callGemini(apiKey: string, prompt: string, systemPrompt: string, isJson: boolean = false): Promise<string> {
    const combinedPrompt = systemPrompt 
        ? `INSTRUCCIONES DEL SISTEMA:\n${systemPrompt}\n\nSOLICITUD:\n${prompt}` 
        : prompt;

    const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`;

    // Intentar hasta 3 veces si hay saturación temporal (high demand)
    const MAX_RETRIES = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

            const genConfig: any = {
                temperature: 0.7,
                maxOutputTokens: 2048
            };
            if (isJson) {
                genConfig.responseMimeType = 'application/json';
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
                    generationConfig: genConfig
                })
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }

            lastError = data?.error?.message || `Error HTTP ${response.status} en Google Gemini`;

            // Si es saturación (429, 503 o high demand), esperamos un segundo y reintentamos
            const isHighDemand = response.status === 429 || 
                                 response.status === 503 || 
                                 lastError.toLowerCase().includes('high demand') ||
                                 lastError.toLowerCase().includes('overloaded');

            if (isHighDemand && attempt < MAX_RETRIES) {
                console.warn(`[Gemini] Saturado. Reintento ${attempt}/${MAX_RETRIES} en 1.5s...`);
                await new Promise((r) => setTimeout(r, 1500 * attempt));
                continue;
            }

            // Error fatal (no reintentable)
            throw new Error(lastError);

        } catch (err: any) {
            lastError = err?.name === 'AbortError' 
                ? 'Tiempo de espera agotado al conectar con Google Gemini.' 
                : (err?.message || 'Error de conexión con Google Gemini.');

            if (attempt === MAX_RETRIES) break;
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    throw new Error(lastError || 'Google Gemini está saturado en este momento. Por favor presiona el botón nuevamente.');
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'Falta la variable GEMINI_API_KEY en Vercel.'
            }, { status: 500 });
        }

        const session = await getSession();
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { type, productInfo = {}, tenantInfo = {}, section, productContext = '' } = body;

        const bNiche = tenantInfo?.niche || 'Ventas';
        const bTone = tenantInfo?.tone || 'profesional';
        const pName = productInfo?.name || 'Colección';
        const pContext = productContext || productInfo?.description || '';

        const MASTER_PROMPT_RULES = `
📝 REGLAS DE ORO:
1. Tono: Energético, directo y que resalte la calidad (Cero "franelas desechables").
2. Beneficios: Durabilidad, fidelidad de colores, el producto no se daña con el uso.
3. Precio: Deja [INSERTAR PRECIO AQUÍ] como marcador.
4. Tallas: Solo si el producto es ropa (franelas, hoodies). Omítelo si es un objeto.
5. Cierre SIEMPRE con:
🛡️ GARANTÍA Y ENVÍOS
🤝 Pago contraentrega: En Maracaibo y San Francisco (DELIVERY 🛵).
🚚 Envíos Nacionales: Pago de contado vía MRW o TEALCA.
`;

        const systemPrompt = `Eres un copywriter experto en ventas por WhatsApp e Instagram para productos de personalización. Crea textos persuasivos de alta conversión. Sigue estas reglas:\n${MASTER_PROMPT_RULES}`;

        let prompt = '';

        if ((type === 'collection' || type === 'product') && section === 'hero') {
            prompt = `Genera contenido AIDA para el HERO de una landing de ventas.

PRODUCTO: ${pName}
CARACTERÍSTICAS: ${pContext}
NICHO: ${bNiche}
${MASTER_PROMPT_RULES}

1. Headline: Impactante con EMOJIS persuasivos.
2. Subheadline: Persuasivo con EMOJIS y HTML (<b> negritas, <br/> saltos).
3. CTA: Directo a la acción.

Responde SOLO con JSON válido:
{"headline":"...","subheadline":"...","ctaText":"..."}`;

        } else if (section === 'finalCTA') {
            prompt = `Genera un cierre de venta IMPACTANTE para: ${pName}.
${MASTER_PROMPT_RULES}

1. Headline: Gancho final con EMOJIS. 
2. Description: Breve y potente, refuerza garantía y envío con EMOJIS.
3. ctaText: "Adquiere ya tu ${pName}" o similar.

Responde SOLO con JSON válido:
{"headline":"...","description":"...","ctaText":"..."}`;

        } else if (section === 'benefits') {
            prompt = `Genera 4 beneficios clave para: ${pName}.
${MASTER_PROMPT_RULES}
Usa iconos Lucide: shield, truck, star, zap, award, check-circle, heart, sparkles.

Responde SOLO con JSON válido:
[{"icon":"shield","title":"...","description":"..."}]`;

        } else if (section === 'faq') {
            prompt = `Genera 6 FAQs para: ${pName}.
${MASTER_PROMPT_RULES}
Incluye preguntas sobre garantía y envíos nacionales.

Responde SOLO con JSON válido:
[{"question":"...","answer":"..."}]`;

        } else if (type === 'product' && section === 'longDescription') {
            prompt = `Descripción de ventas persuasiva 200-250 palabras para:
PRODUCTO: ${pName} | NICHO: ${bNiche} | TONO: ${bTone}

Usa fórmula AIDA. Responde solo con texto plano.`;
        }

        if (!prompt) {
            return NextResponse.json({ error: 'Tipo de generación no válido.' }, { status: 400 });
        }

        const isJsonResponse = section !== 'longDescription';
        const rawContent = await callGemini(apiKey, prompt, systemPrompt, isJsonResponse);

        let result: any = rawContent;

        if (isJsonResponse) {
            try {
                let jsonStr = rawContent.trim();

                // 1. Quitar cercas Markdown tipo ```json ... ```
                jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

                // 2. Extraer el segmento exacto que empieza con [ o { y termina con ] o }
                const startBracket = jsonStr.indexOf('[');
                const startBrace = jsonStr.indexOf('{');
                let s = -1;
                if (startBracket >= 0 && startBrace >= 0) s = Math.min(startBracket, startBrace);
                else if (startBracket >= 0) s = startBracket;
                else if (startBrace >= 0) s = startBrace;

                const e = Math.max(jsonStr.lastIndexOf(']'), jsonStr.lastIndexOf('}'));
                if (s !== -1 && e > s) {
                    jsonStr = jsonStr.substring(s, e + 1);
                }

                // 3. Intento de parseo estándar
                try {
                    result = JSON.parse(jsonStr);
                } catch {
                    // Si falla por caracteres de control dentro de strings, usar un parser tolerante
                    try {
                        result = Function('"use strict"; return (' + jsonStr + ')')();
                    } catch {
                        // Último recurso: normalizar saltos de línea y reintentar
                        const sanitized = jsonStr.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                        result = JSON.parse(sanitized);
                    }
                }
            } catch (parseErr) {
                console.error('[Gemini JSON Parse Error]:', parseErr, '\nRaw content was:', rawContent);
                return NextResponse.json({ success: false, error: 'La IA devolvió un formato no válido. Presiona de nuevo el botón.' }, { status: 422 });
            }
        }

        return NextResponse.json({ success: true, content: result });

    } catch (error: any) {
        console.error('Error Gemini Route:', error);
        return NextResponse.json({ error: error.message || 'Error al generar con Google Gemini.' }, { status: 500 });
    }
}
