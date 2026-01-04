import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

async function testGroqDirect() {
    console.log('🧪 Testing Groq API directly...');
    console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 15)}...` : 'NOT FOUND');

    if (!GROQ_API_KEY) {
        console.error('❌ No API key found!');
        return;
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: 'Di "Hola" en una palabra.' }],
                max_tokens: 10
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log('Response:', data.choices[0].message.content);
        } else {
            console.log('❌ FAILED');
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

testGroqDirect();
