// Test directo de Ollama desde el navegador
async function testOllamaFromBrowser() {
    console.log('🧪 Testing Ollama from browser...');
    const url = 'https://ollama-ollama.ginee6.easypanel.host/api/generate';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma2:2b',
                prompt: 'Di "Hola" en una palabra.',
                stream: false,
                options: { temperature: 0.7, num_predict: 50 }
            })
        });

        console.log('Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Response:', data.response);
        } else {
            const text = await response.text();
            console.log('❌ FAILED. Error:', text.substring(0, 200));
        }
    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

(window as any).testOllama = testOllamaFromBrowser;
console.log('✅ Ollama test disponible. Ejecuta: window.testOllama()');
