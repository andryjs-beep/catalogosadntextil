import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * Consulta en tiempo real la lista de modelos habilitados para generateContent en la API Key dada.
 */
async function getAvailableGeminiModel(apiKey: string): Promise<string> {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) return 'gemini-2.5-flash';

        const data = await res.json();
        const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data?.models || [];

        const validModel = models.find(m =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            (m.name.includes('flash') || m.name.includes('gemini'))
        ) || models.find(m => m.supportedGenerationMethods?.includes('generateContent'));

        if (validModel) {
            return validModel.name.replace(/^models\//, '');
        }
    } catch (e) {
        console.warn('Error consultando ListModels de Gemini:', e);
    }

    return 'gemini-2.5-flash';
}

/**
 * Llama a la API REST de Google Gemini intentando candidatos estáticos y fallback a ListModels dinámico.
 */
async function callGeminiApi(apiKey: string, prompt: string, systemPrompt: string, preferredModel?: string) {
    const candidateModels = [
        preferredModel,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.5-pro'
    ].filter((m, i, self): m is string => Boolean(m) && self.indexOf(m) === i);

    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
        try {
            const cleanModel = modelName.replace(/^models\//, '');
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error?.message || `Error HTTP ${response.status} de Gemini API`;
                if (response.status === 404 || errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('is not found')) {
                    console.warn(`Modelo ${cleanModel} no disponible (${errorMsg}). Probando siguiente modelo...`);
                    lastError = new Error(errorMsg);
                    continue;
                }
                throw new Error(errorMsg);
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('La API de Gemini no devolvió contenido.');

            return text;
        } catch (err: any) {
            const msg = err.message?.toLowerCase() || '';
            if (msg.includes('not found') || msg.includes('404')) {
                lastError = err;
                continue;
            }
            throw err;
        }
    }

    // Fallback dinámico a ListModels
    console.warn('Candidatos estáticos no disponibles. Consultando ListModels de Gemini en tiempo real...');
    const dynamicModel = await getAvailableGeminiModel(apiKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${dynamicModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || lastError?.message || `Error HTTP ${response.status} de Gemini API`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('La API de Gemini no devolvió contenido.');

    return text;
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        if (!apiKey) {
            console.error('Clave GEMINI_API_KEY no configurada en el servidor.');
            return NextResponse.json({
                error: 'Configuración de IA incompleta: Registra la variable GEMINI_API_KEY en Vercel.'
            }, { status: 500 });
        }

        const session = await getSession();
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { type, productInfo = {}, tenantInfo = {}, section, productContext = '' } = body;

        let prompt = "";

        const bNiche = tenantInfo?.niche || "Ventas";
        const bTone = tenantInfo?.tone || "profesional";
        const pName = productInfo?.name || "Colección";
        const pContext = productContext || productInfo?.description || '';

        const MASTER_PROMPT_RULES = `
📝 REGLAS DE ORO (Prompt Maestro):
1. Tono: Energético, directo y que resalte la calidad (Cero "franelas desechables").
2. Beneficios: Enfócate en la durabilidad, la fidelidad de los colores y que el producto no se daña con el uso.
3. Estructura del Precio: Deja el espacio en blanco con un marcador tipo [INSERTAR PRECIO AQUÍ] para que yo lo rellene manualmente.
4. Tallas: Incluye la sección de tallas ÚNICAMENTE si el producto es ropa (franelas, hoodies, etc.). Si es un objeto (tazas, coolers, llaveros), omítelo.
5. Cierre Obligatorio (Garantía y Envíos): Siempre termina el copy con la siguiente información:
🛡️ GARANTÍA Y ENVÍOS
🤝 Pago contraentrega: En Maracaibo y San Francisco (Contamos con DELIVERY 🛵).
🚚 Envíos Nacionales: Pago de contado para otras ciudades vía MRW o TEALCA.
`;

        const systemPrompt = `Eres un copywriter experto en ventas por WhatsApp e Instagram para productos de personalización (estampado y sublimación). Tu objetivo es crear textos persuasivos de alta conversión.

Sigue estrictamente estas pautas:
${MASTER_PROMPT_RULES}`;

        if ((type === "collection" || type === "product") && section === "hero") {
            prompt = `Actúa como un Copywriter experto en ventas por WhatsApp e Instagram. Genera contenido AIDA para el HERO de una landing.
            
PRODUCTO A PUBLICAR: ${pName}
CARACTERÍSTICAS: ${pContext}
NICHO: ${bNiche}

${MASTER_PROMPT_RULES}

INSTRUCCIONES ESPECÍFICAS:
1. Headline: Capturar ATENCIÓN (impactante). USA EMOJIS PERSUASIVOS.
2. Subheadline: Generar INTERÉS y DESEO. Texto altamente persuasivo. USA EMOJIS. USA HTML (<b> para negritas, <br/> para saltos).
3. CTA: Impulsar ACCIÓN.

Responde SOLO con JSON válido:
{
  "headline": "...",
  "subheadline": "...",
  "ctaText": "..."
}`;
        } else if (section === "finalCTA") {
            prompt = `Genera un cierre de venta (Final CTA) IMPACTANTE para: ${pName}.
            
${MASTER_PROMPT_RULES}

INSTRUCCIONES ESPECÍFICAS:
1. Headline: Un gancho final (Ej: ¿Listo para el cambio? 🚀). USA EMOJIS.
2. Description: Texto corto y potente que refuerce la garantía y el envío. USA EMOJIS.
3. CTA Text: Debe ser "Adquiere ya tu [NOMBRE DEL PRODUCTO/COLECCIÓN]" o algo similarmente directo y vendedor.

Responde SOLO con JSON válido:
{
  "headline": "...",
  "description": "...",
  "ctaText": "..."
}`;
        } else if (section === "benefits") {
            prompt = `Genera 4 beneficios clave para: ${pName}.
${MASTER_PROMPT_RULES}

Formato JSON:
[
  {
    "icon": "shield", 
    "title": "...",
    "description": "..."
  }
]
Nota: Usa iconos de Lucide (shield, truck, star, zap, award, check-circle, heart, sparkles). Enfócate en la durabilidad y resistencia del producto.`;
        } else if (section === "faq") {
            prompt = `Genera 6 FAQs para: ${pName}.
${MASTER_PROMPT_RULES}

OBLIGATORIO: Incluye preguntas sobre garantía por defectos de fábrica y envíos nacionales mencionados en las REGLAS DE ORO.

Formato JSON:
[
  {
    "question": "...",
    "answer": "..."
  }
]`;
        } else if (type === "product" && section === "longDescription") {
            prompt = `Escribe una descripción de ventas persuasiva de 200-250 palabras para:

PRODUCTO A PUBLICAR: ${pName}
NICHO: ${bNiche}
TONO: ${bTone}

Usa fórmula AIDA:
1. ATENCIÓN: Gancho inicial
2. INTERÉS: Problema/Deseo que resuelve
3. DESEO: Beneficios emocionales
4. ACCIÓN: Invitación a contactar

Responde solo con el texto plano.`;
        }

        if (!prompt) {
            return NextResponse.json({ error: 'Tipo de generación no válido' }, { status: 400 });
        }

        const preferredModel = process.env.AI_MODEL;
        const rawContent = await callGeminiApi(apiKey, prompt, systemPrompt, preferredModel);

        let result: any = rawContent;
        if (section !== "longDescription") {
            try {
                let jsonStr = rawContent.trim();

                if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
                }

                const firstBrace = jsonStr.indexOf('{');
                const firstBracket = jsonStr.indexOf('[');
                let startIndex = -1;
                let endIndex = -1;

                if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                    startIndex = firstBrace;
                    endIndex = jsonStr.lastIndexOf('}');
                } else if (firstBracket !== -1) {
                    startIndex = firstBracket;
                    endIndex = jsonStr.lastIndexOf(']');
                }

                if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                    jsonStr = jsonStr.substring(startIndex, endIndex + 1);
                }

                result = JSON.parse(jsonStr);
            } catch (e) {
                console.error('Error parseando JSON de Gemini:', e, 'Raw:', rawContent);
                return NextResponse.json({
                    success: false,
                    error: 'La IA devolvió un formato de respuesta no válido.'
                }, { status: 422 });
            }
        }

        return NextResponse.json({
            success: true,
            content: result
        });

    } catch (error: any) {
        console.error('Error Gemini Route:', error);
        return NextResponse.json({
            error: error.message || 'Error al generar contenido con Google Gemini'
        }, { status: 500 });
    }
}
