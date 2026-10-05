import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * Llama a los modelos oficiales más estables de Google Gemini v1beta en PARALELO.
 * Usa 'gemini-2.0-flash', 'gemini-1.5-flash-latest' y 'gemini-2.0-flash-lite'.
 * El primer modelo que responda con éxito entrega el resultado inmediatamente (Promise.any).
 */
async function callGeminiApiParallel(apiKey: string, prompt: string, systemPrompt: string): Promise<string> {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-lite'];

    const requests = models.map(async (modelName) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                })
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }
            throw new Error(data?.error?.message || `Modelo ${modelName} sin respuesta válida.`);
        } catch (err: any) {
            clearTimeout(timeoutId);
            throw err;
        }
    });

    try {
        return await Promise.any(requests);
    } catch (err: any) {
        console.warn('Peticiones paralelas fallaron, intentando respaldo con gemini-1.5-pro-latest...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
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
        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error(data?.error?.message || 'Error al comunicar con la IA de Google Gemini.');
    }
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

        const rawContent = await callGeminiApiParallel(apiKey, prompt, systemPrompt);

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
