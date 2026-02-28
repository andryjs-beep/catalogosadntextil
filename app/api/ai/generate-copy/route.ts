import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY no configurada');
            return NextResponse.json({ error: 'Configuración de IA incompleta en el servidor' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const session = await getSession();
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY no configurada');
            return NextResponse.json({ error: 'Configuración de IA incompleta en el servidor' }, { status: 500 });
        }

        const body = await req.json();
        const { type, productInfo = {}, tenantInfo = {}, section, productContext = '' } = body;

        let prompt = "";

        // Extraer con valores por defecto para evitar fallos de lectura
        const bName = tenantInfo?.businessName || "Negocio";
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

        // PROMPT PARA HERO DE COLECCIÓN O PRODUCTO (Método AIDA)
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
        }

        // PROMPT PARA FINAL CTA
        else if (section === "finalCTA") {
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
        }

        // PROMPT PARA BENEFITS
        else if (section === "benefits") {
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
        }

        // PROMPT PARA FAQ
        else if (section === "faq") {
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
        }

        // PROMPT PARA DESCRIPCIÓN LARGA
        else if (type === "product" && section === "longDescription") {
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

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un copywriter experto en ventas por WhatsApp e Instagram para productos de personalización (estampado y sublimación). Tu objetivo es crear textos persuasivos de alta conversión. 
                    
Sigue estrictamente estas pautas:
${MASTER_PROMPT_RULES}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const generatedContent = completion.choices[0].message.content || "";

        // Intentar parsear si es JSON
        let result = generatedContent;
        if (section !== "longDescription") {
            try {
                // Limpiar posible formato markdown de bloque de código
                const cleanContent = generatedContent.replace(/```json\n?|```/g, '').trim();
                result = JSON.parse(cleanContent);
            } catch (e) {
                console.error('Error parseando JSON de OpenAI:', e);
            }
        }

        return NextResponse.json({
            success: true,
            content: result
        });

    } catch (error: any) {
        console.error('Error OpenAI Route:', error);
        return NextResponse.json({
            error: 'Error al generar contenido',
            details: error.message
        }, { status: 500 });
    }
}
