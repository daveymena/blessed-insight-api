// Proveedor de IA - Ollama via Nginx proxy (evita CORS)

const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2:2b';

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
  
  // Timeout dinámico: mínimo 90s, más para respuestas largas
  const timeout = Math.max(90000, maxTokens * 30);

  console.log('🚀 Iniciando consulta IA via Nginx proxy...');

  // Usar proxy Nginx que evita CORS: /api/ollama/ -> Ollama
  try {
    console.log(`📡 Ollama via Nginx: /api/ollama/api/generate`);
    
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
    console.warn(`⚠️ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  return {
    success: false,
    content: 'No se pudo conectar con el servicio de IA. Verifica que Ollama esté corriendo.',
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
