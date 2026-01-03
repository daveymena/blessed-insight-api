const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
 * Función centralizada para llamar a la IA a través del backend
 */
export async function callAI(messages: AIMessage[], maxTokens: number = 2000): Promise<AIResponse> {
  const startTime = Date.now();
  console.log('📡 [Frontend] Consultando a Biblo Asistente vía Servidor...');

  try {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        prompt: lastUserMessage,
        system: systemMessage,
        maxTokens
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [Frontend] Respuesta recibida vía ${data.provider} (${Date.now() - startTime}ms)`);
      return {
        success: true,
        content: data.content,
        provider: data.provider,
        timeMs: Date.now() - startTime
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.content || `Error ${response.status}`);
    }
  } catch (error) {
    console.error('❌ [Frontend] Error de conexión con el servidor:', error);
    return {
      success: false,
      content: 'No se pudo conectar con el servicio de IA. El navegador no puede alcanzar la red interna, redirigiendo a través del servidor...',
      provider: 'error',
      timeMs: Date.now() - startTime
    };
  }
}

export async function callAIFast(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 1200);
}

export async function callAIDetailed(messages: AIMessage[]): Promise<AIResponse> {
  return callAI(messages, 3000);
}

export function getAIStatus() {
  return { groqKeys: 4, activeKey: 1, failedKeys: 0 };
}
