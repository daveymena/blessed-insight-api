// Proveedor de IA OPTIMIZADO - Llamadas paralelas para máxima velocidad
// Usa Ollama y Groq simultáneamente, devuelve la primera respuesta

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const USE_OLLAMA = import.meta.env.VITE_USE_OLLAMA === 'true';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

// Recolectar todas las API keys de Groq
const GROQ_API_KEYS: string[] = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean) as string[];

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

// Llamar a Ollama (optimizado)
async function callOllama(messages: AIMessage[], maxTokens: number): Promise<AIResponse> {
  const startTime = Date.now();
  if (!USE_OLLAMA) return { success: false, content: '', provider: 'ollama' };
  try {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const userPrompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n');

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
      60000 // 60 segundos timeout para respuestas largas
    );

    if (response.ok) {
      const data = await response.json();
      if (data.response) {
        return {
          success: true,
          content: data.response,
          provider: 'ollama',
          timeMs: Date.now() - startTime
        };
      }
    } else {
      console.warn(`🛑 Ollama falló con status: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.warn(`🛑 Ollama inaccesible (${OLLAMA_BASE_URL}): ${error instanceof Error ? error.message : 'Error de red'}`);
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
      45000 // 45 segundos timeout
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
    } else if (response.status === 429 || response.status === 503) {
      markKeyAsFailed(apiKey);
      // Reintentar con otra key
      return callGroq(messages, maxTokens);
    }
  } catch (error) {
    console.warn(`🛑 Groq error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    markKeyAsFailed(apiKey);
  }
  return { success: false, content: '', provider: 'groq' };
}

// FUNCIÓN PRINCIPAL: Llamadas PARALELAS - devuelve la primera respuesta EXITOSA
export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();

  // Lanzar ambas llamadas en paralelo
  const ollamaPromise = callOllama(messages, maxTokens);
  const groqPromise = callGroq(messages, maxTokens);

  return new Promise((resolve) => {
    let finishedCount = 0;
    let resolved = false;

    const handleResult = (result: AIResponse) => {
      finishedCount++;

      // Si el proveedor tuvo éxito y no hemos respondido aún, resolvemos de inmediato
      if (result.success && !resolved) {
        resolved = true;
        console.log(`✓ IA: Respuesta recibida de ${result.provider.toUpperCase()} en ${result.timeMs}ms`);
        resolve(result);
        return;
      }

      // Si ambos fallaron y nadie ha respondido (porque ambos fueron success: false)
      if (finishedCount === 2 && !resolved) {
        resolved = true;
        console.warn('❌ IA: Ambos proveedores de primer nivel fallaron.');

        resolve({
          success: false,
          content: 'No se pudo conectar con ningún servicio de Biblo (IA). Revisa tu conexión o las claves en la configuración.',
          provider: 'error',
          timeMs: Date.now() - startTime
        });
      }
    };

    // Escuchar a ambos sin bloquear el uno al otro
    ollamaPromise.then(handleResult).catch(() => handleResult({ success: false, content: '', provider: 'ollama' }));
    groqPromise.then(handleResult).catch(() => handleResult({ success: false, content: '', provider: 'groq' }));

    // Safety timeout total de la función por si algo queda en el limbo
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          success: false,
          content: 'Tiempo de espera agotado. Revisa tu conexión o intenta más tarde.',
          provider: 'error',
          timeMs: Date.now() - startTime
        });
      }
    }, 50000); // 50s total safety
  });
}

// Versión RÁPIDA para respuestas cortas (preguntas simples)
export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1000);
}

// Versión para respuestas largas (exégesis, planes)
export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 3000);
}

// Info del estado
export function getAIStatus(): { groqKeys: number; activeKey: number; failedKeys: number } {
  return {
    groqKeys: GROQ_API_KEYS.length,
    activeKey: currentKeyIndex + 1,
    failedKeys: failedKeys.size,
  };
}
