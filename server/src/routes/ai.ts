import { Router } from 'express';

const router = Router();

// Configuración desde variables de entorno - Tolerante a fallos de Nomenclatura
const OLLAMA_EXTERNAL_URL = process.env.VITE_OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || process.env.OLLAMA_MODEL || 'gemma2:2b';
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// URLs internas para Easypanel/Docker
const OLLAMA_INTERNAL_URLS = [
  'http://ollama.ollama:11434',      // EasyPanel interno
  'http://ollama_ollama:11434',      // Docker Compose style
  'http://ollama:11434',             // Simple name
];

// Recolectar llaves de Groq (Probando ambos formatos: VITE_ y normal)
const GROQ_API_KEYS: string[] = [
  // Formato VITE (para compatibilidad con el frontend)
  process.env.VITE_GROQ_API_KEY,
  process.env.VITE_GROQ_API_KEY_2,
  process.env.VITE_GROQ_API_KEY_3,
  process.env.VITE_GROQ_API_KEY_4,
  // Formato normal (estándar de backend)
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
].filter(Boolean) as string[];

// Eliminar duplicados si los hay
const UNIQUE_GROQ_KEYS = [...new Set(GROQ_API_KEYS)];

console.log(`[AI Config] Backend cargado. Model: ${OLLAMA_MODEL}, Groq Keys: ${UNIQUE_GROQ_KEYS.length}`);

let currentKeyIndex = 0;

async function generateAIResponse(params: {
  prompt?: string,
  system?: string,
  messages?: any[],
  maxTokens?: number
}) {
  const { prompt, system, messages, maxTokens = 2000 } = params;

  // Lista de URLs para intentar conectarse a Ollama (internas primero, luego externa)
  const ollamaUrls = [...OLLAMA_INTERNAL_URLS, OLLAMA_EXTERNAL_URL];

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
      console.warn(`[AI] ⚠️ Ollama en ${baseUrl} respondió con status: ${response.status}`);
    } catch (error) {
      console.warn(`[AI] ⚠️ Fallo conexión Ollama en ${baseUrl}: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }

  // 2. Fallback a GROQ
  if (UNIQUE_GROQ_KEYS.length > 0) {
    console.log(`[AI] 🔄 Recurriendo a Groq (${UNIQUE_GROQ_KEYS.length} llaves disponibles)`);
    for (let attempt = 0; attempt < Math.min(2, UNIQUE_GROQ_KEYS.length); attempt++) {
      const apiKey = UNIQUE_GROQ_KEYS[currentKeyIndex];
      const currentKeyNum = currentKeyIndex + 1;
      currentKeyIndex = (currentKeyIndex + 1) % UNIQUE_GROQ_KEYS.length;

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
        } else {
          const errorData = await response.text();
          console.warn(`[AI] ⚠️ Groq error (${response.status}): ${errorData.substring(0, 100)}`);
        }
      } catch (error) {
        console.error(`[AI] ❌ Error crítico Groq con llave #${currentKeyNum}:`, error);
      }
    }
  } else {
    console.error('[AI] ❌ Error: No se encontraron llaves de Groq en el entorno (GROQ_API_KEY o VITE_GROQ_API_KEY)');
  }

  return {
    success: false,
    content: 'No se pudo conectar con ningún servicio de IA. Por favor, verifica que las API Keys estén bien escritas en Easypanel (ya sea como GROQ_API_KEY o VITE_GROQ_API_KEY).',
    provider: 'error'
  };
}

// Endpoint unificado
router.post('/generate', async (req, res) => {
  try {
    const result = await generateAIResponse(req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(503).json(result);
    }
  } catch (err) {
    console.error('[AI Router] Error interno:', err);
    res.status(500).json({ success: false, content: 'Error interno en el servidor de IA.', provider: 'error' });
  }
});

// Alias para compatibilidad
router.post('/ollama/generate', async (req, res) => {
  const result = await generateAIResponse(req.body);
  res.json(result);
});

// Health check mejorado para diagnóstico en Easypanel
router.get('/ollama/health', async (req, res) => {
  const check = async (url: string) => {
    try {
      const resp = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      return resp.ok;
    } catch { return false; }
  };

  const results: Record<string, boolean> = {};
  for (const url of OLLAMA_INTERNAL_URLS) {
    results[url] = await check(url);
  }
  results[OLLAMA_EXTERNAL_URL] = await check(OLLAMA_EXTERNAL_URL);

  res.json({
    status: UNIQUE_GROQ_KEYS.length > 0 || Object.values(results).some(v => v) ? 'ok' : 'error',
    ollama_urls: results,
    groq_keys_count: UNIQUE_GROQ_KEYS.length,
    env_sample: {
      has_groq_vite: !!process.env.VITE_GROQ_API_KEY,
      has_groq_normal: !!process.env.GROQ_API_KEY,
      ollama_external: OLLAMA_EXTERNAL_URL,
      model: OLLAMA_MODEL
    }
  });
});

export default router;
