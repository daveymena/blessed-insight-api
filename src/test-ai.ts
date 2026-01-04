import { callAI } from './lib/aiProvider';

// Test simple de IA
async function testAI() {
    console.log('🧪 Iniciando test de IA...');

    const messages = [
        { role: 'system' as const, content: 'Eres un asistente útil.' },
        { role: 'user' as const, content: 'Di "Hola" en una palabra.' }
    ];

    const result = await callAI(messages, 50);

    console.log('📊 Resultado del test:', result);
    return result;
}

// Exportar para uso en consola
(window as any).testAI = testAI;

console.log('✅ Test de IA disponible. Ejecuta: window.testAI()');
