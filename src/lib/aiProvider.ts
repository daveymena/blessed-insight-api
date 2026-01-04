import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from './constants';

// Usar proxy local para evitar CORS
const OLLAMA_BASE_URL = '/api/ollama'; // Vite proxy configurado
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const OLLAMA_TIMEOUT = 0; // Tiempo indeterminado para producciones largas con IA
const OLLAMA_MAX_TOKENS = 500; // Reducimos un poco para ganar velocidad pero mantener profundidad




// Groq es más rápido - usar como fallback
const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
  import.meta.env.VITE_GROQ_API_KEY_6,
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

// Llamar al Backend AI (que internamente usa Ollama)
async function callOllama(
  messages: AIMessage[],
  maxTokens: number,
  onProgress?: (content: string) => void
): Promise<AIResponse | null> {
  const startTime = Date.now();
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');

  try {
    console.log(`📡 Llamando al Backend AI (/api/ai/generate)... ${onProgress ? '(STREAMING)' : ''}`);

    // Timestamp para forzar a ignorar cualquier cache de service worker
    const cacheBuster = `?t=${Date.now()}`;

    const response = await fetch(`/api/ai/generate${cacheBuster}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        prompt: systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage,
        maxTokens: Math.min(maxTokens, OLLAMA_MAX_TOKENS),
        stream: !!onProgress
      }),
      cache: 'no-cache'
    });

    if (response.ok) {
      if (onProgress && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  onProgress(fullContent);
                }
              } catch (e) { }
            }
          }
        }

        return {
          success: true,
          content: fullContent,
          provider: 'ollama',
          timeMs: Date.now() - startTime
        };
      } else {
        const data = await response.json();
        if (data.success && data.content) {
          return {
            success: true,
            content: data.content,
            provider: data.provider || 'backend',
            timeMs: Date.now() - startTime
          };
        }
      }
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error(`❌ Fallo crítico en fetch:`, error);
    throw error;
  }
}

async function callBackendProxy(messages: AIMessage[], maxTokens: number): Promise<AIResponse | null> {
  const startTime = Date.now();
  try {
    const response = await withTimeout(
      fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ messages, maxTokens })
      }),
      40000
    );
    if (response.ok) {
      const result = await response.json();
      if (result.success) return { ...result, timeMs: Date.now() - startTime };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend AI Error:', errorData.content || 'Error desconocido');
    }
  } catch (error) {
    console.warn('Backend link failed');
  }
  return null;
}


/**
 * Llamada principal a IA - SOLO Ollama (ilimitado) con soporte para Streaming
 */
export async function callAI(
  messages: AIMessage[],
  maxTokens: number = 800,
  onProgress?: (content: string) => void
): Promise<AIResponse> {
  const startTime = Date.now();

  console.log(`🚀 Iniciando consulta IA con Ollama (max ${maxTokens} tokens)...`);

  let errorMessage = 'Desconocido';

  // Usar SOLO Ollama
  try {
    const ollamaResult = await callOllama(messages, maxTokens, onProgress);
    if (ollamaResult && ollamaResult.success) {
      console.log(`✅ Respuesta exitosa de Ollama en ${Date.now() - startTime}ms`);
      return ollamaResult;
    }
  } catch (e) {
    console.error('❌ Error crítico en Ollama:', e);
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  // Si Ollama falla, intentar Groq como fallback (Groq no soporta streaming aquí por ahora)
  if (!onProgress) {
    const groqResult = await callGroq(messages, maxTokens);
    if (groqResult && groqResult.success) return groqResult;
  }

  // Si todo falla
  return {
    success: false,
    content: `⚠️ Error de conexión: ${errorMessage}. \n\nPor favor verifica:\n1. Que el servidor 'server' esté corriendo (puerto 3000)\n2. Que Ollama esté accesible.`,
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
