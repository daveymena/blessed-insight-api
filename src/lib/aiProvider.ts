// Proveedor de IA - Ollama (principal) + Groq (respaldo)
// Soporta: Proxy backend local, Proxy Nginx (producción), URL externa directa

const OLLAMA_EXTERNAL_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

// URL del backend para proxy (evita CORS) - para desarrollo local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Recolectar todas las API keys de Groq
const GROQ_API_KEYS: string[] = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean) as string[];

// Debug: mostrar configuración al cargar
console.log('🔧 AI Provider Config:', {
  OLLAMA_EXTERNAL_URL,
  OLLAMA_MODEL,
  API_BASE_URL: API_BASE_URL || '(no configurado)',
  GROQ_KEYS: GROQ_API_KEYS.length
});

// Estado de rotación de keys Groq
let currentKeyIndex = 0;
let failedKeys: Set<number> = new Set();
let lastKeyReset = Date.now();
const KEY_RESET_INTERVAL = 3 * 60 * 1000;

function getNextGroqKey(): string | null {
  if (Date.now() - lastKeyReset > KEY_RESET_INTERVAL) {
    failedKeys.clear();
    lastKeyReset = Date.now();
  }
  for (let i = 0; i < GROQ_API_KEYS.length; i++) {
    const index = (currentKeyIndex + i) % GROQ_API_KEYS.length;
    if (!failedKeys.has(index)) {
      currentKeyIndex = index;
      return GROQ_API_KEYS[index];
    }
  }
  failedKeys.clear();
  return GROQ_API_KEYS[0] || null;
}

function markKeyAsFailed(key: string): void {
  const index = GROQ_API_KEYS.indexOf(key);
  if (index !== -1) {
    failedKeys.add(index);
    currentKeyIndex = (index + 1) % GROQ_API_KEYS.length;
  }
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  provider: 'ollama' | 'groq' | 'error';
  timeMs?: number;
}

// Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

// Llamar a Ollama - Intenta múltiples métodos
async function callOllama(messages: AIMessage[], maxTokens: number): Promise<AIResponse> {
  const startTime = Date.now();
  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n');

  // Timeout dinámico basado en tokens solicitados (Mínimo 90s para modelos locales en CPU)
  const timeout = Math.max(90000, maxTokens * 25);

  // 1. Intentar via Proxy (Nginx interno - Ahora con Host correcto)
  try {
    console.log(`📡 Consultando a Biblo vía Red Interna...`);
    const response = await withTimeout(
      fetch('/api/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: { temperature: 0.7, num_predict: maxTokens },
        }),
      }),
      timeout
    );

    if (response.ok) {
      const data = await response.json();
      if (data.response) {
        console.log(`✅ Respuesta recibida vía Red Interna (${Date.now() - startTime}ms)`);
        return { success: true, content: data.response, provider: 'ollama', timeMs: Date.now() - startTime };
      }
    } else {
      const errorText = await response.text();
      console.warn(`🛑 El servidor respondió con error ${response.status}: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.warn(`⚠️ Red interna falló (${errorMsg}), probando directa...`);
  }

  // 2. Fallback: Conexión Directa
  if (OLLAMA_EXTERNAL_URL) {
    try {
      const response = await withTimeout(
        fetch(`${OLLAMA_EXTERNAL_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            options: { temperature: 0.7, num_predict: maxTokens },
          }),
        }),
        timeout
      );
      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          return { success: true, content: data.response, provider: 'ollama', timeMs: Date.now() - startTime };
        }
      }
    } catch (error) {
      console.error(`❌ Fallo total en comunicación con Ollama`);
    }
  }

  return { success: false, content: '', provider: 'ollama' };
}

// Llamar a Groq
async function callGroq(messages: AIMessage[], maxTokens: number): Promise<AIResponse> {
  const startTime = Date.now();
  const apiKey = getNextGroqKey();
  if (!apiKey) return { success: false, content: '', provider: 'groq' };

  try {
    const response = await withTimeout(
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      }),
      45000
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`✅ Groq respondió en ${Date.now() - startTime}ms`);
        return { success: true, content, provider: 'groq', timeMs: Date.now() - startTime };
      }
    } else if (response.status === 401 || response.status === 429 || response.status === 503 || response.status === 403) {
      console.warn(`🛑 Groq key #${currentKeyIndex + 1} falló (${response.status}). Probando siguiente...`);
      markKeyAsFailed(apiKey);
      if (failedKeys.size < GROQ_API_KEYS.length) {
        return callGroq(messages, maxTokens);
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ Error inesperado de Groq (${response.status}): ${errorText.substring(0, 100)}`);
    }
  } catch (error) {
    console.warn(`⚠️ Error de red con Groq: ${error instanceof Error ? error.message : 'Error'}`);
    markKeyAsFailed(apiKey);
    if (failedKeys.size < GROQ_API_KEYS.length) {
      return callGroq(messages, maxTokens);
    }
  }
  return { success: false, content: '', provider: 'groq' };
}

// FUNCIÓN PRINCIPAL: Ollama primero, Groq como respaldo
export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();

  console.log('🚀 Iniciando consulta IA...');

  // 1. Intentar con Ollama
  const ollamaResult = await callOllama(messages, maxTokens);
  if (ollamaResult.success) return ollamaResult;

  console.warn('⚠️ Ollama no disponible, probando Groq...');

  // 2. Fallback a Groq
  const groqResult = await callGroq(messages, maxTokens);
  if (groqResult.success) return groqResult;

  // 3. Ambos fallaron
  return {
    success: false,
    content: 'No se pudo conectar con ningún servicio de IA. Verifica tu conexión.',
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

// Versión rápida (respuestas cortas)
export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1200);
}

// Versión detallada (exégesis profunda)
export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 4500);
}

// Info del estado
export function getAIStatus(): { groqKeys: number; activeKey: number; failedKeys: number } {
  return {
    groqKeys: GROQ_API_KEYS.length,
    activeKey: currentKeyIndex + 1,
    failedKeys: failedKeys.size,
  };
}
