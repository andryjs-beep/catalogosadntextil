import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

async function callGemini(apiKey: string, prompt: string, systemPrompt: string): Promise<string> {
    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

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
        throw new Error(data?.error?.message || `Error HTTP ${response.status} de Google Gemini`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Google Gemini no devolvió texto.');

    return text;
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

        const rawContent = await callGemini(apiKey, prompt, systemPrompt);

        let result: any = rawContent;

        if (section !== 'longDescription') {
            try {
                let jsonStr = rawContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                const s = Math.min(
                    jsonStr.indexOf('{') >= 0 ? jsonStr.indexOf('{') : Infinity,
                    jsonStr.indexOf('[') >= 0 ? jsonStr.indexOf('[') : Infinity
                );
                const e = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));
                if (s !== Infinity && e > s) jsonStr = jsonStr.substring(s, e + 1);
                result = JSON.parse(jsonStr);
            } catch {
                return NextResponse.json({ success: false, error: 'La IA devolvió un formato no válido.' }, { status: 422 });
            }
        }

        return NextResponse.json({ success: true, content: result });

    } catch (error: any) {
        console.error('Error Gemini Route:', error);
        return NextResponse.json({ error: error.message || 'Error al generar con Google Gemini.' }, { status: 500 });
    }
}
