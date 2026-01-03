// Proveedor de IA - Ollama + Groq Fallback (optimizado para velocidad)

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const OLLAMA_TIMEOUT = 45000; // 45s timeout (reducido)
const OLLAMA_MAX_TOKENS = 300; // Tokens muy reducidos para respuestas rápidas

// Groq es más rápido - usar como fallback
const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean) as string[];
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_TIMEOUT = 30000; // 30s para Groq (es más rápido)

// Ollama primero (gratis), Groq como fallback
const PREFER_OLLAMA = true;

let currentGroqKeyIndex = 0;

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

// Llamar a Groq (rápido)
async function callGroq(messages: AIMessage[], maxTokens: number): Promise<AIResponse | null> {
  if (GROQ_API_KEYS.length === 0) return null;
  
  const startTime = Date.now();
  
  for (let attempt = 0; attempt < Math.min(2, GROQ_API_KEYS.length); attempt++) {
    const apiKey = GROQ_API_KEYS[currentGroqKeyIndex];
    currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
    
    try {
      console.log(`📡 Groq (key ${currentGroqKeyIndex + 1}/${GROQ_API_KEYS.length})...`);
      
      const response = await withTimeout(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: 0.7,
            max_tokens: maxTokens
          })
        }),
        GROQ_TIMEOUT
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`✅ Groq respondió en ${Date.now() - startTime}ms`);
          return {
            success: true,
            content,
            provider: 'groq',
            timeMs: Date.now() - startTime
          };
        }
      } else if (response.status === 401) {
        console.warn(`⚠️ Groq key inválida, probando siguiente...`);
        continue;
      }
    } catch (error) {
      console.warn(`⚠️ Groq error: ${error instanceof Error ? error.message : 'Error'}`);
    }
  }
  
  return null;
}

// Llamar a Ollama (local/self-hosted)
async function callOllama(messages: AIMessage[], maxTokens: number): Promise<AIResponse | null> {
  const startTime = Date.now();
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
  
  try {
    console.log(`📡 Ollama: ${OLLAMA_BASE_URL}...`);
    
    const response = await withTimeout(
      fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage,
          stream: false,
          options: { 
            temperature: 0.7, 
            num_predict: Math.min(maxTokens, OLLAMA_MAX_TOKENS) // Limitar tokens
          }
        })
      }),
      OLLAMA_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      if (data.response) {
        console.log(`✅ Ollama respondió en ${Date.now() - startTime}ms`);
        return {
          success: true,
          content: data.response,
          provider: 'ollama',
          timeMs: Date.now() - startTime
        };
      }
    }
  } catch (error) {
    console.warn(`⚠️ Ollama error: ${error instanceof Error ? error.message : 'Error'}`);
  }
  
  return null;
}

/**
 * Llamada principal a IA - Ollama primero (gratis), Groq como fallback
 */
export async function callAI(messages: AIMessage[], maxTokens: number = 800): Promise<AIResponse> {
  const startTime = Date.now();
  
  console.log(`🚀 Iniciando consulta IA (max ${maxTokens} tokens)...`);

  // 1. Ollama primero (gratis)
  const ollamaResult = await callOllama(messages, maxTokens);
  if (ollamaResult) return ollamaResult;

  // 2. Fallback a Groq si Ollama falla
  if (GROQ_API_KEYS.length > 0) {
    console.log('⚠️ Ollama falló, intentando Groq...');
    const groqResult = await callGroq(messages, maxTokens);
    if (groqResult) return groqResult;
  }

  return {
    success: false,
    content: 'No se pudo conectar con ningún servicio de IA. Verifica tu conexión.',
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 250); // Respuestas muy cortas y rápidas
}

export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 800); // Respuestas moderadas
}

export function getAIStatus() {
  return { 
    groqKeys: GROQ_API_KEYS.length, 
    activeKey: currentGroqKeyIndex + 1, 
    ollamaUrl: OLLAMA_BASE_URL,
    preferOllama: PREFER_OLLAMA
  };
}
