import { Router } from 'express';

const router = Router();

const OLLAMA_BASE_URL = process.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

// Recolectar llaves de Groq del entorno del servidor
const GROQ_API_KEYS: string[] = [
  process.env.VITE_GROQ_API_KEY,
  process.env.VITE_GROQ_API_KEY_2,
  process.env.VITE_GROQ_API_KEY_3,
  process.env.VITE_GROQ_API_KEY_4,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

// Helper para obtener la siguiente llave de Groq
function getNextGroqKey() {
  if (GROQ_API_KEYS.length === 0) return null;
  const key = GROQ_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
}

// Endpoint unificado: Intenta Ollama, si falla prueba Groq
router.post('/generate', async (req, res) => {
  const { prompt, system, messages, maxTokens = 2000 } = req.body;

  // 1. Intentar con Ollama
  try {
    console.log('🤖 Intentando Ollama...');
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

    // Timeout de 60s para Ollama
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.7, num_predict: maxTokens },
      }),
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json() as any;
      if (data.response) {
        return res.json({ success: true, content: data.response, provider: 'ollama' });
      }
    }
  } catch (error) {
    console.warn('⚠️ Ollama falló o timeout. Probando Groq...');
  }

  // 2. Fallback a Groq (intentar hasta con 2 llaves si una falla)
  for (let attempt = 0; attempt < Math.min(2, GROQ_API_KEYS.length); attempt++) {
    const apiKey = getNextGroqKey();
    if (!apiKey) break;

    try {
      console.log(`🚀 Intentando Groq con llave #${currentKeyIndex}...`);

      const groqMessages = messages || [
        { role: 'system', content: system || 'Eres un asistente bíblico.' },
        { role: 'user', content: prompt }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return res.json({ success: true, content, provider: 'groq' });
        }
      } else {
        console.warn(`🛑 Groq error ${response.status}.`);
      }
    } catch (error) {
      console.error('❌ Error llamando a Groq:', error);
    }
  }

  res.status(503).json({
    success: false,
    error: 'No se pudo conectar con ningún servicio de IA (Ollama/Groq)',
    provider: 'none'
  });
});

// Proxy para Ollama (Legacy/Directo)
router.post('/ollama/generate', async (req, res) => {
  // ... (mantenemos la lógica anterior por si acaso pero redirigida al nuevo)
  req.url = '/generate';
  return router.handle(req, res, () => { });
});

// Health check para Ollama
router.get('/ollama/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json() as { models: Array<{ name: string }> };
      res.json({ status: 'ok', models: data.models?.map((m: any) => m.name) || [] });
    } else {
      res.status(500).json({ status: 'error', message: 'Ollama not responding' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Cannot connect to Ollama' });
  }
});

export default router;
