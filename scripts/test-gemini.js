const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ ERROR: Registra tu GEMINI_API_KEY en el archivo .env.local');
        process.exit(1);
    }

    const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
    console.log(`🤖 Probando conexión nativa con Google Gemini API (${modelName})...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: 'Responde "CONEXION OK" si puedes leerme.' }]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error de respuesta de Gemini:', data);
            process.exit(1);
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('\n💬 --- RESPUESTA DE GEMINI ---');
        console.log(reply);
        console.log('-------------------------------\n');
        console.log('✅ ¡Conexión con Google Gemini API verificada exitosamente!');
    } catch (err) {
        console.error('❌ Falló la conexión:', err.message);
    }
}

testGemini();
