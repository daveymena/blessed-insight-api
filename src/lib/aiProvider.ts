// Proveedor de IA OPTIMIZADO - Llamadas paralelas para máxima velocidad
// Usa Ollama (via proxy) y Groq simultáneamente, devuelve la primera respuesta

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

// URL del servidor backend para proxy (evita CORS)
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
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  API_BASE_URL,
  GROQ_KEYS: GROQ_API_KEYS.length
});

// Estado de rotación de keys
let currentKeyIndex = 0;
let failedKeys: Set<number> = new Set();
let lastKeyReset = Date.now();
const KEY_RESET_INTERVAL = 3 * 60 * 1000; // 3 minutos

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
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

// Llamar a Ollama (via proxy si está disponible, directo si no)
async function callOllama(messages: AIMessage[], maxTokens: number): Promise<AIResponse> {
  const startTime = Date.now();

  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n');

  // Intentar primero via proxy del backend (evita CORS)
  if (API_BASE_URL) {
    try {
      console.log(`📡 Llamando a Ollama via proxy: ${API_BASE_URL}/api/ai/ollama/generate`);

      const response = await withTimeout(
        fetch(`${API_BASE_URL}/api/ai/ollama/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            system: systemPrompt,
            maxTokens,
          }),
        }),
        15000
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          console.log(`✅ Ollama (proxy) respondió en ${Date.now() - startTime}ms`);
          return {
            success: true,
            content: data.content,
            provider: 'ollama',
            timeMs: Date.now() - startTime
          };
        }
      }
    } catch (error) {
      console.warn(`🛑 Proxy Ollama falló: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }

  // Fallback: llamada directa a Ollama (puede fallar por CORS en producción)
  if (!OLLAMA_BASE_URL) {
    console.warn('🛑 Ollama: No hay URL configurada');
    return { success: false, content: '', provider: 'ollama' };
  }

  try {
    console.log(`📡 Llamando a Ollama directo: ${OLLAMA_BASE_URL}/api/generate`);

    const response = await withTimeout(
      fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: maxTokens,
          },
        }),
      }),
      15000
    );

    if (response.ok) {
      const data = await response.json();
      if (data.response) {
        console.log(`✅ Ollama (directo) respondió en ${Date.now() - startTime}ms`);
        return {
          success: true,
          content: data.response,
          provider: 'ollama',
          timeMs: Date.now() - startTime
        };
      }
    } else {
      console.warn(`🛑 Ollama falló con status: ${response.status}`);
    }
  } catch (error) {
    console.warn(`🛑 Ollama inaccesible: ${error instanceof Error ? error.message : 'Error de red'}`);
  }
  return { success: false, content: '', provider: 'ollama' };
}

// Llamar a Groq (optimizado)
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
      25000 // 25 segundos timeout
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return {
          success: true,
          content,
          provider: 'groq',
          timeMs: Date.now() - startTime
        };
      }
    } else if (response.status === 401) {
      // API Key inválida - marcar y NO reintentar infinitamente
      console.warn(`🛑 Groq API Key inválida (key #${currentKeyIndex + 1})`);
      markKeyAsFailed(apiKey);
      // Solo reintentar si hay más keys disponibles
      if (failedKeys.size < GROQ_API_KEYS.length) {
        return callGroq(messages, maxTokens);
      }
    } else if (response.status === 429 || response.status === 503) {
      markKeyAsFailed(apiKey);
      if (failedKeys.size < GROQ_API_KEYS.length) {
        return callGroq(messages, maxTokens);
      }
    }
  } catch (error) {
    console.warn(`🛑 Groq error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    markKeyAsFailed(apiKey);
  }
  return { success: false, content: '', provider: 'groq' };
}

// FUNCIÓN PRINCIPAL: Prioridad OLLAMA -> Fallback GROQ
export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();

  // 1. Intentar PRIMERO con Ollama (Principal)
  console.log('🚀 Iniciando consulta con IA Principal (Ollama)...');
  const ollamaResult = await callOllama(messages, maxTokens);

  if (ollamaResult.success) {
    return ollamaResult;
  }

  console.warn('⚠️ Ollama falló o no respondió. Activando respaldo (Groq)...');

  // 2. Si Ollama falla, intentar con Groq (Respaldo)
  const groqResult = await callGroq(messages, maxTokens);

  if (groqResult.success) {
    return groqResult;
  }

  // 3. Si ambos fallan
  return {
    success: false,
    content: 'No se pudo conectar con Biblo. Por favor verifica que el servidor de IA esté activo.',
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

// Versión RÁPIDA para respuestas cortas (preguntas simples)
export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1200);
}

// Versión para respuestas largas (exégesis profunda, estudios teológicos)
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
