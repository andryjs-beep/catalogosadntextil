const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde .env.local en la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'tu_clave_de_groq_aqui') {
        console.error('❌ ERROR: Por favor ingresa tu API Key de Groq en .env.local');
        process.exit(1);
    }

    console.log('🤖 Probando conexión con Groq usando el modelo llama-3.3-70b-versatile...');

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Escribe un saludo corto confirmando que la conexión con el catálogo de ADN Textil es exitosa.' }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7
        });

        console.log('\n💬 --- RESPUESTA DE GROQ ---');
        console.log(chatCompletion.choices[0].message.content);
        console.log('-----------------------------\n');
        console.log('✅ ¡Conexión con Groq verificada exitosamente!');
    } catch (error) {
        console.error('❌ Falló la conexión con Groq:', error);
    }
}

main();
