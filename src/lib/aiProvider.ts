// Proveedor de IA - Directo a Ollama (requiere OLLAMA_ORIGINS=* en el servicio Ollama)

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
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

/**
 * Llamada directa a Ollama (sin backend)
 */
export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();
  
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
  
  console.log(`📡 Conectando a Ollama: ${OLLAMA_BASE_URL}`);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage,
        stream: false,
        options: { temperature: 0.7, num_predict: maxTokens }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Ollama respondió en ${Date.now() - startTime}ms`);
      return {
        success: true,
        content: data.response,
        provider: 'ollama',
        timeMs: Date.now() - startTime
      };
    } else {
      console.warn(`⚠️ Ollama error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error conectando a Ollama:', error);
  }

  return {
    success: false,
    content: 'No se pudo conectar con Ollama. Verifica que OLLAMA_ORIGINS=* esté configurado en el servicio de Ollama en EasyPanel.',
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
