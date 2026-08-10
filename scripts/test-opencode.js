const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
    const apiKey = process.env.OPENCODE_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('❌ ERROR: Por favor ingresa tu OPENCODE_API_KEY en .env.local');
        process.exit(1);
    }

    const baseURL = process.env.AI_BASE_URL || (process.env.OPENCODE_API_KEY ? 'https://opencode.ai/zen/v1' : 'https://api.groq.com/openai/v1');
    const model = process.env.AI_MODEL || (process.env.OPENCODE_API_KEY ? 'deepseek-v4-flash-free' : 'llama-3.3-70b-versatile');

    console.log(`🤖 Probando conexión con la IA en ${baseURL} usando el modelo ${model}...`);

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL
    });

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Escribe un saludo corto confirmando que la conexión con el catálogo de ADN Textil es exitosa.' }],
            model: model,
            temperature: 0.7
        });

        console.log('\n💬 --- RESPUESTA DE LA IA ---');
        console.log(chatCompletion.choices[0].message.content);
        console.log('-----------------------------\n');
        console.log('✅ ¡Conexión con la IA verificada exitosamente!');
    } catch (error) {
        console.error('❌ Falló la conexión con la IA:', error);
    }
}

main();
