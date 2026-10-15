import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.8-flash';

// Proveedor OpenRouter: Modelos gratuitos de alto rendimiento sin límite de 20 peticiones
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_FREE_MODELS = [
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemini-flash-1.5-8b'
];

async function callOpenRouter(apiKey: string, prompt: string, systemPrompt: string, isJson: boolean = false): Promise<string> {
    let lastError = '';

    for (const model of OPENROUTER_FREE_MODELS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            const messages: any[] = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const bodyPayload: any = {
                model,
                messages,
                temperature: 0.7
            };

            if (isJson) {
                bodyPayload.response_format = { type: 'json_object' };
            }

            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://catalogosadntextil.com',
                    'X-Title': 'Catalogo Multi-Tenant AI'
                },
                signal: controller.signal,
                body: JSON.stringify(bodyPayload)
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok && data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }

            lastError = data?.error?.message || `Error HTTP ${response.status} en OpenRouter (${model})`;
            console.warn(`[OpenRouter] Falló ${model}:`, lastError);
            continue;
        } catch (err: any) {
            lastError = err?.message || 'Error de red en OpenRouter';
            console.warn(`[OpenRouter] Excepción en ${model}:`, lastError);
        }
    }

    throw new Error(lastError || 'No se pudo generar respuesta con OpenRouter.');
}

async function callGemini(apiKey: string, prompt: string, systemPrompt: string, isJson: boolean = false): Promise<string> {
    const combinedPrompt = systemPrompt 
        ? `INSTRUCCIONES DEL SISTEMA:\n${systemPrompt}\n\nSOLICITUD:\n${prompt}` 
        : prompt;

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const MAX_RETRIES = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

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

            const isHighDemand = response.status === 429 || 
                                 response.status === 503 || 
                                 lastError.toLowerCase().includes('high demand') ||
                                 lastError.toLowerCase().includes('overloaded');

            if (isHighDemand && attempt < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, 1500 * attempt));
                continue;
            }

            throw new Error(lastError);

        } catch (err: any) {
            lastError = err?.name === 'AbortError' 
                ? 'Tiempo de espera agotado al conectar con Google Gemini.' 
                : (err?.message || 'Error de conexión con Google Gemini.');

            if (attempt === MAX_RETRIES) break;
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    throw new Error(lastError || 'Google Gemini saturado.');
}

export async function POST(req: NextRequest) {
    try {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

        if (!openRouterKey && !geminiKey) {
            return NextResponse.json({
                error: 'Falta configurar OPENROUTER_API_KEY o GEMINI_API_KEY en las variables de entorno de Vercel.'
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
        let rawContent = '';

        if (openRouterKey) {
            try {
                rawContent = await callOpenRouter(openRouterKey, prompt, systemPrompt, isJsonResponse);
            } catch (openRouterErr) {
                console.warn('[OpenRouter Falló] Intentando fallback con Gemini si existe key:', openRouterErr);
                if (geminiKey) {
                    rawContent = await callGemini(geminiKey, prompt, systemPrompt, isJsonResponse);
                } else {
                    throw openRouterErr;
                }
            }
        } else if (geminiKey) {
            rawContent = await callGemini(geminiKey, prompt, systemPrompt, isJsonResponse);
        }

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
