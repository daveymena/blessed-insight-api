import http from 'http';

const data = JSON.stringify({
    prompt: 'Di "Hola" en una palabra.'
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Probando Proxy de Vite (http://localhost:8080/api/ai/generate)...\n');

const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('\n📝 Respuesta completa:');
        try {
            const parsed = JSON.parse(responseData);
            console.log(JSON.stringify(parsed, null, 2));

            if (parsed.success) {
                console.log('\n✅ ÉXITO! El proxy de Vite está funcionando.');
                console.log('Contenido:', parsed.content);
            } else {
                console.log('\n❌ El proxy respondió pero con error.');
            }
        } catch (e) {
            console.log('Raw response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
});

req.write(data);
req.end();
