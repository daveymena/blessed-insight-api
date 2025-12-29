// Proveedor de IA OPTIMIZADO - Llamadas paralelas para máxima velocidad
// Usa Ollama y Groq simultáneamente, devuelve la primera respuesta

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
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
            num_predict: Math.min(maxTokens, 800), // Limitar para velocidad
          },
        }),
      }),
      15000 // 15 segundos timeout
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
    }
  } catch (error) {
    console.log('Ollama no disponible o timeout');
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
          max_tokens: Math.min(maxTokens, 800), // Limitar para velocidad
        }),
      }),
      10000 // 10 segundos timeout (Groq es rápido)
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
    console.log('Groq error o timeout');
    markKeyAsFailed(apiKey);
  }
  return { success: false, content: '', provider: 'groq' };
}

// FUNCIÓN PRINCIPAL: Llamadas PARALELAS - devuelve la primera respuesta
export async function callAI(messages: AIMessage[], maxTokens: number = 800): Promise<AIResponse> {
  const startTime = Date.now();
  
  // Lanzar ambas llamadas en paralelo
  const ollamaPromise = callOllama(messages, maxTokens);
  const groqPromise = callGroq(messages, maxTokens);

  // Promise.any devuelve la primera que tenga éxito
  try {
    const results = await Promise.all([ollamaPromise, groqPromise]);
    
    // Encontrar la primera respuesta exitosa
    const successResult = results.find(r => r.success);
    
    if (successResult) {
      console.log(`✓ Respuesta de ${successResult.provider} en ${successResult.timeMs}ms`);
      return successResult;
    }
  } catch (error) {
    console.error('Error en llamadas paralelas:', error);
  }

  // Si ambas fallan, intentar secuencialmente con más tiempo
  console.log('⚠️ Reintentando secuencialmente...');
  
  const ollamaResult = await callOllama(messages, maxTokens);
  if (ollamaResult.success) return ollamaResult;
  
  const groqResult = await callGroq(messages, maxTokens);
  if (groqResult.success) return groqResult;

  return { 
    success: false, 
    content: 'No se pudo conectar con ningún servicio de IA. Intenta de nuevo.', 
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

// Versión RÁPIDA para respuestas cortas (preguntas simples)
export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 400); // Menos tokens = más rápido
}

// Versión para respuestas largas (exégesis, planes)
export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1200);
}

// Info del estado
export function getAIStatus(): { groqKeys: number; activeKey: number; failedKeys: number } {
  return {
    groqKeys: GROQ_API_KEYS.length,
    activeKey: currentKeyIndex + 1,
    failedKeys: failedKeys.size,
  };
}
