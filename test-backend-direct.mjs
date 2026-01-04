import http from 'http';

const data = JSON.stringify({
    prompt: 'Di "Hola" en una palabra.'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Probando Backend Directo (http://localhost:3000/api/ai/generate)...\n');

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
                console.log('\n✅ ÉXITO! El backend respondió correctamente.');
                console.log('Contenido:', parsed.content);
            } else {
                console.log('\n❌ El backend respondió pero con error.');
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
