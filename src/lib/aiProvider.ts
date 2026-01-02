// Proveedor de IA - Via Backend Node.js (evita CORS completamente)

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

  console.log('🚀 Iniciando consulta IA via Backend...');

  // Usar Backend Node.js que llama a Ollama (sin CORS)
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

    const data = await response.json();
    
    if (data.success && data.content) {
      console.log(`✅ ${data.provider} respondió en ${Date.now() - startTime}ms`);
      return { 
        success: true, 
        content: data.content, 
        provider: data.provider || 'ollama', 
        timeMs: Date.now() - startTime 
      };
    } else {
      console.warn(`⚠️ Backend respondió sin éxito:`, data);
    }
  } catch (error) {
    console.warn(`⚠️ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
