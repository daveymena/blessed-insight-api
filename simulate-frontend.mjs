import fetch from 'node-fetch';

// Simular exactamente lo que hace el frontend
async function simulateFrontendCall() {
    console.log('🧪 Simulando llamada del Frontend...\n');

    const messages = [
        { role: 'system', content: 'Eres un asistente bíblico.' },
        { role: 'user', content: 'Di "Hola" en una palabra.' }
    ];

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessage = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');

    const payload = {
        prompt: systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage,
        maxTokens: 800
    };

    console.log('📡 Llamando a http://localhost:8080/api/ai/generate');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:8080/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`\n📊 Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('📝 Response:', JSON.stringify(data, null, 2));

            if (data.success && data.content) {
                console.log('\n✅ ÉXITO! La simulación funcionó correctamente.');
                console.log('Contenido:', data.content);
            } else {
                console.log('\n⚠️ Respuesta sin contenido esperado');
            }
        } else {
            const text = await response.text();
            console.log('❌ Error:', text.substring(0, 300));
        }
    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

simulateFrontendCall();
