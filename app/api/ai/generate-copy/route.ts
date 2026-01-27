import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
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

        // PROMPT PARA HERO DE COLECCIÓN (Método AIDA)
        if (type === "collection" && section === "hero") {
            prompt = `Eres un copywriter experto. Genera contenido AIDA (Atención, Interés, Deseo, Acción) para el HERO de una landing.

CONTEXTO:
- Negocio: ${bName}
- Nicho: ${bNiche}
- Tono: ${bTone}
- Producto/Colección: ${pName}
${pContext ? `- DATOS ADICIONALES:\n${pContext}\n` : ''}
INSTRUCCIONES:
1. Headline: Capturar ATENCIÓN (6-10 palabras max, impactante)
2. Subheadline: Generar INTERÉS y DESEO (15-25 palabras, beneficio emocional)
3. CTA: Impulsar ACCIÓN (3-5 palabras)

Responde SOLO con JSON válido:
{
  "headline": "...",
  "subheadline": "...",
  "ctaText": "..."
}`;
        }

        // PROMPT PARA BENEFITS
        else if (section === "benefits") {
            prompt = `Genera 4 beneficios clave en JSON para el producto/colección: ${pName}

Nicho/Audiencia: ${bNiche}
Características clave: ${productInfo.description || 'Calidad premium'}

Formato:
[
  {
    "icon": "shield", 
    "title": "Título 3-4 palabras",
    "description": "Descripción persuasiva 15-20 palabras enfocada en resultado emocional"
  }
]
Nota: Usa nombres de iconos de Lucide-react: shield, truck, star, zap, award, check-circle, heart, sparkles.

Solo JSON, sin texto extra.`;
        }

        // PROMPT PARA FAQ
        else if (section === "faq") {
            prompt = `Genera 6 preguntas frecuentes con respuestas en JSON para eliminar objeciones de compra.

Producto/Colección: ${pName}
Nicho: ${bNiche}

Incluye preguntas sobre: tiempos de entrega, envíos, métodos de pago, garantías y calidad.

Formato JSON:
[
  {
    "question": "Pregunta directa",
    "answer": "Respuesta clara y persuasiva"
  }
]`;
        }

        // PROMPT PARA DESCRIPCIÓN LARGA
        else if (type === "product" && section === "longDescription") {
            prompt = `Escribe una descripción de ventas persuasiva de 200-250 palabras para:

Producto: ${pName}
Nicho: ${bNiche}
Tono: ${bTone}

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
                    content: "Eres un copywriter experto en marketing digital de alta conversión. Respondes siempre en español con tono persuasivo y profesional."
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
