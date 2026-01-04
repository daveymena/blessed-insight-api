import fetch from 'node-fetch';

// Test Backend Directo
async function testBackendDirect() {
    console.log('🧪 Testing Backend Direct (Port 3000)...\n');
    const url = 'http://localhost:3000/api/ai/generate';
    await doTest(url);
}

// Test Proxy
async function testViteProxy() {
    console.log('\n🧪 Testing Vite Proxy (Port 8080)...\n');
    const url = 'http://localhost:8080/api/ollama/api/generate';
    await doTest(url);
}

async function doTest(url) {
    const payload = {
        model: 'gemma2:2b',
        prompt: 'Di "Hola" en una sola palabra.',
        stream: false,
        options: { temperature: 0.7, num_predict: 50 }
    };

    console.log('📡 Enviando petición a:', url);

    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const duration = Date.now() - startTime;
        console.log('📊 Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Respuesta:', data.response || data.content);
        } else {
            const text = await response.text();
            console.log('❌ FAILED. Response:', text.substring(0, 100));
        }
    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

async function run() {
    await testBackendDirect();
    await testViteProxy();
}

run();
