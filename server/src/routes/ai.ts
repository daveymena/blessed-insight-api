import { Router } from 'express';

const router = Router();

// Configuración desde variables de entorno
const OLLAMA_EXTERNAL_URL = process.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_INTERNAL_URL = 'http://ollama_ollama:11434'; // URL interna de Docker
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

// Recolectar llaves de Groq
const GROQ_API_KEYS: string[] = [
  process.env.VITE_GROQ_API_KEY,
  process.env.VITE_GROQ_API_KEY_2,
  process.env.VITE_GROQ_API_KEY_3,
  process.env.VITE_GROQ_API_KEY_4,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

async function generateAIResponse(params: {
  prompt?: string,
  system?: string,
  messages?: any[],
  maxTokens?: number
}) {
  const { prompt, system, messages, maxTokens = 2000 } = params;

  // Lista de URLs para intentar conectarse a Ollama
  const ollamaUrls = [OLLAMA_INTERNAL_URL, OLLAMA_EXTERNAL_URL];

  // 1. Intentar con OLLAMA
  for (const baseUrl of ollamaUrls) {
    try {
      console.log(`[AI] Intentando Ollama (${OLLAMA_MODEL}) en ${baseUrl}...`);
      const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120s para modelos locales

      const response = await fetch(`${baseUrl}/api/generate`, {
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
          console.log(`[AI] ✅ Éxito con Ollama (${baseUrl})`);
          return { success: true, content: data.response, provider: 'ollama' };
        }
      }
      console.warn(`[AI] ⚠️ Ollama en ${baseUrl} respondió con error: ${response.status}`);
    } catch (error) {
      console.warn(`[AI] ⚠️ Fallo Ollama en ${baseUrl}: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }

  // 2. Fallback a GROQ
  if (GROQ_API_KEYS.length > 0) {
    console.log(`[AI] 🔄 Recurriendo a Groq (${GROQ_API_KEYS.length} llaves disponibles)`);
    for (let attempt = 0; attempt < Math.min(2, GROQ_API_KEYS.length); attempt++) {
      const apiKey = GROQ_API_KEYS[currentKeyIndex];
      const currentKeyNum = currentKeyIndex + 1;
      currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;

      try {
        console.log(`[AI] Intento Groq con llave #${currentKeyNum}`);
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
            console.log(`[AI] ✅ Éxito con Groq (llave #${currentKeyNum})`);
            return { success: true, content, provider: 'groq' };
          }
        }
        console.warn(`[AI] ⚠️ Groq error con llave #${currentKeyNum}: ${response.status}`);
      } catch (error) {
        console.error(`[AI] ❌ Error Groq con llave #${currentKeyNum}:`, error);
      }
    }
  }

  return {
    success: false,
    content: 'No se pudo conectar con ningún servicio de IA. Por favor, verifica tu configuración en Easypanel o intenta más tarde.',
    provider: 'error'
  };
}

// Endpoint unificado
router.post('/generate', async (req, res) => {
  const result = await generateAIResponse(req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(503).json(result);
  }
});

// Alias para compatibilidad
router.post('/ollama/generate', async (req, res) => {
  const result = await generateAIResponse(req.body);
  res.json(result);
});

// Health check mejorado
router.get('/ollama/health', async (req, res) => {
  const check = async (url: string) => {
    try {
      const resp = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      return resp.ok;
    } catch { return false; }
  };

  res.json({
    internal: await check(OLLAMA_INTERNAL_URL),
    external: await check(OLLAMA_EXTERNAL_URL),
    groqKeys: GROQ_API_KEYS.length,
    model: OLLAMA_MODEL
  });
});

export default router;
