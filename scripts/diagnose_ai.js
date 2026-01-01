import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Cargar variables de entorno
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const GROQ_KEY = envConfig.VITE_GROQ_API_KEY;
const OLLAMA_URL = envConfig.VITE_OLLAMA_BASE_URL;

console.log('🔍 Iniciando Diagnóstico de Conexión IA...\n');

async function testGroq() {
    console.log('--- Probando Groq Cloud ---');
    if (!GROQ_KEY) {
        console.log('❌ No hay API Key de Groq configurada.');
        return;
    }

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s test timeout

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: 'Hola' }],
                max_tokens: 10
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const time = Date.now() - start;
        if (response.ok) {
            console.log(`✅ Groq respondió EXITOSAMENTE en ${time}ms`);
        } else {
            console.log(`❌ Groq error: ${response.status} ${response.statusText} (${time}ms)`);
        }
    } catch (error) {
        console.log(`❌ Groq falló: ${error.message} (${Date.now() - start}ms)`);
    }
}

async function testOllama() {
    console.log('\n--- Probando Ollama (EasyPanel/Local) ---');
    if (!OLLAMA_URL) {
        console.log('❌ No hay URL de Ollama configurada.');
        return;
    }
    console.log(`Target: ${OLLAMA_URL}`);

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s test timeout

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma2:2b',
                prompt: 'Hola',
                stream: false
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const time = Date.now() - start;
        if (response.ok) {
            console.log(`✅ Ollama respondió EXITOSAMENTE en ${time}ms`);
        } else {
            console.log(`❌ Ollama error: ${response.status} ${response.statusText} (${time}ms)`);
        }
    } catch (error) {
        console.log(`❌ Ollama falló: ${error.message} (${Date.now() - start}ms)`);
        console.log('   (Posible causa: CORS, firewall, o servidor apagado)');
    }
}

async function run() {
    await testGroq();
    await testOllama();
    console.log('\n🏁 Diagnóstico completado.');
}

run();
