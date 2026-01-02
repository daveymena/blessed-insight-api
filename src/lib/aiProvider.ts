// Proveedor de IA - Híbrido: Local directo a Ollama, Producción via Backend

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';
const IS_PRODUCTION = import.meta.env.PROD;

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

export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();
  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n');
  
  // Timeout dinámico: mínimo 120s para modelos locales
  const timeout = Math.max(120000, maxTokens * 50);

  // En producción: usar backend (evita CORS)
  // En desarrollo: llamar directo a Ollama local
  if (IS_PRODUCTION) {
    return callViaBackend(systemPrompt, userPrompt, maxTokens, timeout, startTime);
  } else {
    return callOllamaDirectly(systemPrompt, userPrompt, maxTokens, timeout, startTime);
  }
}

// Llamada directa a Ollama (desarrollo local)
async function callOllamaDirectly(
  systemPrompt: string, 
  userPrompt: string, 
  maxTokens: number, 
  timeout: number,
  startTime: number
): Promise<AIResponse> {
  console.log('🚀 Iniciando consulta IA directo a Ollama local...');
  
  try {
    console.log(`📡 Ollama: ${OLLAMA_BASE_URL}/api/generate`);
    
    const response = await withTimeout(
      fetch(`${OLLAMA_BASE_URL}/api/generate`, {
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
        console.log(`✅ Ollama respondió en ${Date.now() - startTime}ms`);
        return { 
          success: true, 
          content: data.response, 
          provider: 'ollama', 
          timeMs: Date.now() - startTime 
        };
      }
    } else {
      console.warn(`⚠️ Ollama respondió con error: ${response.status}`);
    }
  } catch (error) {
    console.warn(`⚠️ Error Ollama: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  return {
    success: false,
    content: 'No se pudo conectar con Ollama. Verifica que esté corriendo en localhost:11434',
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

// Llamada via Backend (producción - evita CORS)
async function callViaBackend(
  systemPrompt: string, 
  userPrompt: string, 
  maxTokens: number, 
  timeout: number,
  startTime: number
): Promise<AIResponse> {
  console.log('🚀 Iniciando consulta IA via Backend...');
  
  try {
    console.log(`📡 Backend: /api/ai/generate`);
    
    const response = await withTimeout(
      fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          system: systemPrompt,
          maxTokens,
        }),
      }),
      timeout
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        console.log(`✅ ${data.provider} respondió en ${Date.now() - startTime}ms`);
        return { 
          success: true, 
          content: data.content, 
          provider: data.provider || 'ollama', 
          timeMs: Date.now() - startTime 
        };
      }
    }
    console.warn(`⚠️ Backend respondió con error: ${response.status}`);
  } catch (error) {
    console.warn(`⚠️ Error Backend: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  return {
    success: false,
    content: 'No se pudo conectar con ningún servicio de IA. Verifica tu conexión.',
    provider: 'error',
    timeMs: Date.now() - startTime
  };
}

export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1200);
}

export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 3000);
}

export function getAIStatus() {
  return { groqKeys: 0, activeKey: 0, failedKeys: 0 };
}
